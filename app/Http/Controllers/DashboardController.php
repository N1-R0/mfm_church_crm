<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\Donation;
use App\Models\Member;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $now = now();
        $showDonations = (bool) config('features.donations');
        $months = collect(range(5, 0))->map(fn ($i) => $now->copy()->subMonths($i)->startOfMonth());
        $membershipTrend = $months->map(fn (Carbon $month) => [
            'label' => $month->format('M'),
            'value' => Member::where('join_date', '<=', $month->copy()->endOfMonth())->count(),
        ]);
        $donationTrend = $showDonations
            ? $months->map(fn (Carbon $month) => [
                'label' => $month->format('M'),
                'value' => (float) Donation::whereBetween('donation_date', [$month, $month->copy()->endOfMonth()])
                    ->where('status', 'completed')
                    ->sum('amount'),
            ])
            : collect();
        $attendance = AttendanceRecord::where('attendance_date', '>=', $now->copy()->subDays(30));
        $activeMembers = Member::where('status', 'active')->count();
        $attendanceRate = $activeMembers > 0
            ? round(($attendance->distinct('member_id')->count('member_id') / $activeMembers) * 100, 1)
            : 0;

        return Inertia::render('Dashboard', [
            'showDonations' => $showDonations,
            'metrics' => [
                'members' => Member::count(),
                'activeMembers' => $activeMembers,
                'newThisMonth' => Member::whereBetween('join_date', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])->count(),
                'attendanceRate' => $attendanceRate,
                'givingYtd' => $showDonations
                    ? (float) Donation::whereYear('donation_date', $now->year)
                        ->where('status', 'completed')
                        ->sum('amount')
                    : 0,
            ],
            'membershipTrend' => $membershipTrend,
            'donationTrend' => $donationTrend,
            'recentMembers' => Member::latest()->limit(5)->get(['id', 'first_name', 'last_name', 'status', 'join_date', 'photo_url']),
            'recentAttendance' => AttendanceRecord::with('member:id,first_name,last_name')
                ->latest('check_in_time')
                ->limit(6)
                ->get(),
        ]);
    }
}
