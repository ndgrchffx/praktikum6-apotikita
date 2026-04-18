<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Mengizinkan permintaan API tanpa proteksi CSRF
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        $middleware->statefulApi();

        // TAMBAHKAN INI: Daftarkan alias untuk middleware Admin kamu
        $middleware->alias([
            'isAdmin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function ($request, $e) {
            if ($request->is('api/*')) {
                return true;
            }
        });
    })
    ->create();
