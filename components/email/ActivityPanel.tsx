import { useRef } from "react";

interface LogRow {
  id: number;
  created_at: string;
  phase: string;
  status: string;
  detail?: string;
  subject?: string;
}

interface GroupedLog {
  phase: string;
  rows: LogRow[];
}

interface ActivityPanelProps {
  logs: LogRow[];
  logsLoading: boolean;
  live: boolean;
  phaseFilters: Set<string>;
  logsGrouped: boolean;
  logPhases: Array<[string, { count: number; errors?: number }]>;
  groupedLogs: GroupedLog[] | null;
  filteredLogs: LogRow[];
  recentNewLogIdsRef: React.MutableRefObject<Set<number>>;
  togglePhaseFilter: (phase: string) => void;
  setPhaseFilters: (filters: Set<string>) => void;
  setLogsGrouped: (grouped: boolean) => void;
}

export default function ActivityPanel({
  logs,
  logsLoading,
  live,
  phaseFilters,
  logsGrouped,
  logPhases,
  groupedLogs,
  filteredLogs,
  recentNewLogIdsRef,
  togglePhaseFilter,
  setPhaseFilters,
  setLogsGrouped,
}: ActivityPanelProps) {
  const rightLogsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="logs-panel" ref={rightLogsRef}>
      <div className="logs-header">
        <h2>Activity</h2>
        <div className="logs-meta">
          {logsLoading
            ? "Loading…"
            : `${filteredLogs.length} events${live ? " • live" : ""}`}
        </div>
      </div>

      <div className="activity-toolbar">
        <div className="phase-chips" aria-label="Phase filters">
          {logPhases.map(([p, info]) => {
            const active = phaseFilters.has(p);
            return (
              <button
                key={p}
                className={`chip ${active ? "on" : ""}`}
                onClick={() => togglePhaseFilter(p)}
                title={`${info.count} events${
                  info.errors ? ` • ${info.errors} errors` : ""
                }`}
              >
                <span className="p">{p}</span>
                <span className="cnt">{info.count}</span>
                {info.errors ? (
                  <span className="err" aria-label="errors">
                    {info.errors}
                  </span>
                ) : null}
              </button>
            );
          })}
          {!!phaseFilters.size && (
            <button
              className="chip clear"
              onClick={() => setPhaseFilters(new Set())}
            >
              clear
            </button>
          )}
        </div>

        <div className="view-toggles">
          <label className="vt">
            <input
              type="checkbox"
              checked={logsGrouped}
              onChange={(e) => setLogsGrouped(e.target.checked)}
            />{" "}
            grouped
          </label>
        </div>
      </div>

      {logsGrouped && groupedLogs && (
        <div className="groups">
          {groupedLogs.map((g) => (
            <details key={g.phase} open>
              <summary>
                <span className="phase">{g.phase}</span>
                <span className="count">{g.rows.length}</span>
              </summary>
              <div className="g-body">
                {g.rows.map((l) => (
                  <div
                    key={l.id}
                    className={`log-row ${l.phase} ${
                      recentNewLogIdsRef.current.has(l.id) ? "new" : ""
                    }`}
                  >
                    <div className="log-time">
                      {new Date(l.created_at).toLocaleTimeString()}
                    </div>
                    <div className="log-status">{l.status}</div>
                    <div className="log-detail">
                      {l.detail || l.subject || ""}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))}
          {!groupedLogs.length && !logsLoading && (
            <div className="dim logs-empty">No log events.</div>
          )}
        </div>
      )}

      {!logsGrouped && (
        <div className="flat-logs">
          {filteredLogs.map((l) => (
            <div
              key={l.id}
              className={`log-row ${l.phase} ${
                recentNewLogIdsRef.current.has(l.id) ? "new" : ""
              }`}
            >
              <div className="log-time">
                {new Date(l.created_at).toLocaleTimeString()}
              </div>
              <div className="log-phase">{l.phase}</div>
              <div className="log-status">{l.status}</div>
              <div className="log-detail">{l.detail || l.subject || ""}</div>
            </div>
          ))}
          {!filteredLogs.length && !logsLoading && (
            <div className="dim logs-empty">No log events.</div>
          )}
        </div>
      )}
    </div>
  );
}
