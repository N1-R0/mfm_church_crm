import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge, Card, date } from '@/Components/UI';

type Values = Record<string, unknown> | null;

type Log = {
    id: number;
    event: string;
    auditable_type: string;
    auditable_id: string;
    old_values: Values;
    new_values: Values;
    created_at: string;
    user?: { name: string; email: string } | null;
};

type Props = {
    logs: {
        data: Log[];
        current_page: number;
        last_page: number;
        total: number;
    };
};

const eventTone = (event: string) => {
    const value = event.toLowerCase();
    if (value.includes('delete') || value.includes('suspend') || value.includes('revoke')) return 'danger';
    if (value.includes('create') || value.includes('invite') || value.includes('activate')) return 'success';
    if (value.includes('update') || value.includes('change')) return 'warning';
    return 'muted';
};

const compactId = (id: string) => (id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id);

const readableEvent = (event: string) => event.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const modelName = (type: string) => type.split('\\').at(-1) ?? type;

function ChangeSummary({ oldValues, newValues }: { oldValues: Values; newValues: Values }) {
    const oldData = oldValues ?? {};
    const newData = newValues ?? {};
    const keys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]));
    const changed = keys.filter((key) => JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]));

    if (!changed.length) return <span className="audit-empty">No field details</span>;

    return (
        <div className="audit-changes">
            {changed.slice(0, 3).map((key) => (
                <div className="audit-change" key={key}>
                    <span className="audit-change-key">{key.replaceAll('_', ' ')}</span>
                    {key in oldData && <span className="audit-before">{String(oldData[key] ?? 'Empty')}</span>}
                    {key in oldData && key in newData && <span className="audit-arrow">→</span>}
                    {key in newData && <span className="audit-after">{String(newData[key] ?? 'Empty')}</span>}
                </div>
            ))}
            {changed.length > 3 && <span className="audit-more">+{changed.length - 3} more changes</span>}
        </div>
    );
}

