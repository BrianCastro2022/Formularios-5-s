<?php

namespace App\Http\Controllers;

use App\Http\Requests\Formulario\StoreChecklistRespuestaRequest;
use App\Models\Activo;
use App\Models\ChecklistPlantilla;
use App\Models\ChecklistRespuesta;
use App\Models\Pregunta;
use App\Models\RespuestaDetalle;
use App\Models\User;
use App\Services\AdherenciaCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class FormularioController extends Controller
{
    /**
     * Áreas cuyo checklist se diligencia por activo individual (HU-14) — placa,
     * montacargas o zona —, no una sola vez por área.
     */
    private const AREAS_POR_ACTIVO = ['Camiones', 'Montacargas', 'Almacén', 'Administrativo'];

    /**
     * HU-14 — Muestra el formulario 5S del área del responsable. Si el área
     * requiere elegir placa/activo primero y aún no se eligió, muestra la
     * pantalla de selección en vez del formulario.
     */
    public function show(Request $request): Response
    {
        $this->authorize('create', ChecklistRespuesta::class);

        $user = $request->user();
        $checklist = ChecklistPlantilla::with('area')->where('area_id', $user->area_id)->firstOrFail();
        $requiereActivo = in_array($checklist->area->nombre, self::AREAS_POR_ACTIVO, true);

        if ($requiereActivo && ! $request->filled('activo_id')) {
            $activos = Activo::query()
                ->where('area_id', $user->area_id)
                ->where('activo', true)
                ->orderBy('codigo')
                ->get(['id', 'codigo']);

            return Inertia::render('formulario/seleccionar-placa', [
                'checklist' => $checklist,
                'activos' => $activos,
                'completadosEstaSemana' => $this->activosCompletadosEstaSemana($checklist->id, $activos->pluck('id')),
            ]);
        }

        $activo = null;
        if ($requiereActivo) {
            $activo = Activo::query()
                ->where('area_id', $user->area_id)
                ->where('activo', true)
                ->findOrFail($request->integer('activo_id'));
        }

        $checklist->load([
            'escalasGenerales',
            'secciones' => fn ($query) => $query->orderBy('orden'),
            'secciones.preguntas' => fn ($query) => $query->where('activa', true)->orderBy('orden'),
            'secciones.preguntas.escalaPropia',
        ]);

        return Inertia::render('formulario/diligenciar', [
            'checklist' => $checklist,
            'activo' => $activo,
            'bloqueadoPorSemana' => $this->yaDiligenciadoEstaSemana($checklist->id, $activo?->id),
        ]);
    }

    /**
     * HU-15/HU-16 — Guarda las respuestas del checklist en una sola transacción
     * (todo o nada) y calcula el % de adherencia.
     */
    public function store(StoreChecklistRespuestaRequest $request): RedirectResponse
    {
        $user = $request->user();
        $checklist = ChecklistPlantilla::with('area')->where('area_id', $user->area_id)->firstOrFail();
        $requiereActivo = in_array($checklist->area->nombre, self::AREAS_POR_ACTIVO, true);

        $validated = $request->validated();

        if ($requiereActivo && ! $validated['activo_id']) {
            throw ValidationException::withMessages(['activo_id' => 'Debes elegir una placa/activo.']);
        }

        $activoId = $requiereActivo ? (int) $validated['activo_id'] : null;

        // Regla de negocio: cada checklist (por activo, si aplica) solo se puede
        // diligenciar una vez por semana, sin importar qué usuario lo haga — si
        // cualquier otro responsable ya lo diligenció esta semana, queda bloqueado
        // para todos los demás. Repetido aquí como defensa en profundidad aunque
        // la pantalla de diligenciamiento ya bloquea este caso antes de mostrar
        // el formulario.
        if ($this->yaDiligenciadoEstaSemana($checklist->id, $activoId)) {
            throw ValidationException::withMessages([
                'respuestas' => 'Ya diligenciaste este formulario esta semana. Podrás volver a intentarlo la próxima semana.',
            ]);
        }

        // HU-15: todas las preguntas activas del checklist son obligatorias (no hay borrador).
        $preguntaIdsRequeridas = collect($checklist->secciones()->pluck('id'))
            ->pipe(fn ($seccionIds) => Pregunta::query()->whereIn('seccion_id', $seccionIds)->where('activa', true)->pluck('id'));

        $preguntaIdsRespondidas = collect($validated['respuestas'])->pluck('pregunta_id');

        if ($preguntaIdsRequeridas->diff($preguntaIdsRespondidas)->isNotEmpty()) {
            throw ValidationException::withMessages(['respuestas' => 'Debes responder todas las preguntas del checklist.']);
        }

        $respuesta = DB::transaction(function () use ($validated, $checklist, $user, $requiereActivo, $request) {
            $respuesta = ChecklistRespuesta::create([
                'checklist_plantilla_id' => $checklist->id,
                'usuario_id' => $user->id,
                'activo_id' => $requiereActivo ? $validated['activo_id'] : null,
                'fecha' => now()->toDateString(),
            ]);

            foreach ($validated['respuestas'] as $index => $datosRespuesta) {
                $fotoUrl = null;
                $foto = $request->file("respuestas.{$index}.foto");
                if ($foto) {
                    $fotoUrl = $foto->store('evidencias/checklists', 'public');
                }

                RespuestaDetalle::create([
                    'checklist_respuesta_id' => $respuesta->id,
                    'pregunta_id' => $datosRespuesta['pregunta_id'],
                    'opcion_id' => $datosRespuesta['opcion_id'],
                    'observacion' => $datosRespuesta['observacion'] ?? null,
                    'foto_url' => $fotoUrl,
                ]);
            }

            $respuesta->load('detalles.opcion', 'detalles.pregunta.seccion.checklistPlantilla.escalasGenerales', 'detalles.pregunta.escalaPropia');
            $respuesta->update([
                'resultado_porcentaje' => app(AdherenciaCalculator::class)->calcular($respuesta),
            ]);

            // Reinicia el ciclo del recordatorio por correo (EnviarRecordatoriosChecklist)
            // para que no le vuelva a llegar hasta que pase otra semana sin diligenciar.
            if ($user->recordatorio_enviado_at !== null) {
                $user->update(['recordatorio_enviado_at' => null]);
            }

            return $respuesta;
        });

        return to_route('formulario.historial')->with('status', "Checklist enviado. Resultado: {$respuesta->resultado_porcentaje}%.");
    }

    /**
     * HU-17 — Historial de checklists diligenciados por el propio responsable.
     */
    public function historial(Request $request): Response
    {
        $this->authorize('viewAny', ChecklistRespuesta::class);

        $checklists = ChecklistRespuesta::query()
            ->where('usuario_id', $request->user()->id)
            ->with('activo')
            ->orderByDesc('fecha')
            ->paginate(15);

        return Inertia::render('formulario/historial', [
            'checklists' => $checklists,
        ]);
    }

    /**
     * HU-31 — Detalle de un checklist propio, con un botón "Crear plan de acción"
     * sobre cada respuesta marcada GAP. Es la vía de entrada para que el rol
     * Responsable (no solo el Administrador desde el dashboard) pueda registrar
     * una acción correctiva, tal como pide la HU-31 ("como responsable o
     * administrador").
     */
    public function historialDetalle(Request $request, ChecklistRespuesta $checklistRespuesta): Response
    {
        $this->authorize('viewAny', ChecklistRespuesta::class);

        abort_unless($checklistRespuesta->usuario_id === $request->user()->id, 403);

        $checklistRespuesta->load([
            'checklistPlantilla.area',
            'activo',
            'detalles.pregunta.seccion',
            'detalles.opcion',
            'detalles.planesAccion',
        ]);

        return Inertia::render('formulario/historial-detalle', [
            'checklist' => $checklistRespuesta,
            'responsables' => User::query()->where('activo', true)->orderBy('nombres')->get(['id', 'nombres', 'apellidos']),
        ]);
    }

    /**
     * HU-18 (revisada) — Un checklist (por activo, si el área lo requiere) solo se
     * puede diligenciar una vez por semana calendario (lunes a domingo), sin
     * importar qué usuario lo diligencie: el bloqueo es por combinación
     * checklist+activo (o checklist+área, si no aplica activo), compartido entre
     * todos los responsables del área — no es un bloqueo individual por usuario.
     * A diferencia de la versión original de la Fase 4, esto bloquea el envío en
     * vez de solo advertir.
     */
    private function yaDiligenciadoEstaSemana(int $checklistPlantillaId, ?int $activoId): bool
    {
        return ChecklistRespuesta::query()
            ->where('checklist_plantilla_id', $checklistPlantillaId)
            ->when($activoId, fn ($query) => $query->where('activo_id', $activoId), fn ($query) => $query->whereNull('activo_id'))
            ->whereBetween('fecha', [now()->startOfWeek(), now()->endOfWeek()])
            ->exists();
    }

    /**
     * IDs de los activos, entre los recibidos, que cualquier usuario ya diligenció
     * esta semana para este checklist — usados en la pantalla de selección para
     * marcarlos como completados en vez de dejar que el usuario llegue a un
     * formulario bloqueado.
     *
     * @param  Collection<int, int>  $activoIds
     * @return array<int, int>
     */
    private function activosCompletadosEstaSemana(int $checklistPlantillaId, Collection $activoIds): array
    {
        return ChecklistRespuesta::query()
            ->where('checklist_plantilla_id', $checklistPlantillaId)
            ->whereIn('activo_id', $activoIds)
            ->whereBetween('fecha', [now()->startOfWeek(), now()->endOfWeek()])
            ->pluck('activo_id')
            ->all();
    }
}
