<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class InvitationController extends Controller
{
    public function acceptForm(string $token)
    {
        $invitation = UserInvitation::query()->where('status', 'pending')->get()->first(function ($candidate) use ($token) {
            return Hash::check($token, $candidate->token_hash);
        });

        if (! $invitation || $invitation->expires_at->isPast()) {
            abort(404, 'Invitation not found or expired.');
        }

        return Inertia::render('Auth/InvitationAccept', [
            'email' => $invitation->email,
            'role' => $invitation->role,
        ]);
    }

    public function accept(Request $request, string $token): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
        ]);

        $invitation = UserInvitation::query()->where('status', 'pending')->get()->first(function ($candidate) use ($token) {
            return Hash::check($token, $candidate->token_hash);
        });

        if (! $invitation || $invitation->expires_at->isPast() || $invitation->status !== 'pending') {
            throw ValidationException::withMessages(['token' => 'This invitation is no longer valid.']);
        }

        if (User::query()->where('email', $invitation->email)->exists()) {
            throw ValidationException::withMessages(['email' => 'A user account already exists for this email.']);
        }

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $invitation->email,
            'password' => $validated['password'],
            'role' => $invitation->role,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $invitation->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        $user->update(['last_login_at' => now()]);

        auth()->login($user);

        return redirect()->route('dashboard');
    }
}
