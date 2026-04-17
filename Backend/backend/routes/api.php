<?php

use App\Http\Controllers\MedicineController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// 1. Rute Public (Bisa diakses siapa saja, termasuk token dari Hono)
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

// PINDAHKAN CRUD OBAT KE SINI (DI LUAR MIDDLEWARE)
Route::get('medicines', [MedicineController::class, 'index']);
Route::post('medicines', [MedicineController::class, 'store']);
Route::get('medicines/{medicine}', [MedicineController::class, 'show']);
Route::put('medicines/{medicine}', [MedicineController::class, 'update']);
Route::delete('medicines/{medicine}', [MedicineController::class, 'destroy']);

// 2. Rute Protected (Hanya yang butuh fitur khusus Laravel)
Route::middleware('auth:api')->group(function () {
    Route::post('auth/refresh', [AuthController::class, 'refresh']);
});
