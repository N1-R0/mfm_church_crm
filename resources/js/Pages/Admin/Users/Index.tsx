import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock3, Mail, Search, ShieldCheck, UserPlus, UserRoundX } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge, Button, Card, Input, Select } from '@/Components/UI';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    last_login_at?: string | null;
    created_at?: string | null;
};

type InvitationRow = {
    id: number;
    email: string;
    role: string;
    status: string;
    invited_by?: { id: number; name: string; email: string } | null;
    last_sent_at?: string | null;
    expires_at?: string | null;
    send_count?: number;
    created_at?: string | null;
};

type Props = {
    users: UserRow[];
    invitations: InvitationRow[];
    summary: {
        total: number;
        active: number;
        pending: number;
        suspended: number;
    };
    filters: {
        search: string;
        role: string;
        status: string;
    };
};

const roleLabels: Record<string, string> = {
    admin: 'Admin',
    pastor: 'Pastor',
    staff: 'Staff',
};

const statusTone = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'suspended') return 'danger';
    if (status === 'pending') return 'warning';
    return 'muted';
};

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'U';

export default function Index({ users, invitations, summary, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [showInvite, setShowInvite] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: '', role: 'staff' });

    const applyFilters = (extra: Record<string, string> = {}) => {
        router.get('/admin/users', { ...filters, search, ...extra }, { preserveState: true, replace: true });
    };

    const submitInvite = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.post('/admin/users/invitations', inviteForm, {
            onSuccess: () => {
                setShowInvite(false);
                setInviteForm({ email: '', role: 'staff' });
            },
        });
    };

    return (
        <AppLayout title="User administration">
            <Head title="User administration" />

            <div className="page-heading">
                <div>
                    <p className="eyebrow">ADMINISTRATION</p>
                    <h2>Application users</h2>
                    <p>Manage access, invitations, and account status across the church CRM.</p>
                </div>
                <Button type="button" onClick={() => setShowInvite(true)}>
                    <UserPlus />
                    Invite user
                </Button>
            </div>

            <div className="kpi-grid">
                <Card className="kpi">
                    <div>
                        <span>Total users</span>
                        <strong>{summary.total}</strong>
                        <small>All active access records</small>
                    </div>
                    <i><ShieldCheck /></i>
                </Card>
                <Card className="kpi">
                    <div>
                        <span>Active users</span>
                        <strong>{summary.active}</strong>
                        <small>Currently active accounts</small>
                    </div>
                    <i><CheckCircle2 /></i>
                </Card>
                <Card className="kpi">
                    <div>
                        <span>Pending invitations</span>
                        <strong>{summary.pending}</strong>
                        <small>Awaiting account setup</small>
                    </div>
                    <i><Clock3 /></i>
                </Card>
                <Card className="kpi">
                    <div>
                        <span>Suspended users</span>
                        <strong>{summary.suspended}</strong>
                        <small>Temporarily disabled</small>
                    </div>
                    <i><UserRoundX /></i>
                </Card>
            </div>

            <Card className="filters">
                <div className="search-input">
                    <Search />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => {
                        if (event.key === 'Enter') applyFilters();
                    }} placeholder="Search by name or email" />
                </div>
                <Select value={filters.role ?? ''} onChange={(event) => applyFilters({ role: event.target.value })}>
                    <option value="">All roles</option>
                    <option value="admin">Admin</option>
                    <option value="pastor">Pastor</option>
                    <option value="staff">Staff</option>
                </Select>
                <Select value={filters.status ?? ''} onChange={(event) => applyFilters({ status: event.target.value })}>
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </Select>
                <Button type="button" variant="secondary" onClick={() => applyFilters()}>
                    Apply
                </Button>
            </Card>

            <Card className="table-card">
                <div className="card-head">
                    <div>
                        <p className="eyebrow">ACCOUNTS</p>
                        <h3>Users</h3>
                    </div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last login</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="member-cell">
                                            <span className="avatar">{initials(user.name)}</span>
                                            <span>
                                                <strong>{user.name}</strong>
                                                <small>{user.email}</small>
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <Select value={user.role} onChange={(event) => router.patch(`/admin/users/${user.id}/role`, { role: event.target.value })}>
                                            <option value="admin">Admin</option>
                                            <option value="pastor">Pastor</option>
                                            <option value="staff">Staff</option>
                                        </Select>
                                    </td>
                                    <td>
                                        <Badge tone={statusTone(user.status)}>{user.status}</Badge>
                                    </td>
                                    <td>{formatDate(user.last_login_at)}</td>
                                    <td>{formatDate(user.created_at)}</td>
                                    <td>
                                        <Button type="button" variant="secondary" onClick={() => router.patch(`/admin/users/${user.id}/status`, { status: user.status === 'suspended' ? 'active' : 'suspended' })}>
                                            {user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card className="table-card" style={{ marginTop: '20px' }}>
                <div className="card-head">
                    <div>
                        <p className="eyebrow">INVITATIONS</p>
                        <h3>Pending invites</h3>
                    </div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Invited by</th>
                                <th>Sent</th>
                                <th>Expires</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invitations.length ? invitations.map((invitation) => (
                                <tr key={invitation.id}>
                                    <td>{invitation.email}</td>
                                    <td>{roleLabels[invitation.role] ?? invitation.role}</td>
                                    <td><Badge tone={statusTone(invitation.status)}>{invitation.status}</Badge></td>
                                    <td>{invitation.invited_by?.name ?? '—'}</td>
                                    <td>{formatDate(invitation.last_sent_at)}</td>
                                    <td>{formatDate(invitation.expires_at)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Button type="button" variant="secondary" onClick={() => router.post(`/admin/users/invitations/${invitation.id}/resend`)}>
                                                Resend
                                            </Button>
                                            <Button type="button" variant="danger" onClick={() => router.delete(`/admin/users/invitations/${invitation.id}`)}>
                                                Revoke
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="empty">
                                            <ShieldCheck />
                                            <strong>No invitations pending</strong>
                                            <p>Invitations will show here once sent.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {showInvite && (
                <div className="modal-backdrop">
                    <Card className="modal" style={{ width: 'min(90vw, 520px)' }}>
                        <div className="card-head">
                            <div>
                                <p className="eyebrow">INVITE USER</p>
                                <h3>Send an invite</h3>
                            </div>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowInvite(false)}>Close</button>
                        </div>
                        <p style={{ marginBottom: '18px', color: 'var(--muted)' }}>
                            The user will receive an invitation to MFM Youth Church CRM and will be able to complete account setup using the email address and assigned role.
                        </p>
                        <form onSubmit={submitInvite} style={{ display: 'grid', gap: '12px' }}>
                            <label className="field">
                                <span>Email address</span>
                                <Input type="email" value={inviteForm.email} onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))} required />
                            </label>
                            <label className="field">
                                <span>Assigned role</span>
                                <Select value={inviteForm.role} onChange={(event) => setInviteForm((current) => ({ ...current, role: event.target.value }))}>
                                    <option value="admin">Admin</option>
                                    <option value="pastor">Pastor</option>
                                    <option value="staff">Staff</option>
                                </Select>
                            </label>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <Button type="button" variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
                                <Button type="submit"><Mail /> Send invite</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
