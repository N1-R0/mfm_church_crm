<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;
use Tests\TestCase;

class InvitationUuidTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_invitation_uses_uuid_primary_key(): void
    {
        $user = User::factory()->create();
        $invitation = UserInvitation::query()->create([
            'email' => 'invite@example.com',
            'role' => 'staff',
            'token_hash' => Hash::make(Str::random(64)),
            'status' => 'pending',
            'invited_by' => $user->id,
            'expires_at' => now()->addDays(2),
            'last_sent_at' => now(),
            'send_count' => 1,
        ]);

        $this->assertFalse($invitation->getIncrementing());
        $this->assertSame('string', $invitation->getKeyType());
        $this->assertTrue(Uuid::isValid($invitation->getKey()));
    }

    public function test_admin_can_resend_pending_uuid_invitation(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $invitation = UserInvitation::query()->create([
            'email' => 'resend@example.com',
            'role' => 'staff',
            'token_hash' => Hash::make(Str::random(64)),
            'status' => 'pending',
            'invited_by' => $admin->id,
            'expires_at' => now()->addDays(2),
            'last_sent_at' => now()->subMinutes(65),
            'send_count' => 1,
        ]);

        $before = $invitation->token_hash;

        $this->actingAs($admin)
            ->post("/admin/users/invitations/{$invitation->id}/resend")
            ->assertRedirect();

        $invitation->refresh();
        $this->assertNotSame($before, $invitation->token_hash);
        $this->assertSame('pending', $invitation->status);
        $this->assertSame(2, $invitation->send_count);
        Mail::assertSentCount(1);
    }

    public function test_admin_can_revoke_pending_uuid_invitation(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $invitation = UserInvitation::query()->create([
            'email' => 'revoke@example.com',
            'role' => 'staff',
            'token_hash' => Hash::make(Str::random(64)),
            'status' => 'pending',
            'invited_by' => $admin->id,
            'expires_at' => now()->addDays(2),
            'last_sent_at' => now(),
            'send_count' => 1,
        ]);

        $this->actingAs($admin)
            ->delete("/admin/users/invitations/{$invitation->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('user_invitations', ['id' => $invitation->id, 'status' => 'revoked']);
    }

    public function test_accepted_invitation_cannot_be_resent(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $invitation = UserInvitation::query()->create([
            'email' => 'accepted@example.com',
            'role' => 'staff',
            'token_hash' => Hash::make(Str::random(64)),
            'status' => 'accepted',
            'invited_by' => $admin->id,
            'expires_at' => now()->addDays(2),
            'last_sent_at' => now()->subMinutes(10),
            'send_count' => 1,
        ]);

        $this->actingAs($admin)
            ->post("/admin/users/invitations/{$invitation->id}/resend")
            ->assertSessionHasErrors('invitation');
    }

    public function test_revoked_invitation_cannot_be_resent(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $invitation = UserInvitation::query()->create([
            'email' => 'revoked@example.com',
            'role' => 'staff',
            'token_hash' => Hash::make(Str::random(64)),
            'status' => 'revoked',
            'invited_by' => $admin->id,
            'expires_at' => now()->addDays(2),
            'last_sent_at' => now()->subMinutes(10),
            'send_count' => 1,
        ]);

        $this->actingAs($admin)
            ->post("/admin/users/invitations/{$invitation->id}/resend")
            ->assertSessionHasErrors('invitation');
    }

    public function test_non_admin_cannot_resend_or_revoke_invitation(): void
    {
        $staff = User::factory()->create(['role' => 'staff', 'status' => 'active']);
        $invitation = UserInvitation::query()->create([
            'email' => 'staff@example.com',
            'role' => 'staff',
            'token_hash' => Hash::make(Str::random(64)),
            'status' => 'pending',
            'invited_by' => $staff->id,
            'expires_at' => now()->addDays(2),
            'last_sent_at' => now(),
            'send_count' => 1,
        ]);

        $this->actingAs($staff)
            ->post("/admin/users/invitations/{$invitation->id}/resend")
            ->assertStatus(403);

        $this->actingAs($staff)
            ->delete("/admin/users/invitations/{$invitation->id}")
            ->assertStatus(403);
    }

    public function test_invalid_uuid_route_param_does_not_trigger_database_error(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);

        $this->actingAs($admin)
            ->post('/admin/users/invitations/1/resend')
            ->assertNotFound();

        $this->actingAs($admin)
            ->delete('/admin/users/invitations/1')
            ->assertNotFound();
    }
}
