<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpChallengeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $otp,
    ) {}

    public function build(): self
    {
        return $this->subject('Your MFM Youth Church CRM sign-in code')
            ->markdown('emails.otp-challenge', [
                'otp' => $this->otp,
                'expiresInMinutes' => 5,
            ]);
    }
}
