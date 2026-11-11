<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\UserInvitationMail;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserAdministrationController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $query = User::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('role'), function ($query) use ($request) {
                $query->where('role', $request->role);
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            });

        $users = $query
            ->orderByDesc('created_at')
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                    'last_login_at' => $user->last_login_at?->toISOString(),
                    'created_at' => $user->created_at?->toISOString(),
                    'email_verified_at' => $user->email_verified_at?->toISOString(),
                ];
            })
            ->values();

        $invitations = UserInvitation::query()
            ->with('invitedByUser:id,name,email')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (UserInvitation $invitation) {
                return [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'role' => $invitation->role,
                    'status' => $invitation->status,
                    'invited_by' => $invitation->invitedByUser ? [
                        'id' => $invitation->invitedByUser->id,
                        'name' => $invitation->invitedByUser->name,
                        'email' => $invitation->invitedByUser->email,
                    ] : null,
                    'last_sent_at' => $invitation->last_sent_at?->toISOString(),
                    'expires_at' => $invitation->expires_at?->toISOString(),
                    'send_count' => $invitation->send_count,
                    'accepted_at' => $invitation->accepted_at?->toISOString(),
                    'revoked_at' => $invitation->revoked_at?->toISOString(),
                    'created_at' => $invitation->created_at?->toISOString(),
                ];
            })
            ->values();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'invitations' => $invitations,
            'summary' => [
                'total' => User::query()->count(),
                'active' => User::query()->where('status', 'active')->count(),
                'pending' => UserInvitation::query()->where('status', 'pending')->count(),
                'suspended' => User::query()->where('status', 'suspended')->count(),
            ],
            'filters' => [
                'search' => (string) $request->query('search', ''),
                'role' => (string) $request->query('role', ''),
                'status' => (string) $request->query('status', ''),
            ],
        ]);
    }

    public function storeInvitation(Request $request)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', Rule::in(User::ROLES)],
        ]);

        $email = strtolower(trim($validated['email']));

        if (User::query()->where('email', $email)->exists()) {
            return back()->withErrors(['email' => 'A user account already exists for this email.']);
        }

        if (UserInvitation::query()->where('email', $email)->where('status', 'pending')->where('expires_at', '>', now())->exists()) {
            return back()->withErrors(['email' => 'A pending invitation already exists for this email.']);
        }

        $token = Str::random(64);
        $invitation = UserInvitation::query()->create([
            'email' => $email,
            'role' => $validated['role'],
            'token_hash' => Hash::make($token),
            'status' => 'pending',
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(2),
            'last_sent_at' => now(),
            'send_count' => 1,
        ]);

        $this->sendInvitationEmail($invitation, $token);

        AuditLog::query()->create([
            'user_id' => $request->user()->id,
            'event' => 'user_invited',
            'auditable_type' => UserInvitation::class,
            'auditable_id' => (string) $invitation->getKey(),
            'old_values' => null,
            'new_values' => ['email' => $invitation->email, 'role' => $invitation->role, 'status' => $invitation->status],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Invitation created.');
    }

    public function resendInvitation(Request $request, UserInvitation $invitation)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        if ($invitation->status !== 'pending') {
            return back()->withErrors(['invitation' => 'Only pending invitations can be resent.']);
        }

        if ($invitation->last_sent_at && $invitation->last_sent_at->diffInSeconds(now()) < 60) {
            return back()->withErrors(['invitation' => 'Please wait before resending this invitation.']);
        }

        $token = Str::random(64);

        $invitation->update([
            'token_hash' => Hash::make($token),
            'last_sent_at' => now(),
            'send_count' => $invitation->send_count + 1,
            'expires_at' => now()->addDays(2),
            'status' => 'pending',
        ]);

        $this->sendInvitationEmail($invitation, $token);

        AuditLog::query()->create([
            'user_id' => $request->user()->id,
            'event' => 'invitation_resent',
            'auditable_type' => UserInvitation::class,
            'auditable_id' => (string) $invitation->getKey(),
            'old_values' => ['send_count' => max(0, $invitation->getOriginal('send_count') ?? 0)],
            'new_values' => ['send_count' => $invitation->fresh()->send_count, 'status' => $invitation->fresh()->status],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Invitation resent.');
    }

    public function revokeInvitation(Request $request, UserInvitation $invitation)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $invitation->update([
            'status' => 'revoked',
            'revoked_at' => now(),
        ]);

        AuditLog::query()->create([
            'user_id' => $request->user()->id,
            'event' => 'invitation_revoked',
            'auditable_type' => UserInvitation::class,
            'auditable_id' => (string) $invitation->getKey(),
            'old_values' => ['status' => $invitation->getOriginal('status')],
            'new_values' => ['status' => 'revoked'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Invitation revoked.');
    }

    public function updateRole(Request $request, User $user)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $role = $request->validate(['role' => ['required', Rule::in(User::ROLES)]])['role'];

        if ($user->role === 'admin' && $role !== 'admin' && User::query()->where('role', 'admin')->where('status', 'active')->count() <= 1) {
            return back()->withErrors(['role' => 'The final active administrator cannot be demoted.']);
        }

        $previous = $user->role;
        $user->update(['role' => $role]);

        AuditLog::query()->create([
            'user_id' => $request->user()->id,
            'event' => 'user_role_changed',
            'auditable_type' => User::class,
            'auditable_id' => (string) $user->getKey(),
            'old_values' => ['role' => $previous],
            'new_values' => ['role' => $role],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'User role updated.');
    }

    public function updateStatus(Request $request, User $user)
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $status = $request->validate(['status' => ['required', Rule::in(['active', 'suspended'])]])['status'];

        if ($user->role === 'admin' && $status === 'suspended' && User::query()->where('role', 'admin')->where('status', 'active')->count() <= 1) {
            return back()->withErrors(['status' => 'The final active administrator cannot be suspended.']);
        }

        $oldStatus = $user->status;
        $user->update(['status' => $status]);

        AuditLog::query()->create([
            'user_id' => $request->user()->id,
            'event' => $status === 'suspended' ? 'user_suspended' : 'user_reactivated',
            'auditable_type' => User::class,
            'auditable_id' => (string) $user->getKey(),
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $status],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', $status === 'suspended' ? 'User suspended.' : 'User reactivated.');
    }

    public function suspend(Request $request, User $user)
    {
        return $this->updateStatus($request->merge(['status' => 'suspended']), $user);
    }

    public function reactivate(Request $request, User $user)
    {
        return $this->updateStatus($request->merge(['status' => 'active']), $user);
    }

    protected function sendInvitationEmail(UserInvitation $invitation, string $token): void
    {
        Mail::to($invitation->email)->send(new UserInvitationMail($invitation, $token));
    }
}
