<?php

use Illuminate\Support\Facades\Route;

// Sistema interno sin landing pública: '/' redirige a login o al dashboard.
Route::get('/', function () {
    return redirect()->route(auth()->check() ? 'dashboard' : 'login');
})->name('home');

require __DIR__.'/dashboard.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/formulario.php';
require __DIR__.'/planes-accion.php';
