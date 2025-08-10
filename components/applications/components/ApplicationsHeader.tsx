/**
 * ApplicationsHeader — Exemplary UI/UX Redesign
 * - Zero-jank layout under your theme tokens
 * - CountUp stats, live daemon ticker, filter chips, view/density toggles
 * - Keyboard shortcuts: "/" focus search · "n" new · "e" export · "del" bulk delete
 * - Works with your CardHeader, ActionButton, ModernSearchBar
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PlusCircle,
  Download,
  Trash2,
  Filter,
  List,
  LayoutKanban,
  CalendarDays,
  Save,
  ChevronDown,
  X,
  RefreshCw,
  SlidersHorizontal,
  Settings2,
  Info,
  Star,
  Rows,
  Columns2,
  Sparkles,
  Bell
} from 'lucide-react';
import CardHeader from '../../CardHeader';
import ActionButton from '../../dashboard/ActionButton';
import ModernSearchBar from '../../ModernSearchBar';
import { Application, StatusUpdate } from '@/types';

type ViewMode = 'table' | 'kanban' | 'timeline';
type Density = 'comfortable' | 'compact';

export interface SavedView {
  id: string;
  name: string;
}

interface ApplicationsHeaderProps {
  // Data
  applications: Application[];
  applicationStats: { applications: number; interviews: number };
  statusUpdates: StatusUpdate[]; // global or per-app; global when !update.appId
  selectedRowsCount: number;

  // Handlers (existing)
  onSearch: (term: string) => void;
  onAddApplication: () => void;
  onBulkDelete: () => void;
  onExport: () => void;

  // Extras (optional, safe defaults)
  hasGlobalUpdate?: boolean;
  view?: ViewMode;
  onChangeView?: (view: ViewMode) => void;
  density?: Density;
  onChangeDensity?: (density: Density) => void;

  // Filters
  stages?: string[]; // e.g., ["Applied","Phone","Onsite","Offer","Rejected"]
  activeStageFilters?: string[];
  onToggleStageFilter?: (stage: string) => void;
  onClearAllFilters?: () => void;

  // Saved views
  savedViews?: SavedView[];
  onSelectSavedView?: (id: string) => void;
  onSaveCurrentView?: (name: string) => void;

  // Slots
  rightExtra?: React.ReactNode;
}

export function ApplicationsHeader({
  applications,
  applicationStats,
  statusUpdates,
  selectedRowsCount,
  onSearch,
  onAddApplication,
  onBulkDelete,
  onExport,
  hasGlobalUpdate = false,
  view = 'table',
  onChangeView,
  density = 'comfortable',
  onChangeDensity,
  stages = ['Applied', 'Screen', 'Technical', 'Onsite', 'Offer', 'Rejected'],
  activeStageFilters = [],
  onToggleStageFilter,
  onClearAllFilters,
  savedViews = [],
  onSelectSavedView,
  onSaveCurrentView,
  rightExtra
}: ApplicationsHeaderProps) {
  // === local ===
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [viewsOpen, setViewsOpen] = useState<boolean>(false);
  const [saveOpen, setSaveOpen] = useState<boolean>(false);
  const [newViewName, setNewViewName] = useState<string>('');
  const searchRef = useRef<HTMLInputElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  // CountUp values (safe, no reflow spam)
  const appsCount = applicationStats?.applications ?? 0;
  const interviewsCount = applicationStats?.interviews ?? 0;

  // Global ticker messages (only global)
  const globalTicker = useMemo(
    () => statusUpdates.filter(u => !u.appId).map(u => u.message),
    [statusUpdates]
  );

  // ===== keyboard shortcuts =====
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !isTypingInInput()) {
        e.preventDefault();
        if (searchRef.current) searchRef.current.focus();
      }
      if (e.key.toLowerCase() === 'n' && !isTypingInInput()) {
        e.preventDefault();
        onAddApplication?.();
      }
      if (e.key.toLowerCase() === 'e' && !isTypingInInput()) {
        e.preventDefault();
        onExport?.();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRowsCount > 0 && !isTypingInInput()) {
        e.preventDefault();
        onBulkDelete?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowsCount]);

  const stageChip = (stage: string) => {
    const active = activeStageFilters.includes(stage);
    return (
      <button
        key={stage}
        type="button"
        className={`stage-chip ${active ? 'active' : ''}`}
        onClick={() => onToggleStageFilter?.(stage)}
        aria-pressed={active}
        title={active ? `Remove filter: ${stage}` : `Filter by: ${stage}`}
      >
        <span className="dot" aria-hidden />
        <span className="label">{stage}</span>
        {active && <X className="x" size={14} aria-hidden />}
      </button>
    );
  };

  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    onSaveCurrentView?.(newViewName.trim());
    setNewViewName('');
    setSaveOpen(false);
  };

  return (
    <CardHeader
      title={
        <div className="title-wrap" role="group" aria-label="Applications header">
          <div className="title-line">
            <span className={`title-text ${hasGlobalUpdate ? 'title-pulse' : ''}`}>Applications</span>
            <span className="title-accent" aria-hidden />
            <LiveBadge active={hasGlobalUpdate || globalTicker.length > 0} />
          </div>

          <div className="stats-row" aria-label="Key stats">
            <StatPill label="Applied" value={appsCount} reduced={prefersReduced} />
            <StatPill label="Interviews" value={interviewsCount} reduced={prefersReduced} tone="accent" />
            {/* quick status summary */}
            {selectedRowsCount > 0 && (
              <span className="selection-pill" role="status" aria-live="polite">
                {selectedRowsCount} selected
              </span>
            )}
          </div>

          {/* global ticker */}
          {globalTicker.length > 0 && (
            <div className="ticker" aria-live="polite">
              <Bell size={14} aria-hidden />
              <div className="marquee">
                <div className="marquee-inner">
                  {globalTicker.map((msg, i) => (
                    <span className="tick" key={`${i}-${msg}`}>{msg}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      }
      subtitle="Track, search, filter, and act — fast."
      accentColor="var(--primary)"
      variant="default"
    >
      {/* ACTION STRIP */}
      <div className="action-strip">
        <div className="search-wrap" aria-label="Search applications">
          <ModernSearchBar
            ref={searchRef as any}
            applications={applications}
            onSearch={onSearch}
            placeholder="Search (press / to focus)…"
            className="search"
          />
        </div>

        <div className="primary-actions">
          {selectedRowsCount > 0 && (
            <ActionButton
              label={`Delete ${selectedRowsCount}`}
              icon={Trash2}
              variant="danger"
              onClick={onBulkDelete}
            />
          )}
          <ActionButton label="Export" icon={Download} variant="ghost" onClick={onExport} />
          <ActionButton label="New" icon={PlusCircle} variant="primary" onClick={onAddApplication} />
        </div>
      </div>

      {/* CONTROLS STRIP */}
      <div className="controls">
        {/* Filters */}
        <div className="filters-left">
          <button
            type="button"
            className="ghost"
            onClick={() => setFiltersOpen(v => !v)}
            aria-expanded={filtersOpen}
            aria-controls="filters-panel"
            title="Filters"
          >
            <Filter size={16} aria-hidden />
            <span>Filters</span>
            {activeStageFilters.length > 0 && <span className="count-badge" aria-label={`${activeStageFilters.length} active filters`}>{activeStageFilters.length}</span>}
            <ChevronDown size={14} className={`chev ${filtersOpen ? 'open' : ''}`} aria-hidden />
          </button>

          <div id="filters-panel" className={`filters-panel ${filtersOpen ? 'open' : ''}`}>
            <div className="chips-scroll" role="listbox" aria-label="Stage filters">
              {stages.map(stageChip)}
            </div>

            <div className="filters-actions">
              <button
                type="button"
                className="ghost subtle"
                onClick={() => onClearAllFilters?.()}
                disabled={activeStageFilters.length === 0}
                title="Clear all filters"
              >
                <X size={14} aria-hidden />
                <span>Clear</span>
              </button>

              <div className="divider" aria-hidden />

              <button type="button" className="ghost subtle" title="More filters (coming)">
                <SlidersHorizontal size={14} aria-hidden />
                <span>More</span>
              </button>

              <button type="button" className="ghost subtle" title="Daemon status">
                <RefreshCw size={14} aria-hidden />
                <span>Daemon</span>
              </button>
            </div>
          </div>
        </div>

        {/* View & density & saved views */}
        <div className="views-right">
          <div className="segmented" role="tablist" aria-label="View mode">
            <button
              role="tab"
              aria-selected={view === 'table'}
              className={`seg ${view === 'table' ? 'active' : ''}`}
              onClick={() => onChangeView?.('table')}
              title="Table"
            >
              <List size={14} aria-hidden />
              <span>Table</span>
            </button>
            <button
              role="tab"
              aria-selected={view === 'kanban'}
              className={`seg ${view === 'kanban' ? 'active' : ''}`}
              onClick={() => onChangeView?.('kanban')}
              title="Kanban"
            >
              <LayoutKanban size={14} aria-hidden />
              <span>Kanban</span>
            </button>
            <button
              role="tab"
              aria-selected={view === 'timeline'}
              className={`seg ${view === 'timeline' ? 'active' : ''}`}
              onClick={() => onChangeView?.('timeline')}
              title="Timeline"
            >
              <CalendarDays size={14} aria-hidden />
              <span>Timeline</span>
            </button>
            <span className="seg-ink" aria-hidden />
          </div>

          <div className="density" role="group" aria-label="Density">
            <button
              className={`dens ${density === 'comfortable' ? 'active' : ''}`}
              onClick={() => onChangeDensity?.('comfortable')}
              title="Comfortable"
            >
              <Rows size={14} aria-hidden />
            </button>
            <button
              className={`dens ${density === 'compact' ? 'active' : ''}`}
              onClick={() => onChangeDensity?.('compact')}
              title="Compact"
            >
              <Columns2 size={14} aria-hidden />
            </button>
          </div>

          <div className="saved">
            <button
              type="button"
              className="ghost"
              onClick={() => setViewsOpen(v => !v)}
              aria-expanded={viewsOpen}
              aria-controls="saved-views"
              title="Saved views"
            >
              <Star size={14} aria-hidden />
              <span>Views</span>
              <ChevronDown size={14} className={`chev ${viewsOpen ? 'open' : ''}`} aria-hidden />
            </button>

            <div id="saved-views" className={`menu ${viewsOpen ? 'open' : ''}`} role="menu">
              {savedViews.length === 0 && <div className="empty">No saved views</div>}
              {savedViews.map(v => (
                <button key={v.id} role="menuitem" className="row" onClick={() => { onSelectSavedView?.(v.id); setViewsOpen(false); }}>
                  <Star size={12} aria-hidden />
                  <span>{v.name}</span>
                </button>
              ))}
              <div className="save-area">
                <input
                  type="text"
                  className="save-input"
                  placeholder="Save current as…"
                  value={newViewName}
                  onChange={e => setNewViewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveView(); }}
                  aria-label="New view name"
                />
                <button className="save-btn" onClick={handleSaveView} title="Save view">
                  <Save size={14} aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <button className="ghost subtle" title="Header settings">
            <Settings2 size={14} aria-hidden />
            <span className="sr-only">Settings</span>
          </button>

          {rightExtra}
        </div>
      </div>

      {/* A11y hint line */}
      <div className="hints" role="note" aria-label="Keyboard shortcuts">
        <Info size={14} aria-hidden />
        <span><kbd>/</kbd> focus search · <kbd>n</kbd> new · <kbd>e</kbd> export · <kbd>Del</kbd> bulk delete</span>
        <span className="grow" />
        <span className="powered"><Sparkles size={13} aria-hidden /> Smart extrapolation on</span>
      </div>

      <style jsx>{`
        /* ===== title region ===== */
        .title-wrap {
          display: grid;
          gap: var(--space-2);
          align-items: start;
          min-width: 0;
        }
        .title-line {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          position: relative;
        }
        .title-text {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          font-weight: var(--font-extrabold);
          letter-spacing: var(--tracking-tighter);
          line-height: var(--leading-tight);
          display: inline-flex;
          align-items: center;
        }
        .title-accent {
          height: 6px;
          width: 42px;
          border-radius: var(--radius-full);
          background: linear-gradient(90deg, var(--primary), var(--accent, var(--primary-light)));
          opacity: .2;
          transform: translateY(4px);
        }
        .title-pulse { animation: pulseTitle 2.4s ease-in-out infinite; }
        @keyframes pulseTitle {
          0%,100% { text-shadow: none; }
          50% { text-shadow: 0 0 24px rgba(var(--color-primary-rgb, 0,112,243), .25); }
        }

        /* live badge */
        .live {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 2px 8px;
          border-radius: 999px;
          background: var(--surface);
          border: 1px solid var(--border);
          font-size: var(--text-xs);
          line-height: 1;
          color: var(--text-secondary);
        }
        .live .dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 0 0 rgba(34,197,94,.6);
          animation: ${prefersReduced ? 'none' : 'ping'} 1.6s infinite;
        }
        @keyframes ping {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,.6) }
          70% { box-shadow: 0 0 0 10px rgba(34,197,94,0) }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0) }
        }

        /* stats */
        .stats-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        .stat {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border: 1px solid var(--border);
          background: var(--card);
          border-radius: var(--border-radius-full);
          font-size: var(--text-sm);
        }
        .stat .val {
          font-variant-numeric: tabular-nums;
          font-weight: var(--font-semibold);
        }
        .selection-pill {
          margin-left: 4px;
          padding: 6px 10px;
          background: var(--highlight-primary);
          border-radius: 999px;
          font-size: var(--text-xs);
          color: var(--text-inverse);
        }

        /* ticker */
        .ticker {
          display: flex; gap: 8px; align-items: center;
          padding: 6px 10px; border: 1px dashed var(--border);
          border-radius: var(--border-radius-full);
          max-width: 100%;
          overflow: hidden;
          background: var(--surface);
          color: var(--text-secondary);
        }
        .marquee { overflow: hidden; position: relative; flex: 1; }
        .marquee-inner {
          display: inline-flex; gap: 24px; white-space: nowrap;
          animation: ${prefersReduced ? 'none' : 'marq'} 22s linear infinite;
        }
        .tick { opacity: .9; }
        @keyframes marq { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }

        /* action strip */
        .action-strip {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr auto;
          align-items: center;
          margin-top: var(--space-3);
        }
        .search-wrap { min-width: 260px; }
        .primary-actions {
          display: inline-flex; gap: 8px; align-items: center; justify-content: flex-end;
          flex-wrap: wrap;
        }

        /* controls strip */
        .controls {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: start;
          margin-top: 10px;
        }
        .filters-left {
          display: flex; align-items: center; gap: 8px;
          min-width: 0;
        }
        .ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: background var(--duration-150) var(--ease-out), border-color var(--duration-150) var(--ease-out);
        }
        .ghost:hover { background: var(--card-hover); border-color: var(--border-strong); }
        .ghost.subtle { opacity: .9; }

        .chev { transition: transform var(--duration-150) var(--ease-out); }
        .chev.open { transform: rotate(180deg); }

        .filters-panel {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
          border: 1px solid var(--border);
          background: var(--card);
          border-radius: var(--border-radius);
          padding: 8px;
          margin-left: 8px;
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height var(--duration-300) var(--ease-out), opacity var(--duration-150) var(--ease-out);
        }
        .filters-panel.open { max-height: 200px; opacity: 1; }

        .chips-scroll {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin;
        }
        .stage-chip {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 10px; border: 1px solid var(--border);
          background: var(--surface); border-radius: var(--border-radius-full);
          white-space: nowrap; font-size: var(--text-sm);
          transition: transform var(--duration-150) var(--ease-out), background var(--duration-150) var(--ease-out), border-color var(--duration-150) var(--ease-out);
        }
        .stage-chip:hover { transform: translateY(-1px); }
        .stage-chip.active {
          background: var(--highlight-primary);
          border-color: color-mix(in oklab, var(--color-primary, var(--primary)) 40%, var(--border));
          color: var(--text-inverse);
        }
        .stage-chip .dot {
          width: 8px; height: 8px; border-radius: 999px; background: var(--primary);
        }
        .stage-chip.active .dot { background: var(--text-inverse); }
        .stage-chip .x { opacity: .9; }

        .filters-actions {
          display: inline-flex; align-items: center; gap: 8px; justify-self: end;
        }
        .divider { width: 1px; height: 22px; background: var(--border); }

        /* right controls */
        .views-right {
          display: inline-flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end;
        }
        .segmented {
          position: relative;
          display: inline-flex;
          border: 1px solid var(--border);
          background: var(--surface);
          border-radius: var(--border-radius);
          padding: 4px;
          gap: 4px;
        }
        .seg {
          position: relative;
          z-index: 1;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: var(--text-sm);
          cursor: pointer;
          color: var(--text-secondary);
        }
        .seg.active { color: var(--text-primary); font-weight: var(--font-medium); }
        .seg-ink {
          position: absolute; inset: 4px auto 4px 4px;
          width: calc(33.333% - 4px); border-radius: 6px;
          background: color-mix(in oklab, var(--primary) 12%, transparent);
          transition: transform var(--duration-200) var(--ease-out);
        }
        :global(.seg[aria-selected="true"]) {}
        /* move ink based on view */
        ${view === 'table' ? `.seg-ink { transform: translateX(0%); }` : ''}
        ${view === 'kanban' ? `.seg-ink { transform: translateX(100%); }` : ''}
        ${view === 'timeline' ? `.seg-ink { transform: translateX(200%); }` : ''}

        .density {
          display: inline-flex; gap: 6px; padding: 4px; border: 1px solid var(--border); border-radius: var(--border-radius);
          background: var(--surface);
        }
        .dens {
          width: 30px; height: 28px; display: grid; place-items: center;
          border-radius: 6px; border: 1px solid transparent; cursor: pointer;
        }
        .dens.active { background: var(--card-hover); border-color: var(--border-strong); }

        .saved { position: relative; }
        .menu {
          position: absolute; right: 0; top: calc(100% + 6px);
          width: 260px; background: var(--card); border: 1px solid var(--border);
          border-radius: var(--border-radius-lg); padding: 8px;
          box-shadow: var(--shadow);
          opacity: 0; transform: translateY(-6px);
          pointer-events: none;
          transition: opacity var(--duration-150) var(--ease-out), transform var(--duration-150) var(--ease-out);
          z-index: 20;
        }
        .menu.open { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .row {
          width: 100%; display: flex; gap: 8px; align-items: center;
          padding: 8px; border-radius: 8px; border: 1px solid transparent;
          font-size: var(--text-sm);
        }
        .row:hover { background: var(--surface); border-color: var(--border); }
        .empty {
          padding: 12px; font-size: var(--text-sm); color: var(--text-secondary);
        }
        .save-area {
          display: grid; grid-template-columns: 1fr auto; gap: 8px; padding-top: 6px; border-top: 1px dashed var(--border);
          margin-top: 6px;
        }
        .save-input {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px;
          color: var(--text-primary); font-size: var(--text-sm);
        }
        .save-btn {
          display: grid; place-items: center; padding: 6px 10px; border: 1px solid var(--border); background: var(--surface);
          border-radius: 8px; cursor: pointer;
        }
        .save-btn:hover { background: var(--card-hover); }

        /* hints */
        .hints {
          display: flex; align-items: center; gap: 10px; margin-top: 8px;
          font-size: var(--text-xs); color: var(--text-secondary);
        }
        .hints .grow { flex: 1; }
        .powered { display: inline-flex; gap: 6px; align-items: center; opacity: .9; }
        kbd {
          font-family: var(--font-code); border: 1px solid var(--border); border-bottom-width: 2px;
          padding: 0 5px; border-radius: 4px; background: var(--surface);
        }

        /* responsive */
        @media (max-width: 900px) {
          .controls { grid-template-columns: 1fr; }
          .views-right { justify-content: flex-start; }
          .action-strip { grid-template-columns: 1fr; }
        }
      `}</style>
    </CardHeader>
  );
}

/* ====== subcomponents ====== */

function LiveBadge({ active }: { active: boolean }) {
  return (
    <span className="live" aria-live="polite">
      <span className="dot" />
      {active ? 'live' : 'idle'}
      <style jsx>{``}</style>
    </span>
  );
}

function StatPill({
  label,
  value,
  tone = 'default',
  reduced
}: {
  label: string;
  value: number;
  tone?: 'default' | 'accent';
  reduced: boolean;
}) {
  return (
    <span className="stat">
      <span className="val"><CountUp n={value} reduced={reduced} /></span>
      <span className="lab">{label}</span>
      <style jsx>{`
        .lab { color: var(--text-secondary); }
        :global(.stat.accent) {}
      `}</style>
    </span>
  );
}

/** count-up that respects prefers-reduced-motion */
function CountUp({ n, duration = 900, reduced }: { n: number; duration?: number; reduced: boolean }) {
  const [v, setV] = useState(0);
  const target = Math.max(0, n);
  useEffect(() => {
    if (reduced) { setV(target); return; }
    const start = performance.now();
    const from = 0;
    const anim = (t: number) => {
      const e = Math.min(1, (t - start) / duration);
      const eased = easeOutCubic(e);
      setV(Math.round(from + (target - from) * eased));
      if (e < 1) rAF = requestAnimationFrame(anim);
    };
    let rAF = requestAnimationFrame(anim);
    return () => cancelAnimationFrame(rAF);
  }, [target, duration, reduced]);
  return <>{v.toLocaleString()}</>;
}

/* ====== utils ====== */
function easeOutCubic(x: number) { return 1 - Math.pow(1 - x, 3); }
function isTypingInInput() {
  const a = document.activeElement as HTMLElement | null;
  if (!a) return false;
  const tag = a.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || a.getAttribute('role') === 'textbox' || (a as any).isContentEditable;
}
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduced;
}

export default ApplicationsHeader;
