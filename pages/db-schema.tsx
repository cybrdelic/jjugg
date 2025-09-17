import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import GlassButton from '../components/GlassButton';

export default function DBSchemaPage() {
    const [tables, setTables] = useState<any[]>([]);
    const [tableData, setTableData] = useState<{ [key: string]: any[] }>({});
    const [expanded, setExpanded] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchSchema = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/db/schema');
            const data = await res.json();
            setTables(data.tables || []);
        } catch (err) {
            setError('Failed to fetch schema');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchema();
    }, []);

    return (
        <AppLayout currentSection="dashboard-home">
            <div className="db-schema-page">
                <h1 className="page-title">Database Schema Inspector</h1>
                <p className="page-subtitle">View all tables and columns in your database, anytime.</p>
                <GlassButton onClick={fetchSchema} disabled={loading}>
                    {loading ? 'Refreshing…' : 'Refresh Schema'}
                </GlassButton>
                {error && <div className="error">{error}</div>}
                <div className="schema-tree">
                    {tables.length === 0 && !loading && <div className="empty">No tables found.</div>}
                    {tables.map(table => (
                        <details
                            key={table.name}
                            className="table-accordion"
                            open={expanded === table.name}
                            onClick={e => {
                                e.stopPropagation();
                                if (expanded !== table.name) {
                                    setExpanded(table.name);
                                    if (!tableData[table.name]) {
                                        fetch(`/api/db/table-data?table=${table.name}`)
                                            .then(res => res.json())
                                            .then(data => setTableData(td => ({ ...td, [table.name]: data.rows || [] })));
                                    }
                                } else {
                                    setExpanded(null);
                                }
                            }}
                        >
                            <summary className="table-summary">{table.name}</summary>
                            <ul className="columns-list">
                                {table.columns.map((col: any) => (
                                    <li key={col.name} className="column-item">
                                        <span className="column-name">{col.name}</span>
                                        <span className="column-type">{col.type}</span>
                                        {col.pk && <span className="column-pk">PK</span>}
                                        {col.notnull && <span className="column-notnull">NOT NULL</span>}
                                    </li>
                                ))}
                            </ul>
                            {tableData[table.name] && tableData[table.name].length > 0 && (
                                <div className="table-preview">
                                    <div className="preview-title">Preview (first 20 rows):</div>
                                    <div className="preview-scroll">
                                        <table className="preview-table">
                                            <thead>
                                                <tr>
                                                    {Object.keys(tableData[table.name][0]).map(col => (
                                                        <th key={col}>{col}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData[table.name].map((row, i) => (
                                                    <tr key={i}>
                                                        {Object.values(row).map((val, j) => (
                                                            <td key={j}>{String(val)}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </details>
                    ))}
                </div>
            </div>
            <style jsx>{`
        .db-schema-page {
          padding: 32px 0;
          max-width: 900px;
          margin: 0 auto;
        }
        .page-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .page-subtitle {
          color: #888;
          margin-bottom: 24px;
        }
        .schema-tree {
          margin-top: 24px;
        }
        .table-accordion {
          background: rgba(255,255,255,0.08);
          border-radius: 10px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.06);
          margin-bottom: 10px;
          padding: 0;
        }
        .table-preview {
          margin-top: 10px;
        }
        .preview-title {
          font-size: 0.95em;
          color: #888;
          margin-bottom: 4px;
        }
        .preview-scroll {
          overflow-x: auto;
        }
        .preview-table {
          border-collapse: collapse;
          width: 100%;
          font-size: 0.95em;
        }
        .preview-table th, .preview-table td {
          border: 1px solid #eee;
          padding: 4px 8px;
          text-align: left;
        }
        .preview-table th {
          background: #f5f7fa;
          font-weight: 600;
        }
        .table-summary {
          font-size: 1.2em;
          font-weight: 600;
          padding: 14px 22px;
          cursor: pointer;
        }
        .columns-list {
          list-style: none;
          margin: 0;
          padding: 0 22px 14px 22px;
        }
        .column-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1em;
          padding: 6px 0;
        }
        .column-name {
          font-weight: 500;
        }
        .column-type {
          color: #888;
        }
        .column-pk {
          background: #4f8cff;
          color: #fff;
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 0.9em;
          margin-left: 6px;
        }
        .column-notnull {
          background: #ffb84f;
          color: #fff;
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 0.9em;
          margin-left: 6px;
        }
        .error {
          color: #c00;
          margin: 16px 0;
        }
      `}</style>
        </AppLayout>
    );
}
