import { Head, Link } from '@inertiajs/react';
import { CalendarCheck, Church, HeartHandshake, TrendingUp, UserPlus, Users } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge, Card, date, money } from '@/Components/UI';
import Bars from '@/Components/Chart';

type Props = {
    showDonations: boolean;
    metrics: {
        members: number;
        activeMembers: number;
        newThisMonth: number;
        attendanceRate: number;
        givingYtd: number;
    };
    membershipTrend: { label: string; value: number }[];
    donationTrend: { label: string; value: number }[];
    recentMembers: any[];
    recentAttendance: any[];
};

export default function Dashboard(p: Props) {
    const cards = [
        ['Total members', p.metrics.members, Users, 'All member records'],
        ['Active members', p.metrics.activeMembers, HeartHandshake, 'Currently connected'],
        ['New this month', p.metrics.newThisMonth, UserPlus, 'First-time members'],
        ['30-day engagement', `${p.metrics.attendanceRate}%`, CalendarCheck, 'Unique active attendees'],
        ...(p.showDonations
            ? [['Giving this year', money(p.metrics.givingYtd), TrendingUp, 'Completed donations'] as const]
            : []),
    ] as const;

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />
            <div className="page-heading">
                <div>
                    <p className="eyebrow">MINISTRY OVERVIEW</p>
                    <h2>Church health at a glance</h2>
                    <p>Monitor people and participation from one trusted workspace.</p>
                </div>
                <Link className="btn btn-primary" href="/members/create"><UserPlus /> Add member</Link>
            </div>
            <div className="kpi-grid">
                {cards.map(([label, value, Icon, detail]) => (
                    <Card className="kpi" key={label}>
                        <div>
                            <span>{label}</span>
                            <strong>{value}</strong>
                            <small>{detail}</small>
                        </div>
                        <i><Icon /></i>
                    </Card>
                ))}
            </div>
            <div className="dashboard-grid">
                <Card className="chart-card">
                    <div className="card-head">
                        <div><p className="eyebrow">MEMBERSHIP</p><h3>Growth trend</h3></div>
                        <Badge tone="success">6 months</Badge>
                    </div>
                    <Bars data={p.membershipTrend} />
                </Card>
                {p.showDonations && (
                    <Card className="chart-card">
                        <div className="card-head">
                            <div><p className="eyebrow">GENEROSITY</p><h3>Donation trend</h3></div>
                            <Badge>USD</Badge>
                        </div>
                        <Bars data={p.donationTrend} format={(value) => value ? `$${Math.round(value)}` : '$0'} />
                    </Card>
                )}
                <Card>
                    <div className="card-head">
                        <div><p className="eyebrow">NEW CONNECTIONS</p><h3>Recent members</h3></div>
                        <Link href="/members">View all</Link>
                    </div>
                    <div className="activity-list">
                        {p.recentMembers.map((member) => (
                            <Link href={`/members/${member.id}`} key={member.id}>
                                <span className="avatar">
                                    {member.photo_url ? (
                                        <img src={member.photo_url} alt={`${member.first_name} ${member.last_name}`} />
                                    ) : (
                                        `${member.first_name[0]}${member.last_name[0]}`
                                    )}
                                </span>
                                <div><strong>{member.first_name} {member.last_name}</strong><small>Joined {date(member.join_date)}</small></div>
                                <Badge tone={member.status === 'active' ? 'success' : member.status === 'new' ? 'warning' : 'muted'}>{member.status}</Badge>
                            </Link>
                        ))}
                    </div>
                </Card>
                <Card>
                    <div className="card-head">
                        <div><p className="eyebrow">ATTENDANCE</p><h3>Latest check-ins</h3></div>
                        <Link href="/attendance">Sessions</Link>
                    </div>
                    <div className="activity-list">
                        {p.recentAttendance.length ? p.recentAttendance.map((attendance) => (
                            <div className="static" key={attendance.id}>
                                <span className="avatar"><Church /></span>
                                <div>
                                    <strong>{attendance.member ? `${attendance.member.first_name} ${attendance.member.last_name}` : attendance.guest_name || 'Guest'}</strong>
                                    <small>{date(attendance.attendance_date)} · {attendance.check_in_method.replace('_', ' ')}</small>
                                </div>
                                <Badge tone="success">{attendance.status}</Badge>
                            </div>
                        )) : <p className="muted">No check-ins recorded yet.</p>}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
