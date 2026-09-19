<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Read-only mapping onto the `user_stats` SQL VIEW (see api_old/migrations/002_gamification.sql).
// Never written to directly — Eloquent's save()/update() are simply never called on it.
class UserStat extends Model
{
    public $timestamps = false;

    protected $table = 'user_stats';

    protected $primaryKey = 'user_id';

    public $incrementing = false;
}
