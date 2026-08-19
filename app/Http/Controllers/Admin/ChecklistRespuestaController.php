<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\ChecklistRespuesta;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ChecklistRespuestaController extends Controller
{
    /**
     * HU-29 — Listado de checklists diligenciados (todas las áreas), para que el
     * administrador ubique un checklist puntual y lo exporte a PDF.
     */
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $filtros = $request->only(['area_id', 'activo_id', 'mes', 'anio']);

        $checklists = ChecklistRespuesta::query()
            ->with(['checklistPlantilla.area', 'usuario', 'activo'])
            ->when($filtros['area_id'] ?? null, fn ($q, $areaId) => $q->whereHas('checklistPlantilla', fn ($q2) => $q2->where('area_id', $areaId)))
            ->when($filtros['activo_id'] ?? null, fn ($q, $activoId) => $q->where('activo_id', $activoId))
            ->when($filtros['mes'] ?? null, fn ($q, $mes) => $q->whereMonth('fecha', $mes))
            ->when($filtros['anio'] ?? null, fn ($q, $anio) => $q->whereYear('fecha', $anio))
            ->orderByDesc('fecha')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/checklists-respuesta/index', [
            'checklists' => $checklists,
            'areas' => Area::query()->orderBy('nombre')->get(['id', 'nombre']),
            'filtros' => $filtros,
        ]);
    }

    /**
     * HU-29 — Exporta un checklist puntual a PDF, con el detalle completo de
     * secciones/preguntas/respuestas/observaciones, para compartir en auditoría.
     */
    public function exportarPdf(Request $request, ChecklistRespuesta $checklistRespuesta): HttpResponse
    {
        $this->authorizeAdmin($request);

        $checklistRespuesta->load([
            'checklistPlantilla.area',
            'usuario',
            'activo',
            'detalles.pregunta.seccion',
            'detalles.opcion',
        ]);

        $checklistRespuesta->detalles->each(function ($detalle) {
            if ($detalle->foto_url) {
                $detalle->foto_path = Storage::disk('public')->path($detalle->foto_url);
            }
        });

        $secciones = $checklistRespuesta->detalles
            ->groupBy(fn ($detalle) => $detalle->pregunta->seccion->nombre)
            ->sortBy(fn ($grupo) => $grupo->first()->pregunta->seccion->orden);

        $pdf = Pdf::loadView('exports.checklist-respuesta', [
            'checklist' => $checklistRespuesta,
            'secciones' => $secciones,
        ]);

        $nombreArchivo = 'checklist-'.$checklistRespuesta->checklistPlantilla->area->nombre.'-'.$checklistRespuesta->fecha->format('Y-m-d').'.pdf';

        return $pdf->download($nombreArchivo);
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()->rol === UserRole::Admin, 403);
    }
}
