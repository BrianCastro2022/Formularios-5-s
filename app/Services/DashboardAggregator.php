<?php

namespace App\Services;

use App\Enums\EstadoPlanAccion;
use App\Models\ChecklistRespuesta;
use App\Models\PlanAccion;
use App\Models\RespuestaDetalle;
use Illuminate\Support\Collection;

/**
 * Agregación de datos del dashboard (Fase 5 y 6), extraída a su propio servicio en
 * la Fase 7 para que tanto el endpoint JSON (DashboardController::data) como las
 * exportaciones a Excel/PDF (HU-29) usen exactamente los mismos números, sin
 * duplicar la lógica de cálculo en dos sitios.
 */
class DashboardAggregator
{
    /**
     * Nombres canónicos de las 5S por orden de sección (1-5). Se usan estos en vez
     * de `secciones_5s.nombre` porque el texto exacto varía por checklist (ej. la
     * 4°S se llama "Padronización" en unos y "Estandarización" en Almacén).
     */
    public const NOMBRES_5S = [
        1 => 'Clasificación',
        2 => 'Orden',
        3 => 'Limpieza',
        4 => 'Estandarización',
        5 => 'Disciplina',
    ];

    public function __construct(private readonly AdherenciaCalculator $calculator) {}

    /**
     * @param  array{mes?: int|null, anio?: int|null, area_id?: int|null, activo_id?: int|null}  $filtros
     * @return array<string, mixed>
     */
    public function agregar(array $filtros): array
    {
        $checklists = ChecklistRespuesta::query()
            ->with(['checklistPlantilla.area', 'usuario', 'activo'])
            ->when($filtros['mes'] ?? null, fn ($query, $mes) => $query->whereMonth('fecha', $mes))
            ->when($filtros['anio'] ?? null, fn ($query, $anio) => $query->whereYear('fecha', $anio))
            ->when($filtros['activo_id'] ?? null, fn ($query, $activoId) => $query->where('activo_id', $activoId))
            ->when(
                $filtros['area_id'] ?? null,
                fn ($query, $areaId) => $query->whereHas('checklistPlantilla', fn ($q) => $q->where('area_id', $areaId))
            )
            ->get();

        $tarjetas = [
            'checklists_ejecutados' => $checklists->count(),
            'activos_revisados' => $checklists->pluck('activo_id')->filter()->unique()->count(),
            'adherencia_general' => $checklists->isEmpty() ? null : round($checklists->avg('resultado_porcentaje'), 2),
        ];

        $porArea = $checklists
            ->groupBy(fn (ChecklistRespuesta $r) => $r->checklistPlantilla->area->nombre)
            ->map(fn ($grupo, $areaNombre) => [
                'area' => $areaNombre,
                'total' => $grupo->count(),
                'promedio' => round($grupo->avg('resultado_porcentaje'), 2),
            ])
            ->values();

        $tendenciaMensual = $checklists
            ->groupBy(fn (ChecklistRespuesta $r) => $r->fecha->format('Y-m'))
            ->map(fn ($grupo, $periodo) => [
                'periodo' => $periodo,
                'total' => $grupo->count(),
                'promedio' => round($grupo->avg('resultado_porcentaje'), 2),
            ])
            ->sortBy('periodo')
            ->values();

        // HU-23 — Resultado por evaluador (responsable que diligenció).
        $porEvaluador = $checklists
            ->groupBy('usuario_id')
            ->map(fn ($grupo) => [
                'evaluador' => $grupo->first()->usuario->name,
                'total' => $grupo->count(),
                'promedio' => round($grupo->avg('resultado_porcentaje'), 2),
            ])
            ->sortByDesc('promedio')
            ->values();

        // HU-25 — Resultado por vehículo/activo.
        $porActivo = $checklists
            ->filter(fn (ChecklistRespuesta $r) => $r->activo_id !== null)
            ->groupBy('activo_id')
            ->map(fn ($grupo) => [
                'activo' => $grupo->first()->activo->codigo,
                'total' => $grupo->count(),
                'promedio' => round($grupo->avg('resultado_porcentaje'), 2),
            ])
            ->sortBy('activo')
            ->values();

        $detalles = RespuestaDetalle::query()
            ->whereIn('checklist_respuesta_id', $checklists->pluck('id'))
            ->with(['opcion', 'pregunta.escalaPropia', 'pregunta.seccion.checklistPlantilla.escalasGenerales'])
            ->get();

        $checklistsPorId = $checklists->keyBy('id');

        // Cada respuesta enriquecida con su contexto (área/activo/sección) resuelto una
        // sola vez, para no repetir la búsqueda en cada bloque que sigue.
        $respuestasEnriquecidas = $detalles->map(function (RespuestaDetalle $detalle) use ($checklistsPorId) {
            $checklist = $checklistsPorId->get($detalle->checklist_respuesta_id);

            return [
                'respuesta_detalle_id' => $detalle->id,
                'fecha' => $checklist->fecha,
                'pregunta_id' => $detalle->pregunta_id,
                'pregunta_texto' => $detalle->pregunta->texto,
                'subcategoria' => $detalle->pregunta->subcategoria,
                'seccion_orden' => $detalle->pregunta->seccion->orden,
                'area_nombre' => $checklist->checklistPlantilla->area->nombre,
                'activo_codigo' => $checklist->activo?->codigo,
                'alcance' => $checklist->activo_id ?? "area:{$checklist->checklistPlantilla->area_id}",
                'es_gap' => (bool) $detalle->opcion->es_gap,
                'normalizado' => $this->calculator->normalizar($detalle),
            ];
        });

        $porS = $respuestasEnriquecidas
            ->groupBy('seccion_orden')
            ->map(function (Collection $grupo, $orden) {
                $valores = $grupo->pluck('normalizado')->filter(fn (?float $v) => $v !== null);

                return [
                    'orden' => (int) $orden,
                    'nombre' => self::NOMBRES_5S[(int) $orden] ?? "S{$orden}",
                    'porcentaje' => $valores->isEmpty() ? null : round($valores->avg(), 2),
                ];
            })
            ->sortBy('orden')
            ->values();

        // HU-24 — Resultado por subcategoría de pregunta.
        $porSubcategoria = $respuestasEnriquecidas
            ->filter(fn (array $r) => $r['subcategoria'] !== null)
            ->groupBy('subcategoria')
            ->map(function (Collection $grupo, $subcategoria) {
                $valores = $grupo->pluck('normalizado')->filter(fn (?float $v) => $v !== null);

                return [
                    'subcategoria' => $subcategoria,
                    'total' => $grupo->count(),
                    'promedio' => $valores->isEmpty() ? null : round($valores->avg(), 2),
                ];
            })
            ->sortBy('promedio')
            ->values();

        // HU-26 — Top oportunidades: preguntas con más respuestas marcadas como GAP.
        // `ultima_respuesta_detalle_id` (Fase 8, HU-31) es la ocurrencia GAP más
        // reciente de ese grupo — a esa se engancha el botón "Crear plan de acción",
        // porque un plan debe apuntar a una respuesta puntual, no a la agregación.
        $topOportunidades = $respuestasEnriquecidas
            ->filter(fn (array $r) => $r['es_gap'])
            ->groupBy('pregunta_id')
            ->map(function (Collection $grupo) {
                $ultima = $grupo->sortByDesc('fecha')->first();

                return [
                    'pregunta_id' => $grupo->first()['pregunta_id'],
                    'texto' => $grupo->first()['pregunta_texto'],
                    'subcategoria' => $grupo->first()['subcategoria'],
                    'gaps' => $grupo->count(),
                    'ultima_respuesta_detalle_id' => $ultima['respuesta_detalle_id'],
                ];
            })
            ->sortByDesc('gaps')
            ->take(10)
            ->values();

        // HU-27 — Reincidencias: misma pregunta marcada GAP en checklists sucesivos
        // del mismo activo (Camiones/Montacargas) o área (el resto).
        $reincidencias = $respuestasEnriquecidas
            ->filter(fn (array $r) => $r['es_gap'])
            ->groupBy(fn (array $r) => "{$r['pregunta_id']}|{$r['alcance']}")
            ->filter(fn (Collection $grupo) => $grupo->count() >= 2)
            ->map(function (Collection $grupo) {
                $ultima = $grupo->sortByDesc('fecha')->first();

                return [
                    'texto' => $grupo->first()['pregunta_texto'],
                    'alcance' => $grupo->first()['activo_codigo'] ?? $grupo->first()['area_nombre'],
                    'veces' => $grupo->count(),
                    'ultima_respuesta_detalle_id' => $ultima['respuesta_detalle_id'],
                ];
            })
            ->sortByDesc('veces')
            ->take(15)
            ->values();

        // HU-28 — Tabla detalle cruzado: área × sección (1S-5S).
        $detalleCruzado = $respuestasEnriquecidas
            ->groupBy(fn (array $r) => "{$r['area_nombre']}|{$r['seccion_orden']}")
            ->map(function (Collection $grupo) {
                $valores = $grupo->pluck('normalizado')->filter(fn (?float $v) => $v !== null);
                $primero = $grupo->first();

                return [
                    'area' => $primero['area_nombre'],
                    'seccion_orden' => $primero['seccion_orden'],
                    'seccion_nombre' => self::NOMBRES_5S[$primero['seccion_orden']] ?? "S{$primero['seccion_orden']}",
                    'total' => $grupo->count(),
                    'promedio' => $valores->isEmpty() ? null : round($valores->avg(), 2),
                ];
            })
            ->sortBy([['area', 'asc'], ['seccion_orden', 'asc']])
            ->values();

        return [
            'tarjetas' => $tarjetas,
            'por_area' => $porArea,
            'tendencia_mensual' => $tendenciaMensual,
            'por_s' => $porS,
            'por_evaluador' => $porEvaluador,
            'por_subcategoria' => $porSubcategoria,
            'por_activo' => $porActivo,
            'top_oportunidades' => $topOportunidades,
            'reincidencias' => $reincidencias,
            'detalle_cruzado' => $detalleCruzado,
            'planes_accion' => $this->contarPlanesAccion(),
        ];
    }

    /**
     * HU-32 — Conteo de planes de acción por estado (abierto/en_progreso/cerrado/
     * vencido). A propósito NO se filtra por mes/año/área del dashboard: la fecha
     * que importa para un plan es su propia fecha_limite, no la fecha del checklist
     * que lo originó, así que se muestra el conteo global siempre.
     *
     * @return array<string, int>
     */
    private function contarPlanesAccion(): array
    {
        $conteos = [
            EstadoPlanAccion::Abierto->value => 0,
            EstadoPlanAccion::EnProgreso->value => 0,
            EstadoPlanAccion::Cerrado->value => 0,
            'vencido' => 0,
        ];

        PlanAccion::query()->get(['estado', 'fecha_limite'])->each(function (PlanAccion $plan) use (&$conteos) {
            $conteos[$plan->estado_efectivo] = ($conteos[$plan->estado_efectivo] ?? 0) + 1;
        });

        return $conteos;
    }
}
