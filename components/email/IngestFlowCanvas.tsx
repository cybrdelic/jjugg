import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface LogEntry {
  id: number; created_at: string; phase: string; status: string; uid: number | null; message_id?: string | null;
  subject?: string | null; class?: string | null; vendor?: string | null; detail?: string | null;
}

interface TreeNode {
  id: string;
  label: string;
  meta?: string;
  children: TreeNode[];
  x?: number; y?: number; depth?: number;
  phase?: string; status?: string; ts?: number;
}

const PHASE_ORDER = ['run','imap','search','fetch','parse'];

function buildTree(logs: LogEntry[]): TreeNode[] {
  // Group logs into runs using run/start and run/end
  const runs: { start: LogEntry; end?: LogEntry; events: LogEntry[] }[] = [];
  let current: { start: LogEntry; end?: LogEntry; events: LogEntry[] } | null = null;
  const sorted = [...logs].sort((a,b)=>a.id-b.id);
  for (const l of sorted) {
    if (l.phase === 'run' && l.status === 'start') {
      if (current) runs.push(current);
      current = { start: l, events: [] };
    } else if (l.phase === 'run' && l.status === 'end') {
      if (current) { current.end = l; runs.push(current); current = null; }
    } else if (current) {
      current.events.push(l);
    }
  }
  if (current) runs.push(current);

  return runs.map((r, idx) => {
    const root: TreeNode = {
      id: `run-${r.start.id}`,
      label: `Run #${idx+1}`,
      meta: new Date(r.start.created_at).toLocaleTimeString(),
      children: [],
      phase: 'run', status: r.start.status, ts: Date.parse(r.start.created_at)
    };
    const phaseGroups: Record<string, LogEntry[]> = {};
    for (const e of r.events) {
      (phaseGroups[e.phase] ||= []).push(e);
    }
    // Order phases
    for (const phase of PHASE_ORDER) {
      if (!phaseGroups[phase]) continue;
      const phaseNode: TreeNode = { id: `${root.id}-${phase}`, label: phase, children: [], phase, status: '', ts: 0 };
      root.children.push(phaseNode);
      if (phase === 'fetch') {
        // group by uid
        const byUid: Record<string, LogEntry[]> = {};
        for (const e of phaseGroups[phase]) {
          const key = (e.uid ?? 'unknown').toString();
            (byUid[key] ||= []).push(e);
        }
        Object.entries(byUid).forEach(([uid, arr]) => {
          const child: TreeNode = { id: `${phaseNode.id}-uid-${uid}`, label: `uid ${uid}`, children: [], phase, status: '', ts: Date.parse(arr[0].created_at) };
          arr.forEach(ev => child.children.push({ id: `${child.id}-${ev.id}`, label: `${ev.status}`, meta: ev.detail || ev.subject || '', children: [], phase, status: ev.status, ts: Date.parse(ev.created_at) }));
          phaseNode.children.push(child);
        });
      } else if (phase === 'parse') {
        // group parse events: batch_start/item_start/parsed/error/batch_end
        let currentItem: TreeNode | null = null;
        for (const ev of phaseGroups[phase]) {
          if (ev.status === 'item_start') {
            currentItem = { id: `${phaseNode.id}-item-${ev.uid}-${ev.id}`, label: `item ${ev.uid}`, meta: ev.subject || '', children: [], phase, status: ev.status, ts: Date.parse(ev.created_at) };
            phaseNode.children.push(currentItem);
          } else if (['parsed','error'].includes(ev.status) && currentItem) {
            currentItem.children.push({ id: `${currentItem.id}-${ev.id}`, label: ev.status, meta: ev.detail || '', children: [], phase, status: ev.status, ts: Date.parse(ev.created_at) });
          } else {
            // generic event
            phaseNode.children.push({ id: `${phaseNode.id}-${ev.id}`, label: ev.status, meta: ev.detail || '', children: [], phase, status: ev.status, ts: Date.parse(ev.created_at) });
          }
        }
      } else {
        phaseGroups[phase].forEach(ev => {
          phaseNode.children.push({ id: `${phaseNode.id}-${ev.id}`, label: ev.status, meta: ev.detail || '', children: [], phase, status: ev.status, ts: Date.parse(ev.created_at) });
        });
      }
    }
    return root;
  });
}

function layoutTrees(trees: TreeNode[]): TreeNode[] {
  // Simple top-down layout per run; runs stacked vertically with spacing
  const nodeHeight = 40; const vGap = 24; const hGap = 140;
  let yCursor = 0;
  const assign = (node: TreeNode, depth: number, y: number): number => {
    node.depth = depth;
    node.x = depth * hGap;
    let currentY = y;
    if (!node.children.length) {
      node.y = currentY;
      return currentY + nodeHeight;
    }
    // layout children first
    for (const c of node.children) {
      currentY = assign(c, depth + 1, currentY);
    }
    // center this node over its children
    const minY = Math.min(...node.children.map(c => c.y!));
    const maxY = Math.max(...node.children.map(c => c.y!));
    node.y = (minY + maxY) / 2;
    return currentY + vGap;
  };
  for (const root of trees) {
    const after = assign(root, 0, yCursor);
    yCursor = after + vGap * 2; // extra space before next run
  }
  return trees;
}

