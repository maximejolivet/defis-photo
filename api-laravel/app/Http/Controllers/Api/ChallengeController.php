<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;

class ChallengeController extends Controller
{
    public function list()
    {
        return Challenge::orderBy('sort_order')
            ->get(['id', 'title', 'description', 'icon']);
    }
}
