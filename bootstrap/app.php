<?php

use App\Http\Middleware\EnsurePasswordIsChanged;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            EnsurePasswordIsChanged::class,
        ]);

        // Railway termina el SSL en su proxy: el contenedor recibe tráfico como
        // HTTP aunque el usuario llegue por HTTPS. Sin esto, Laravel genera URLs
        // con http:// y el navegador bloquea CSS/JS como contenido mixto.
        $middleware->trustProxies(at: '*');
    })
    ->withSchedule(function (Schedule $schedule) {
        // Requiere que algo dispare `php artisan schedule:run` cada minuto (cron
        // del sistema operativo o el panel de hosting) — Laravel no lo hace solo.
        $schedule->command('checklists:recordar-pendientes')->dailyAt('08:00');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
