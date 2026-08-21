<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/data', [DashboardController::class, 'data'])->name('dashboard.data');
    // POST porque el PDF incluye las gráficas capturadas del propio dashboard en
    // el navegador (Chart.js) como imágenes — no caben en una query string GET.
    Route::post('dashboard/exportar/pdf', [DashboardController::class, 'exportarPdf'])->name('dashboard.exportar.pdf');
    Route::get('dashboard/exportar/excel', [DashboardController::class, 'exportarExcel'])->name('dashboard.exportar.excel');
});
