<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Ramsey\Uuid\Uuid;

class UserInvitation extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    public function newUniqueId(): string
    {
        return Uuid::uuid4()->toString();
    }

    protected $fillable = [
        'email',
        'role',
        'token_hash',
        'status',
        'invited_by',
        'expires_at',
        'accepted_at',
        'revoked_at',
        'last_sent_at',
        'send_count',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
        'revoked_at' => 'datetime',
        'last_sent_at' => 'datetime',
    ];

    public function invitedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
