<?php

use App\Http\Controllers\FormularioController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('mi-formulario')->name('formulario.')->group(function () {
    Route::get('/', [FormularioController::class, 'show'])->name('show');
    Route::post('/', [FormularioController::class, 'store'])->name('store');
    Route::get('historial', [FormularioController::class, 'historial'])->name('historial');
    Route::get('historial/{checklistRespuesta}', [FormularioController::class, 'historialDetalle'])->name('historial.show');
});
