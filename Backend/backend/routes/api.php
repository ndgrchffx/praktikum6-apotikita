<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\GoogleAuthController;
use Illuminate\Support\Facades\Route;

// ══════════════════════════════════════
// PUBLIC — tidak butuh token
// ══════════════════════════════════════
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
    Route::get('google/redirect', [GoogleAuthController::class, 'redirect']);
    Route::get('google/callback', [GoogleAuthController::class, 'callback']);
});

Route::get('medicines',            [MedicineController::class, 'index']);
Route::get('medicines/{medicine}', [MedicineController::class, 'show']);

// ══════════════════════════════════════
// PROTECTED — butuh token (semua user login)
// ══════════════════════════════════════
Route::middleware('auth:api')->group(function () {
    Route::post('auth/logout',  [AuthController::class, 'logout']);
    Route::post('auth/refresh', [AuthController::class, 'refresh']);
    Route::get('auth/me',       [AuthController::class, 'me']);
});

// ══════════════════════════════════════
// ADMIN ONLY — butuh token + role admin
// ══════════════════════════════════════
Route::middleware(['auth:api', 'isAdmin'])->group(function () {
    Route::post('medicines',              [MedicineController::class, 'store']);
    Route::put('medicines/{medicine}',    [MedicineController::class, 'update']);
    Route::delete('medicines/{medicine}', [MedicineController::class, 'destroy']);
});
