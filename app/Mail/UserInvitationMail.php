<?php

namespace App\Mail;

use App\Models\UserInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public UserInvitation $invitation,
        public string $token,
    ) {}

    public function build(): self
    {
        $acceptUrl = route('invitation.accept', ['token' => $this->token]);

        return $this->subject('Your MFM Youth Church CRM invitation')
            ->markdown('emails.user-invitation', [
                'acceptUrl' => $acceptUrl,
                'role' => $this->invitation->role,
            ]);
    }
}