const statusColor = (phase?: string, status?: string) => {
  if (phase === 'imap') return '#2d7ff9';
  if (phase === 'search') return '#8b5cf6';
  if (phase === 'fetch') return '#10b981';
  if (phase === 'parse') {
    if (status === 'error') return '#dc2626';
    if (status === 'parsed') return '#059669';
    return '#f59e0b';
  }
  if (phase === 'run') return '#6366f1';
  return '#64748b';
};

export const IngestFlowCanvas: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [autoCenter, setAutoCenter] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/email/logs?limit=500');
      const data = await res.json();
      if (!data.error) setLogs(data.logs || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLogs(); const id = setInterval(fetchLogs, 4000); return () => clearInterval(id); }, [fetchLogs]);

  const trees = useMemo(() => layoutTrees(buildTree(logs)), [logs]);
  const allNodes = useMemo(() => trees.flatMap(function collect(n: TreeNode): TreeNode[] { return [n, ...n.children.flatMap(collect)]; }), [trees]);

  useEffect(() => {
    if (!autoCenter || !allNodes.length || !containerRef.current) return;
    const minX = Math.min(...allNodes.map(n => n.x!));
    const maxX = Math.max(...allNodes.map(n => n.x!));
    const minY = Math.min(...allNodes.map(n => n.y!));
    const maxY = Math.max(...allNodes.map(n => n.y!));
    const w = maxX - minX + 200; const h = maxY - minY + 200;
    const cw = containerRef.current.clientWidth; const ch = containerRef.current.clientHeight;
    const s = Math.min(1, Math.min(cw / w, ch / h));
    setScale(s);
    setOffset({ x: (cw - (minX + maxX) * s) / 2, y: (ch - (minY + maxY) * s) / 2 });
  }, [autoCenter, allNodes]);

  const handleWheel: React.WheelEventHandler = e => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setScale(s => Math.min(2.5, Math.max(0.2, s + delta)));
    setAutoCenter(false);
  };
  const handleMouseDown: React.MouseEventHandler = e => {
    dragRef.current = { x: offset.x, y: offset.y, startX: e.clientX, startY: e.clientY };
    setAutoCenter(false);
  };
  const handleMouseMove: React.MouseEventHandler = e => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset({ x: dragRef.current.x + dx, y: dragRef.current.y + dy });
  };
  const handleMouseUp = () => { dragRef.current = null; };

  const edges = useMemo(() => {
    const es: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
    function walk(node: TreeNode) {
      node.children.forEach(c => {
        es.push({ x1: node.x!, y1: node.y!, x2: c.x!, y2: c.y!, key: `${node.id}-${c.id}` });
        walk(c);
      });
    }
    trees.forEach(walk);
    return es;
  }, [trees]);

  return (
    <div className="flow-canvas-wrapper">
      <div className="toolbar">
        <button onClick={fetchLogs} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
        <button onClick={() => { setAutoCenter(true); }}>Auto-Center</button>
        <span className="meta">Nodes: {allNodes.length}</span>
        <span className="meta">Scale: {scale.toFixed(2)}</span>
      </div>
      <div
        className="canvas"
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
      >
        <div className="inner" data-transform={`translate(${offset.x}px, ${offset.y}px) scale(${scale})`} style={{transform:`translate(${offset.x}px, ${offset.y}px) scale(${scale})`}}>
          <svg className="edges" width="100%" height="100%">
            {edges.map(e => (
              <line key={e.key} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#334155" strokeWidth={2} strokeOpacity={0.35} />
            ))}
          </svg>
          {allNodes.map(n => (
            <div
              key={n.id}
              className="node"
              style={{ left: n.x, top: n.y }}
              title={n.meta || ''}
            >
              <div className="pill" style={{ background: statusColor(n.phase, n.status) }} />
              <div className="label">{n.label}</div>
              {n.meta && <div className="meta-text">{n.meta.slice(0,60)}</div>}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .flow-canvas-wrapper { position:relative; width:100%; height:100%; display:flex; flex-direction:column; }
        .toolbar { display:flex; gap:12px; padding:8px 12px; background:var(--surface); border-bottom:1px solid var(--border); align-items:center; }
        .toolbar button { background:var(--surface-alt,#1e293b); border:1px solid var(--border); padding:4px 10px; border-radius:6px; font-size:12px; cursor:pointer; }
        .toolbar button:disabled { opacity:.5; cursor:default; }
        .meta { font-size:11px; color:var(--text-tertiary); }
        .canvas { flex:1; position:relative; background:radial-gradient(circle at 40% 35%, #1e2533, #0f141d); overflow:hidden; cursor:grab; }
        .canvas:active { cursor:grabbing; }
  .inner { position:relative; width:100%; height:100%; transform-origin:0 0; }
        .node { position:absolute; transform:translate(-50%, -50%); min-width:110px; max-width:180px; background:rgba(15,23,42,0.78); backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,0.08); padding:6px 8px 6px 8px; border-radius:10px; box-shadow:0 2px 4px rgba(0,0,0,.3); color:var(--text-primary,#f1f5f9); font-size:11px; line-height:1.25; }
        .node .label { font-weight:600; margin-bottom:2px; font-size:11px; }
        .node .meta-text { font-size:10px; opacity:.7; }
        .pill { width:10px; height:10px; border-radius:50%; margin-bottom:4px; box-shadow:0 0 0 2px #0f172a; }
        @media (max-width:800px){ .node { min-width:90px; } }
      `}</style>
    </div>
  );
};

export default IngestFlowCanvas;
