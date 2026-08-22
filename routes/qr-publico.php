<?php

use App\Http\Controllers\QrPublicoDashboardController;
use Illuminate\Support\Facades\Route;

// Sin middleware 'auth' a propósito: esta es la vista pública que abre el
// código QR, para visitantes sin sesión. El control de acceso real lo hace el
// token de la URL + el estado 'activo' de qr_publico (ver
// QrPublicoDashboardController::validarToken()), no la autenticación.
Route::get('qr/{token}', [QrPublicoDashboardController::class, 'show'])->name('qr.publico');
Route::get('qr/{token}/data', [QrPublicoDashboardController::class, 'data'])->name('qr.publico.data');
