<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChallengeController;
use App\Http\Controllers\Api\GamificationController;
use App\Http\Controllers\Api\PhotoController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

Route::get('challenges/list', [ChallengeController::class, 'list']);
Route::get('users/list', [UserController::class, 'list']);
Route::get('photos/gallery', [PhotoController::class, 'gallery']);
Route::get('gamification/winner', [GamificationController::class, 'winner']);

Route::middleware('auth:api')->group(function () {
    Route::post('photos/upload', [PhotoController::class, 'upload']);
    Route::post('photos/delete', [PhotoController::class, 'delete']);
    Route::get('gamification/stats', [GamificationController::class, 'stats']);
});
