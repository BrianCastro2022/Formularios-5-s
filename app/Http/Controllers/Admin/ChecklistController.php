<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePreguntaRequest;
use App\Http\Requests\Admin\UpdatePreguntaRequest;
use App\Models\ChecklistPlantilla;
use App\Models\Pregunta;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ChecklistController extends Controller
{
    /**
     * HU-12 — Listado de las 5 plantillas de checklist precargadas.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', ChecklistPlantilla::class);

        $checklists = ChecklistPlantilla::query()
            ->with(['area', 'secciones.preguntas'])
            ->get()
            ->map(fn (ChecklistPlantilla $checklist) => [
                'id' => $checklist->id,
                'nombre' => $checklist->nombre,
                'area' => $checklist->area,
                'secciones_count' => $checklist->secciones->count(),
                'preguntas_count' => $checklist->secciones->sum(fn ($seccion) => $seccion->preguntas->count()),
            ]);

        return Inertia::render('admin/checklists/index', [
            'checklists' => $checklists,
        ]);
    }

    /**
     * HU-12/HU-13 — Ver y gestionar la estructura de un checklist:
     * secciones → preguntas, con su escala general.
     */
    public function show(ChecklistPlantilla $checklist): Response
    {
        $this->authorize('view', ChecklistPlantilla::class);

        $checklist->load(['area', 'escalasGenerales', 'secciones.preguntas.escalaPropia']);

        return Inertia::render('admin/checklists/show', [
            'checklist' => $checklist,
        ]);
    }

    /**
     * HU-13 — Agregar una pregunta nueva a una sección del checklist.
     */
    public function storePregunta(StorePreguntaRequest $request, ChecklistPlantilla $checklist): RedirectResponse
    {
        $validated = $request->validated();

        Pregunta::create([
            ...$validated,
            'orden' => Pregunta::query()->where('seccion_id', $validated['seccion_id'])->max('orden') + 1,
        ]);

        return back()->with('status', 'Pregunta agregada.');
    }

    /**
     * HU-13 — Editar el texto/subcategoría de una pregunta existente.
     */
    public function updatePregunta(UpdatePreguntaRequest $request, ChecklistPlantilla $checklist, Pregunta $pregunta): RedirectResponse
    {
        $pregunta->update($request->validated());

        return back()->with('status', 'Pregunta actualizada.');
    }

    /**
     * HU-13 — Activar/desactivar una pregunta sin eliminarla.
     */
    public function togglePreguntaStatus(ChecklistPlantilla $checklist, Pregunta $pregunta): RedirectResponse
    {
        $this->authorize('update', ChecklistPlantilla::class);

        $pregunta->update(['activa' => ! $pregunta->activa]);

        return back()->with('status', $pregunta->activa ? 'Pregunta activada.' : 'Pregunta desactivada.');
    }
}
