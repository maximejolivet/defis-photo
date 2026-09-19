<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    public $timestamps = false;

    protected $table = 'challenges';

    protected $fillable = ['title', 'description', 'icon', 'sort_order'];
}
