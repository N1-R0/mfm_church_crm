<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PrivacyController extends Controller
{
    public function showPrivacy()
    {
        return Inertia::render('Privacy/Privacy');
    }

    public function showTerms()
    {
        return Inertia::render('Privacy/Terms');
    }

    public function acknowledge(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(403);
        }

        $user->forceFill([
            'privacy_notice_version' => $request->input('privacy_notice_version', 'v1'),
            'privacy_acknowledged_at' => now(),
            'terms_version' => $request->input('terms_version', 'v1'),
            'terms_accepted_at' => now(),
        ])->save();

        return back()->with('status', 'Privacy acknowledgement saved.');
    }
}
