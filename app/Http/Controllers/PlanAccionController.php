<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\StorePlanAccionRequest;
use App\Http\Requests\UpdateEstadoPlanAccionRequest;
use App\Models\Area;
use App\Models\PlanAccion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanAccionController extends Controller
{
    /**
     * HU-32 — Listado de planes de acción. El administrador ve todos (con
     * filtros); un responsable solo ve los que tiene asignados a él.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PlanAccion::class);

        $user = $request->user();
        $filtros = $request->only(['estado', 'area_id']);

        $planes = PlanAccion::query()
            ->with([
                'responsable',
                'respuestaDetalle.pregunta.seccion.checklistPlantilla.area',
                'respuestaDetalle.checklistRespuesta.activo',
            ])
            ->when($user->rol === UserRole::Responsable, fn ($query) => $query->where('responsable_id', $user->id))
            ->when(
                $filtros['area_id'] ?? null,
                fn ($query, $areaId) => $query->whereHas(
                    'respuestaDetalle.pregunta.seccion.checklistPlantilla',
                    fn ($q) => $q->where('area_id', $areaId)
                )
            )
            ->orderByDesc('created_at')
            ->get()
            ->when(
                $filtros['estado'] ?? null,
                fn ($coleccion, $estado) => $coleccion->filter(fn (PlanAccion $plan) => $plan->estado_efectivo === $estado)
            )
            ->values();

        return Inertia::render('planes-accion/index', [
            'planes' => $planes,
            'areas' => Area::query()->orderBy('nombre')->get(['id', 'nombre']),
            'filtros' => $filtros,
            'esAdmin' => $user->rol === UserRole::Admin,
        ]);
    }

    /**
     * HU-31 — Crea un plan de acción sobre una respuesta marcada como GAP.
     */
    public function store(StorePlanAccionRequest $request): RedirectResponse
    {
        PlanAccion::create($request->validated());

        return back()->with('status', 'Plan de acción creado.');
    }

    /**
     * HU-31/HU-32 — Actualiza el estado de un plan de acción.
     */
    public function updateEstado(UpdateEstadoPlanAccionRequest $request, PlanAccion $planAccion): RedirectResponse
    {
        $validated = $request->validated();

        $planAccion->update([
            'estado' => $validated['estado'],
            'fecha_cierre' => $validated['estado'] === 'cerrado' ? now()->toDateString() : null,
        ]);

        return back()->with('status', 'Plan de acción actualizado.');
    }
}
