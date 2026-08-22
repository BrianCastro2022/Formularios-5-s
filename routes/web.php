<?php

use App\Enums\UserRole;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// '/' muestra la página de bienvenida a visitantes; a un usuario ya
// autenticado lo manda directo a la vista de inicio de su rol.
Route::get('/', function () {
    if (! auth()->check()) {
        return Inertia::render('welcome');
    }

    $home = auth()->user()->rol === UserRole::Responsable ? 'formulario.show' : 'dashboard';

    return redirect()->route($home);
})->name('home');

require __DIR__.'/dashboard.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/formulario.php';
require __DIR__.'/planes-accion.php';
require __DIR__.'/qr-publico.php';
