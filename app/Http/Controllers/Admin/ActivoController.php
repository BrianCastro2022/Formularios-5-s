<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ActivoTipo;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreActivoRequest;
use App\Models\Activo;
use App\Models\Area;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivoController extends Controller
{
    /**
     * HU-10/HU-11 — Listar y buscar placas de camiones y unidades de montacargas.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Activo::class);

        $filters = $request->only(['q', 'tipo', 'estado']);

        $activos = Activo::query()
            ->when($filters['q'] ?? null, fn ($query, $q) => $query->where('codigo', 'like', "%{$q}%"))
            ->when($filters['tipo'] ?? null, fn ($query, $tipo) => $query->where('tipo', $tipo))
            ->when(($filters['estado'] ?? null) !== null && $filters['estado'] !== '', function ($query) use ($filters) {
                $query->where('activo', $filters['estado'] === 'activo');
            })
            ->orderBy('tipo')
            ->orderBy('codigo')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/activos/index', [
            'activos' => $activos,
            'filters' => $filters,
        ]);
    }

    /**
     * HU-10/HU-11 — Registrar una nueva placa o unidad de montacargas.
     * El área se deriva del tipo: Camión → área Camiones, Montacargas → área Montacargas.
     */
    public function store(StoreActivoRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $areaNombre = ActivoTipo::from($validated['tipo']) === ActivoTipo::Camion ? 'Camiones' : 'Montacargas';
        $area = Area::query()->where('nombre', $areaNombre)->firstOrFail();

        Activo::create([
            ...$validated,
            'area_id' => $area->id,
            'activo' => true,
        ]);

        return back()->with('status', 'Activo creado correctamente.');
    }

    /**
     * HU-10/HU-11 — Inactivar/reactivar un activo sin perder su histórico.
     */
    public function toggleStatus(Activo $activo): RedirectResponse
    {
        $this->authorize('toggleStatus', Activo::class);

        $activo->update(['activo' => ! $activo->activo]);

        return back()->with('status', $activo->activo ? 'Activo activado.' : 'Activo inactivado.');
    }
}
