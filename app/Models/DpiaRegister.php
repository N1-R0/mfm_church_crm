<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DpiaRegister extends Model
{
    use HasFactory;

    protected $table = 'dpia_register';

    protected $fillable = [
        'title',
        'owner',
        'status',
        'summary',
        'review_notes',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];
}
