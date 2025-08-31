import { useRef } from "react";

interface ProtocolRow {
  id: number;
  created_at: string;
  status: string;
  detail: string;
}

interface StatsRunMetrics {
  start?: string;
  end?: string | null;
  in_progress?: boolean;
  current?: string | null;
  duration_ms?: number | null;
  fetch?: { stored: number; skipped_non_relevant: number };
  parse?: { parsed: number; errors: number; pending_queue: number };
  openai?: { tokens: number; cost_usd: number };
  protocol?: { count: number; verbose: boolean };
  env?: {
    mailbox: string;
    batch_limit: number;
    max_initial_sync: number;
    include_alerts: boolean;
  };
}

interface ProtocolPanelProps {
  protocol: ProtocolRow[];
  filteredProtocol: ProtocolRow[];
  stats?: { run?: StatsRunMetrics } | null;
}

export default function ProtocolPanel({
  protocol,
  filteredProtocol,
  stats,
}: ProtocolPanelProps) {
  const protocolPanelRef = useRef<HTMLDivElement>(null);

  return (
    <div className="protocol-panel" ref={protocolPanelRef}>
      <div className="protocol-header">
        <h2>
          IMAP{" "}
          {stats?.run?.protocol?.verbose ? "Protocol (verbose)" : "Protocol"}
        </h2>
        <div className="logs-meta">{filteredProtocol.length} lines</div>
      </div>

      <div className="protocol-body">
        {filteredProtocol.map((p) => (
          <div key={p.id} className="proto-row">
            <span className="t">
              {new Date(p.created_at).toLocaleTimeString()}
            </span>
            <span className="lvl">{p.status}</span>
            <span className="m">{p.detail}</span>
          </div>
        ))}
        {!filteredProtocol.length && (
          <div className="dim proto-empty">
            No protocol events. Set EMAIL_IMAP_VERBOSE=true then ingest.
          </div>
        )}
      </div>
    </div>
  );
}
