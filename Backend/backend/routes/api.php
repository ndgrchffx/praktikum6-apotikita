<?php

use App\Http\Controllers\MedicineController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// 1. Rute Public (Benar-benar bebas)
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

// User biasa (atau tanpa login) HANYA boleh LIHAT data
Route::get('medicines', [MedicineController::class, 'index']);
Route::get('medicines/{medicine}', [MedicineController::class, 'show']);

// 2. Rute Protected (Hanya untuk ADMIN)
Route::middleware(['auth:api', 'isAdmin'])->group(function () {
    Route::post('medicines', [MedicineController::class, 'store']);
    Route::put('medicines/{medicine}', [MedicineController::class, 'update']);
    Route::delete('medicines/{medicine}', [MedicineController::class, 'destroy']);

    Route::post('auth/refresh', [AuthController::class, 'refresh']);
});
