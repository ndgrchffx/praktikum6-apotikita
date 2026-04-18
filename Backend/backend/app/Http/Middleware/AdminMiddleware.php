<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth; // Penting supaya Auth:: dikenali

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Ambil user menggunakan guard 'api' (karena kita pakai JWT)
        $user = Auth::guard('api')->user();

        // 2. Cek: Kalau usernya GAK ADA (null) atau rolenya BUKAN 'admin'
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden: Akses ditolak, kamu bukan Admin!'
            ], 403);
        }

        // 3. Kalau lolos pengecekan, lanjut ke proses berikutnya
        return $next($request);
    }
}
