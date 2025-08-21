import AppLayout from '@/components/AppLayout';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { useSnackBar } from '@/contexts/SnackBarContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Copy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function DbAdmin() {
  const { mode, toggleMode } = useTheme();
  const { showSuccess, showError } = useSnackBar();
  const flags = useFeatureFlags();
  const [tables, setTables] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string>('');
  const [schema, setSchema] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [sql, setSql] = useState<string>('SELECT name FROM sqlite_master WHERE type=\'table\' ORDER BY name;');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/db-admin/tables').then(r => r.json()).then(d => setTables(d.tables || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeTable) return;
    fetch(`/api/db-admin/table-info?table=${encodeURIComponent(activeTable)}`)
      .then(r => r.json())
      .then(d => setSchema(d))
      .catch(() => {});
    runQuery(`SELECT * FROM ${activeTable} LIMIT 50;`);
  }, [activeTable]);

  const runQuery = async (q?: string) => {
    setError('');
    const body = { sql: q ?? sql };
    const r = await fetch('/api/db-admin/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) { setError(d.error || 'Query failed'); setRows([]); return; }
    setRows(d.rows || []);
  };

  const columns = useMemo(() => rows.length ? Object.keys(rows[0]) : [], [rows]);

  const copyText = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Copied', label);
    } catch (err: any) {
      showError('Copy failed', err?.message || 'Clipboard not available');
    }
  };

  const rowsToCSV = (data: any[]) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const esc = (v: any) => {
      const s = v === null || v === undefined ? '' : String(v);
      if (s.includes('"') || s.includes(',') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const lines = [headers.join(',')];
    for (const row of data) lines.push(headers.map(h => esc((row as any)[h])).join(','));
    return lines.join('\n');
  };

  const content = (
    <div className="dbadmin-root">
      <header className="dbadmin-header">
        <div>
          <h1>Dev DB Admin (SQLite)</h1>
          <p>Dev-only helper; disabled in production.</p>
        </div>
        <button className="btn-secondary" onClick={toggleMode} aria-label="Toggle theme">{mode === 'dark' ? 'Light mode' : 'Dark mode'}</button>
      </header>

      <div className="dbadmin-grid">
        <aside className="dbadmin-aside">
          <div className="section-title row space-between">
            <span>Tables</span>
            {activeTable && (
              <button
                className="btn-quiet"
                onClick={() => copyText('Table name', activeTable)}
                title="Copy table name"
              >
                <Copy size={16} />
              </button>
            )}
          </div>
          <ul className="table-list">
            {tables.map(t => (
              <li key={t}>
                <button
                  className={`table-item ${activeTable===t ? 'active' : ''}`}
                  onClick={() => setActiveTable(t)}
                >{t}</button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="dbadmin-main">
          <div className="two-col">
            <section>
              <div className="section-title row space-between">
                <span>Query</span>
                <div className="row gap">
                  <button className="btn-quiet" onClick={()=>copyText('SQL', sql)} title="Copy SQL"><Copy size={16} /></button>
                </div>
              </div>
              <textarea className="sql-box" value={sql} onChange={(e)=>setSql(e.target.value)} />
              <div className="row gap">
                <button className="btn-primary" onClick={()=>runQuery()}>Run</button>
                {activeTable && <button className="btn-secondary" onClick={()=>setSql(`SELECT * FROM ${activeTable} LIMIT 50;`)}>Select * from {activeTable}</button>}
              </div>
              {error && <div className="error-text">{error}</div>}
            </section>
            <section>
              <div className="section-title row space-between">
                <span>Schema</span>
                {schema && (
                  <div className="row gap">
                    <button className="btn-quiet" onClick={()=>copyText('Schema JSON', JSON.stringify(schema, null, 2))} title="Copy schema JSON"><Copy size={16} /></button>
                  </div>
                )}
              </div>
              <pre className="schema-box">{schema ? JSON.stringify(schema, null, 2) : 'Select a table'}</pre>
            </section>
          </div>

          <section className="rows-section">
            <div className="section-title row space-between">
              <span>Rows {rows.length ? `(${rows.length})` : ''}</span>
              {!!rows.length && (
                <div className="row gap">
                  <button className="btn-quiet" onClick={()=>copyText('Rows (JSON)', JSON.stringify(rows, null, 2))} title="Copy rows as JSON"><Copy size={16} /></button>
                  <button className="btn-quiet" onClick={()=>copyText('Rows (CSV)', rowsToCSV(rows))} title="Copy rows as CSV"><Copy size={16} /></button>
                </div>
              )}
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {columns.map(c => <th key={c}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      {columns.map(c => <td key={c}>{String(r[c] ?? '')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

  <style jsx>{`
        .dbadmin-root { padding: 16px; font-family: var(--font-interface, ui-sans-serif, system-ui, Arial); color: var(--text-primary); background: var(--background); }
        .dbadmin-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .dbadmin-header h1 { font-size: 20px; font-weight: 600; margin: 0; }
        .dbadmin-header p { margin: 4px 0 0; opacity: 0.75; }

        .dbadmin-grid { display: grid; grid-template-columns: 240px 1fr; gap: 16px; margin-top: 16px; }
        .dbadmin-aside { border-right: 1px solid var(--border); padding-right: 12px; }
  .section-title { font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .row { display: flex; align-items: center; }
  .space-between { justify-content: space-between; }
        .table-list { list-style: none; padding: 0; margin: 0; }
        .table-item { width: 100%; text-align: left; border: 1px solid transparent; padding: 6px 8px; border-radius: 6px; cursor: pointer; background: transparent; color: var(--text-primary); }
        .table-item:hover { background: var(--background-secondary); }
        .table-item.active { background: var(--background-secondary); border-color: var(--border); }

        .dbadmin-main { min-width: 0; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .sql-box { width: 100%; height: 140px; font-family: var(--font-code, ui-monospace, SFMono-Regular, Consolas, 'Courier New', monospace); font-size: 12px; background: var(--surface); color: var(--text-primary); border: 1px solid var(--border); border-radius: 6px; padding: 8px; }
        .schema-box { background: var(--surface-elevated); color: var(--text-primary); border: 1px solid var(--border); border-radius: 6px; padding: 8px; max-height: 180px; overflow: auto; }
        .rows-section { margin-top: 16px; }
        .table-wrap { overflow: auto; border: 1px solid var(--border); border-radius: 6px; }
        .data-table { border-collapse: collapse; width: 100%; font-size: 13px; }
        .data-table th { text-align: left; position: sticky; top: 0; background: var(--background-secondary); color: var(--text-primary); border-bottom: 1px solid var(--border); padding: 8px; }
        .data-table td { border-bottom: 1px solid var(--border); padding: 8px; color: var(--text-primary); }
        .row.gap { display: flex; gap: 8px; margin-top: 8px; }
        .btn-primary { background: var(--primary); color: #fff; border: 1px solid var(--primary); border-radius: 6px; padding: 6px 10px; cursor: pointer; }
        .btn-primary:hover { background: var(--primary-dark); border-color: var(--primary-dark); }
        .btn-secondary { background: transparent; color: var(--text-primary); border: 1px solid var(--border); border-radius: 6px; padding: 6px 10px; cursor: pointer; }
        .btn-secondary:hover { background: var(--background-secondary); }
  .btn-quiet { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 4px 6px; border-radius: 6px; background: transparent; color: var(--text-primary); border: 1px solid var(--border); cursor: pointer; }
  .btn-quiet:hover { background: var(--background-secondary); }
        .error-text { color: var(--error); margin-top: 8px; }

        @media (max-width: 900px) {
          .dbadmin-grid { grid-template-columns: 1fr; }
          .dbadmin-aside { border-right: none; border-bottom: 1px solid var(--border); padding-right: 0; padding-bottom: 12px; }
          .two-col { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );

  if (!flags.ENABLE_DEV_DB_ADMIN) {
    return (
      <AppLayout currentSection="dashboard-home">
        <div className="dbadmin-root">
          <div className="dbadmin-header"><h1>Dev DB Admin</h1></div>
          <p style={{ color: 'var(--text-secondary)' }}>This tool is disabled. Enable “Dev DB Admin (internal)” in Settings → Features to proceed.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentSection="dashboard-home">
      {content}
    </AppLayout>
  );
}
