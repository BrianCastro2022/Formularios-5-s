<?php

namespace App\Http\Controllers;

use App\Models\Activo;
use App\Models\Area;
use App\Models\QrPublico;
use App\Services\DashboardAggregator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Vista pública y sin autenticación del dashboard, habilitada solo mientras el
 * QR esté activo (App\Models\QrPublico). No requiere sesión ni rol — el único
 * control de acceso es que la URL traiga el token vigente Y que el QR esté
 * activo (validarToken(), en ambos métodos como defensa en profundidad).
 */
class QrPublicoDashboardController extends Controller
{
    private const META_DEFAULT = 90.0;

    private const CACHE_TTL_SEGUNDOS = 60;

    public function __construct(private readonly DashboardAggregator $aggregator) {}

    public function show(string $token): Response
    {
        $this->validarToken($token);

        return Inertia::render('dashboard-publico', [
            'areas' => Area::query()->orderBy('nombre')->get(['id', 'nombre']),
            'activos' => Activo::query()->where('activo', true)->orderBy('codigo')->get(['id', 'codigo', 'area_id']),
            'metaDefault' => self::META_DEFAULT,
            'token' => $token,
        ]);
    }

    public function data(Request $request, string $token): JsonResponse
    {
        $this->validarToken($token);

        $filtros = $request->validate([
            'mes' => ['nullable', 'integer', 'between:1,12'],
            'anio' => ['nullable', 'integer', 'min:2000'],
            'fecha_desde' => ['nullable', 'date'],
            'fecha_hasta' => ['nullable', 'date', 'after_or_equal:fecha_desde'],
            'area_id' => ['nullable', 'exists:areas,id'],
            'activo_id' => ['nullable', 'exists:activos,id'],
            'meta' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        // Mismo prefijo de clave que el dashboard autenticado (DashboardController)
        // a propósito: es la misma combinación de filtros -> mismo resultado, así
        // que comparten caché en vez de calcularlo dos veces.
        $clave = 'dashboard.'.md5(json_encode([
            $filtros['mes'] ?? null,
            $filtros['anio'] ?? null,
            $filtros['fecha_desde'] ?? null,
            $filtros['fecha_hasta'] ?? null,
            $filtros['area_id'] ?? null,
            $filtros['activo_id'] ?? null,
        ]));

        $datos = Cache::remember($clave, self::CACHE_TTL_SEGUNDOS, fn () => $this->aggregator->agregar($filtros));

        return response()->json([
            ...$datos,
            'meta' => (float) ($filtros['meta'] ?? self::META_DEFAULT),
        ]);
    }

    /**
     * Único punto de control de acceso de todo este flujo: si el QR está
     * desactivado, o el token de la URL no coincide con el vigente, se rechaza
     * — incluso si alguien conservó o reutilizó una URL que antes funcionaba.
     * hash_equals() evita filtrar por timing si el token casi coincide.
     */
    private function validarToken(string $token): void
    {
        $qr = QrPublico::actual();

        abort_unless($qr->activo && hash_equals($qr->token, $token), 404);
    }
}
