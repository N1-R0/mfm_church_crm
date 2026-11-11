<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Mail\OtpChallengeMail;
use App\Models\LoginOtpChallenge;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();

        if (config('auth.otp_required', false) === true) {
            Auth::logout();
            $this->issueOtpChallenge($user, $request->session()->getId());
            $request->session()->put('login_otp_user_id', $user->getKey());

            return redirect()->route('login.otp');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function otpChallenge(Request $request): Response
    {
        $userId = $request->session()->get('login_otp_user_id');
        $user = $userId ? User::find($userId) : null;

        if (! $user || $user->status !== 'active') {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/OtpChallenge', ['email' => $user->email]);
    }

    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => ['required', 'digits:6'],
        ]);

        $userId = $request->session()->get('login_otp_user_id');
        $user = $userId ? User::find($userId) : null;

        if (! $user || $user->status !== 'active') {
            return redirect()->route('login')->withErrors(['otp' => 'Please sign in again to continue.']);
        }

        $challenge = LoginOtpChallenge::query()
            ->where('user_id', $user->id)
            ->where('session_id', $request->session()->getId())
            ->whereNull('used_at')
            ->latest('expires_at')
            ->first();

        if (! $challenge || now()->isAfter($challenge->expires_at)) {
            return back()->withErrors(['otp' => 'This code has expired or has already been used.']);
        }

        if ($challenge->attempts_remaining <= 0) {
            return back()->withErrors(['otp' => 'Too many attempts. Please request a new code.']);
        }

        if (! Hash::check((string) $request->otp, $challenge->otp_hash)) {
            $challenge->decrement('attempts_remaining');

            return back()->withErrors(['otp' => 'The code is incorrect.']);
        }

        $challenge->update(['used_at' => now()]);

        $request->session()->forget(['login_otp_user_id']);
        Auth::login($user);
        $request->session()->regenerate();
        $user->update(['last_login_at' => now()]);

        return redirect()->intended(route('dashboard'));
    }

    public function resendOtp(Request $request): RedirectResponse
    {
        $userId = $request->session()->get('login_otp_user_id');
        $user = $userId ? User::find($userId) : null;

        if (! $user || $user->status !== 'active') {
            return redirect()->route('login');
        }

        $recentChallenge = LoginOtpChallenge::query()
            ->where('user_id', $user->id)
            ->where('session_id', $request->session()->getId())
            ->latest('sent_at')
            ->first();

        if ($recentChallenge && $recentChallenge->sent_at && $recentChallenge->sent_at->diffInSeconds(now()) < 60) {
            return back()->withErrors(['otp' => 'Please wait a moment before requesting a new code.']);
        }

        $this->issueOtpChallenge($user, $request->session()->getId());

        return back()->with('status', 'A new sign-in code has been sent.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    protected function issueOtpChallenge(User $user, string $sessionId): LoginOtpChallenge
    {
        LoginOtpChallenge::query()
            ->where('user_id', $user->id)
            ->where('session_id', $sessionId)
            ->whereNull('used_at')
            ->update(['used_at' => now(), 'expires_at' => now()]);

        $otp = strval(random_int(100000, 999999));
        $challenge = LoginOtpChallenge::query()->create([
            'user_id' => $user->id,
            'session_id' => $sessionId,
            'otp_hash' => Hash::make($otp),
            'expires_at' => now()->addMinutes(5),
            'attempts_remaining' => 5,
            'sent_at' => now(),
            'resend_at' => now(),
        ]);

        Mail::to($user->email)->send(new OtpChallengeMail($user, $otp));

        return $challenge;
    }
}
