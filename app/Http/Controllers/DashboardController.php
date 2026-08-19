<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Exports\DashboardExport;
use App\Models\Activo;
use App\Models\Area;
use App\Models\User;
use App\Services\DashboardAggregator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DashboardController extends Controller
{
    /**
     * Meta de adherencia por defecto para la línea de meta del gráfico de
     * tendencia (HU-22). El PDF sugiere metas distintas por checklist (80%
     * Almacén, 85% Taller/Administrativo) — como valor general se deja
     * configurable desde el filtro del dashboard con este default.
     */
    private const META_DEFAULT = 90.0;

    /**
     * Segundos que se cachea una combinación de filtros (HU-30, nota de
     * performance: "cachear resultados por combinación de filtros con una
     * expiración corta"). Corto a propósito porque hay checklists nuevos
     * entrando constantemente y el dashboard debe reflejarlos pronto.
     */
    private const CACHE_TTL_SEGUNDOS = 60;

    public function __construct(private readonly DashboardAggregator $aggregator) {}

    /**
     * HU-19 — Shell del dashboard: solo trae las opciones para los filtros.
     * Los datos agregados se piden aparte a data() para no recargar la página.
     */
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('dashboard', [
            'areas' => Area::query()->orderBy('nombre')->get(['id', 'nombre']),
            'activos' => Activo::query()->where('activo', true)->orderBy('codigo')->get(['id', 'codigo', 'area_id']),
            'metaDefault' => self::META_DEFAULT,
            // Fase 8 (HU-31): quién puede quedar como responsable de un plan de acción.
            'responsables' => User::query()->where('activo', true)->orderBy('nombres')->get(['id', 'nombres', 'apellidos']),
        ]);
    }

    /**
     * Un único endpoint agregado para todos los bloques del dashboard (Fase 5 y
     * Fase 6), filtrado por mes/año/área/activo — se extiende en vez de crear
     * endpoints nuevos por fase, para mantener consistencia de filtros.
     */
    public function data(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $filtros = $this->validarFiltros($request);

        $datos = $this->agregarConCache($filtros);

        return response()->json([
            ...$datos,
            'meta' => (float) ($filtros['meta'] ?? self::META_DEFAULT),
        ]);
    }

    /**
     * HU-29 — Exporta el dashboard (con los filtros aplicados) a PDF.
     */
    public function exportarPdf(Request $request): HttpResponse
    {
        $this->authorizeAdmin($request);

        $filtros = $this->validarFiltros($request);
        $datos = $this->aggregator->agregar($filtros);

        $pdf = Pdf::loadView('exports.dashboard', ['datos' => $datos, 'filtros' => $filtros])->setPaper('a4', 'landscape');

        return $pdf->download('dashboard-5s-cd-narino.pdf');
    }

    /**
     * HU-29 — Exporta el dashboard (con los filtros aplicados) a Excel.
     */
    public function exportarExcel(Request $request): BinaryFileResponse
    {
        $this->authorizeAdmin($request);

        $filtros = $this->validarFiltros($request);
        $datos = $this->aggregator->agregar($filtros);

        return Excel::download(new DashboardExport($datos), 'dashboard-5s-cd-narino.xlsx');
    }

    /**
     * @return array<string, mixed>
     */
    private function validarFiltros(Request $request): array
    {
        return $request->validate([
            'mes' => ['nullable', 'integer', 'between:1,12'],
            'anio' => ['nullable', 'integer', 'min:2000'],
            'area_id' => ['nullable', 'exists:areas,id'],
            'activo_id' => ['nullable', 'exists:activos,id'],
            'meta' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $filtros
     * @return array<string, mixed>
     */
    private function agregarConCache(array $filtros): array
    {
        $clave = 'dashboard.'.md5(json_encode([
            $filtros['mes'] ?? null,
            $filtros['anio'] ?? null,
            $filtros['area_id'] ?? null,
            $filtros['activo_id'] ?? null,
        ]));

        return Cache::remember($clave, self::CACHE_TTL_SEGUNDOS, fn () => $this->aggregator->agregar($filtros));
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()->rol === UserRole::Admin, 403);
    }
}
