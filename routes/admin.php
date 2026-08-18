<?php

use App\Http\Controllers\Admin\ActivoController;
use App\Http\Controllers\Admin\ChecklistController;
use App\Http\Controllers\Admin\ChecklistRespuestaController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::prefix('usuarios')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('crear', [UserController::class, 'create'])->name('create');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('{user}/editar', [UserController::class, 'edit'])->name('edit');
        Route::put('{user}', [UserController::class, 'update'])->name('update');
        Route::patch('{user}/estado', [UserController::class, 'toggleStatus'])->name('toggle-status');
        Route::patch('{user}/restablecer-password', [UserController::class, 'resetPassword'])->name('reset-password');
    });

    Route::prefix('activos')->name('activos.')->group(function () {
        Route::get('/', [ActivoController::class, 'index'])->name('index');
        Route::post('/', [ActivoController::class, 'store'])->name('store');
        Route::patch('{activo}/estado', [ActivoController::class, 'toggleStatus'])->name('toggle-status');
    });

    Route::prefix('checklists')->name('checklists.')->group(function () {
        Route::get('/', [ChecklistController::class, 'index'])->name('index');
        Route::get('{checklist}', [ChecklistController::class, 'show'])->name('show');
        Route::post('{checklist}/preguntas', [ChecklistController::class, 'storePregunta'])->name('preguntas.store');
        Route::put('{checklist}/preguntas/{pregunta}', [ChecklistController::class, 'updatePregunta'])->name('preguntas.update');
        Route::patch('{checklist}/preguntas/{pregunta}/estado', [ChecklistController::class, 'togglePreguntaStatus'])->name('preguntas.toggle-status');
    });

    Route::prefix('checklists-respuesta')->name('checklists-respuesta.')->group(function () {
        Route::get('/', [ChecklistRespuestaController::class, 'index'])->name('index');
        Route::get('{checklistRespuesta}/exportar', [ChecklistRespuestaController::class, 'exportarPdf'])->name('exportar');
    });
});
