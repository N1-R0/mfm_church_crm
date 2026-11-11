<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public const ROLES = ['admin', 'pastor', 'staff'];

    public const STATUSES = ['invited', 'active', 'suspended'];

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'youth_church',
        'last_login_at',
        'privacy_notice_version',
        'privacy_acknowledged_at',
        'terms_version',
        'terms_accepted_at',
        'email_verified_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'privacy_acknowledged_at' => 'datetime',
            'terms_accepted_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function canManageUsers(): bool
    {
        return $this->role === 'admin';
    }

    public static function validRole(string $role): bool
    {
        return in_array($role, self::ROLES, true);
    }

    public static function validStatus(string $status): bool
    {
        return in_array($status, self::STATUSES, true);
    }
}
