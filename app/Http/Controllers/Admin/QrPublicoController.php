<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QrPublico;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class QrPublicoController extends Controller
{
    /**
     * Panel del administrador para activar/desactivar el QR de acceso público
     * al dashboard, y obtener la URL que codifica ese QR.
     */
    public function index(): Response
    {
        $this->authorize('view', QrPublico::class);

        $qr = QrPublico::actual();

        return Inertia::render('admin/qr-publico/index', [
            'activo' => $qr->activo,
            // Se muestra siempre, incluso desactivado, para que el admin pueda
            // ver/copiar el enlace con anticipación (ej. para imprimir el QR)
            // aunque todavía no lo active.
            'url' => route('qr.publico', $qr->token),
        ]);
    }

    /**
     * Activa o desactiva el QR. Mientras esté desactivado, la ruta pública
     * rechaza cualquier acceso aunque alguien conserve la URL — ver
     * QrPublicoDashboardController::validarToken().
     */
    public function toggleStatus(): RedirectResponse
    {
        $this->authorize('update', QrPublico::class);

        $qr = QrPublico::actual();
        $qr->update(['activo' => ! $qr->activo]);

        return back()->with('status', $qr->activo ? 'Código QR activado.' : 'Código QR desactivado.');
    }
}
