<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\UserAdministrationController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\InvitationController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberActivityController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\PublicCheckInController;
use App\Models\UserInvitation;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

Route::bind('invitation', function (string $value): UserInvitation {
    if (! Str::isUuid($value)) {
        abort(404);
    }

    return UserInvitation::query()->whereKey($value)->firstOrFail();
});

Route::get('/health', fn () => response()->json(['status' => 'ok', 'application' => 'MFM Youth Church CRM']))->name('health');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->middleware('throttle:6,1');
    Route::get('/login/otp', [AuthenticatedSessionController::class, 'otpChallenge'])->name('login.otp');
    Route::post('/login/otp', [AuthenticatedSessionController::class, 'verifyOtp'])->middleware('throttle:10,1')->name('login.otp.verify');
    Route::post('/login/otp/resend', [AuthenticatedSessionController::class, 'resendOtp'])->middleware('throttle:3,1')->name('login.otp.resend');

    Route::get('/forgot-password', [PasswordResetController::class, 'showLinkRequestForm'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])->middleware('throttle:6,1')->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:6,1')->name('password.update');

    Route::get('/register', fn () => abort(403, 'Registration is invitation-only.'))->name('register');
    Route::post('/register', fn () => abort(403, 'Registration is invitation-only.'));

    Route::get('/accept-invitation/{token}', [InvitationController::class, 'acceptForm'])->name('invitation.accept');
    Route::post('/accept-invitation/{token}', [InvitationController::class, 'accept'])->name('invitation.accept.store');
});

Route::get('/check-in/{token}', [PublicCheckInController::class, 'show'])->name('check-in.show');
Route::get('/check-in/{token}/members', [PublicCheckInController::class, 'search'])->middleware('throttle:30,1')->name('check-in.search');
Route::post('/check-in/{token}', [PublicCheckInController::class, 'checkIn'])->middleware('throttle:10,1')->name('check-in.store');
Route::post('/check-in/{token}/register', [PublicCheckInController::class, 'register'])->middleware('throttle:5,1')->name('check-in.register');

Route::middleware('auth')->group(function () {
    Route::redirect('/', '/dashboard');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/privacy', [PrivacyController::class, 'showPrivacy'])->name('privacy');
    Route::get('/terms', [PrivacyController::class, 'showTerms'])->name('terms');
    Route::post('/privacy/acknowledge', [PrivacyController::class, 'acknowledge'])->name('privacy.acknowledge');

    Route::resource('members', MemberController::class);
    Route::post('/members/{member}/photo', [MemberController::class, 'updatePhoto'])->name('members.photo.update');
    Route::post('/members/{member}/donations', [MemberActivityController::class, 'donation'])->name('members.donations.store');
    Route::post('/members/{member}/communications', [MemberActivityController::class, 'communication'])->name('members.communications.store');
    Route::post('/members/{member}/pastoral-notes', [MemberActivityController::class, 'pastoralNote'])->name('members.pastoral-notes.store');

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [UserAdministrationController::class, 'index'])->name('admin.users.index');
        Route::post('/users/invitations', [UserAdministrationController::class, 'storeInvitation'])->name('admin.users.invitations.store');
        Route::post('/users/invite', [UserAdministrationController::class, 'storeInvitation'])->name('admin.users.invite');
        Route::post('/users/invitations/{invitation}/resend', [UserAdministrationController::class, 'resendInvitation'])->name('admin.users.invitations.resend');
        Route::post('/users/{invitation}/resend', [UserAdministrationController::class, 'resendInvitation'])->name('admin.users.resend');
        Route::delete('/users/invitations/{invitation}', [UserAdministrationController::class, 'revokeInvitation'])->name('admin.users.invitations.destroy');
        Route::post('/users/{invitation}/revoke', [UserAdministrationController::class, 'revokeInvitation'])->name('admin.users.revoke');
        Route::patch('/users/{user}/role', [UserAdministrationController::class, 'updateRole'])->name('admin.users.role');
        Route::patch('/users/{user}/status', [UserAdministrationController::class, 'updateStatus'])->name('admin.users.status');
        Route::post('/users/{user}/suspend', [UserAdministrationController::class, 'suspend'])->name('admin.users.suspend');
        Route::post('/users/{user}/reactivate', [UserAdministrationController::class, 'reactivate'])->name('admin.users.reactivate');
        Route::get('/audit-log', [AuditLogController::class, 'index'])->name('admin.audit-log.index');
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('admin.audit-logs.index');
    });

    Route::middleware('role:admin,staff,pastor')->group(function () {
        Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
        Route::post('/attendance', [AttendanceController::class, 'store'])->name('attendance.store');
        Route::patch('/attendance/{session}/status', [AttendanceController::class, 'status'])->name('attendance.status');
    });
});
