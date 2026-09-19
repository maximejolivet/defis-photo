<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    public $timestamps = false;

    protected $table = 'photos';

    protected $fillable = ['user_id', 'image_path', 'challenge_id', 'recipient_user_id'];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
