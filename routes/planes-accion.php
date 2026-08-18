<?php

use App\Http\Controllers\PlanAccionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('planes-accion')->name('planes-accion.')->group(function () {
    Route::get('/', [PlanAccionController::class, 'index'])->name('index');
    Route::post('/', [PlanAccionController::class, 'store'])->name('store');
    Route::patch('{planAccion}/estado', [PlanAccionController::class, 'updateEstado'])->name('update-estado');
});