export default function Index({ logs }: Props) {
    return (
        <AppLayout title="Audit log">
            <Head title="Audit Log" />

            <style>{`
                .audit-shell{display:grid;gap:20px}.audit-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:16px}.audit-title{margin:5px 0 6px;font-size:30px;letter-spacing:-.03em}.audit-copy{margin:0;color:var(--muted);max-width:650px}.audit-count{padding:10px 14px;border:1px solid var(--line);border-radius:14px;background:var(--surface);color:var(--text);font-size:13px;font-weight:700;white-space:nowrap}.audit-card{overflow:hidden}.audit-table{width:100%;border-collapse:collapse}.audit-table th{padding:12px 16px;background:var(--surface-2);border-bottom:1px solid var(--line);text-align:left;color:var(--muted);font-size:11px;letter-spacing:.08em;text-transform:uppercase}.audit-table td{padding:16px;border-bottom:1px solid var(--line);vertical-align:top}.audit-table tbody tr:last-child td{border-bottom:0}.audit-event{display:flex;align-items:center;gap:10px}.audit-dot{width:9px;height:9px;border-radius:999px;background:#94a3b8;box-shadow:0 0 0 4px var(--surface-2)}.audit-dot.success{background:#16a34a;box-shadow:0 0 0 4px rgba(22,163,74,.15)}.audit-dot.warning{background:#d97706;box-shadow:0 0 0 4px rgba(217,119,6,.15)}.audit-dot.danger{background:#dc2626;box-shadow:0 0 0 4px rgba(220,38,38,.15)}.audit-dot.muted{background:#64748b;box-shadow:0 0 0 4px rgba(100,116,139,.15)}.audit-actor{display:grid;gap:2px}.audit-actor strong{color:var(--text)}.audit-actor span,.audit-meta{color:var(--muted);font-size:12px}.audit-record{display:grid;gap:4px}.audit-record strong{color:var(--text)}.audit-record code{color:var(--muted);font-size:11px}.audit-changes{display:grid;gap:6px;max-width:520px}.audit-change{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px}.audit-change-key{font-weight:700;color:var(--text);text-transform:capitalize}.audit-before{padding:3px 7px;border-radius:7px;background:var(--danger-bg);color:var(--danger);text-decoration:line-through}.audit-after{padding:3px 7px;border-radius:7px;background:var(--success-bg);color:var(--success)}.audit-arrow{color:var(--muted)}.audit-more,.audit-empty{color:var(--muted);font-size:12px}.audit-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px;border-top:1px solid var(--line);color:var(--muted);font-size:12px}.audit-empty-state{text-align:center;padding:44px 18px;color:var(--muted)}.audit-empty-state strong{display:block;color:var(--text);margin-bottom:5px}.audit-mobile{display:none}@media(max-width:850px){.audit-heading{align-items:flex-start;flex-direction:column}.audit-desktop{display:none}.audit-mobile{display:grid;gap:12px}.audit-mobile-item{padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--surface);display:grid;gap:13px}.audit-mobile-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.audit-footer{align-items:flex-start;flex-direction:column}}`}</style>

            <div className="audit-shell">
                <div className="audit-heading">
                    <div>
                        <p className="eyebrow">ADMINISTRATION</p>
                        <h2 className="audit-title">Audit log</h2>
                        <p className="audit-copy">A traceable history of important administrative and application activity across Church CRM.</p>
                    </div>
                    <div className="audit-count">{logs.total.toLocaleString()} total records</div>
                </div>

                <Card className="audit-card">
                    {logs.data.length ? (
                        <>
                            <div className="audit-desktop table-wrap">
                                <table className="audit-table">
                                    <thead>
                                        <tr>
                                            <th>Activity</th>
                                            <th>Actor</th>
                                            <th>Record</th>
                                            <th>Changes</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.data.map((log) => {
                                            const tone = eventTone(log.event);
                                            return (
                                                <tr key={log.id}>
                                                    <td>
                                                        <div className="audit-event">
                                                            <span className={`audit-dot ${tone}`} />
                                                            <Badge tone={tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'muted'}>{readableEvent(log.event)}</Badge>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="audit-actor">
                                                            <strong>{log.user?.name ?? 'System'}</strong>
                                                            {log.user?.email && <span>{log.user.email}</span>}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="audit-record">
                                                            <strong>{modelName(log.auditable_type)}</strong>
                                                            <code title={log.auditable_id}>{compactId(log.auditable_id)}</code>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <ChangeSummary oldValues={log.old_values} newValues={log.new_values} />
                                                    </td>
                                                    <td>
                                                        <span className="audit-meta">{date(log.created_at)}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="audit-mobile">
                                {logs.data.map((log) => (
                                    <div className="audit-mobile-item" key={log.id}>
                                        <div className="audit-mobile-top">
                                            <div className="audit-event">
                                                <span className={`audit-dot ${eventTone(log.event)}`} />
                                                <Badge tone={eventTone(log.event) === 'danger' ? 'danger' : eventTone(log.event) === 'success' ? 'success' : eventTone(log.event) === 'warning' ? 'warning' : 'muted'}>{readableEvent(log.event)}</Badge>
                                            </div>
                                            <span className="audit-meta">{date(log.created_at)}</span>
                                        </div>
                                        <div className="audit-actor">
                                            <strong>{log.user?.name ?? 'System'}</strong>
                                            {log.user?.email && <span>{log.user.email}</span>}
                                        </div>
                                        <div className="audit-record">
                                            <strong>{modelName(log.auditable_type)}</strong>
                                            <code title={log.auditable_id}>{compactId(log.auditable_id)}</code>
                                        </div>
                                        <ChangeSummary oldValues={log.old_values} newValues={log.new_values} />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="audit-empty-state">
                            <strong>No audit records yet</strong>
                            Important system and admin activity will appear here.
                        </div>
                    )}
                    <div className="audit-footer">
                        <span>Page {logs.current_page} of {logs.last_page}</span>
                        <span>{logs.total.toLocaleString()} total events</span>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
