<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Area;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * HU-08 — Listar y buscar usuarios con filtros por área, rol y estado.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $filters = $request->only(['q', 'area_id', 'rol', 'estado']);

        $users = User::query()
            ->with('area')
            ->when($filters['q'] ?? null, function ($query, $q) {
                $query->where(function ($query) use ($q) {
                    $query->where('nombres', 'like', "%{$q}%")
                        ->orWhere('apellidos', 'like', "%{$q}%")
                        ->orWhere('numero_identificacion', 'like', "%{$q}%");
                });
            })
            ->when($filters['area_id'] ?? null, fn ($query, $areaId) => $query->where('area_id', $areaId))
            ->when($filters['rol'] ?? null, fn ($query, $rol) => $query->where('rol', $rol))
            ->when(($filters['estado'] ?? null) !== null && $filters['estado'] !== '', function ($query) use ($filters) {
                $query->where('activo', $filters['estado'] === 'activo');
            })
            ->orderBy('nombres')
            ->orderBy('apellidos')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'areas' => Area::query()->orderBy('nombre')->get(['id', 'nombre']),
            'filters' => $filters,
        ]);
    }

    /**
     * HU-05 — Formulario de creación.
     */
    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('admin/users/create', [
            'areas' => Area::query()->orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    /**
     * HU-05 — Crear usuario. La contraseña inicial es igual al número de
     * identificación y queda marcada para cambio obligatorio en el primer login.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        User::create([
            ...$validated,
            'area_id' => $validated['rol'] === UserRole::Responsable->value ? $validated['area_id'] : null,
            'password' => $validated['numero_identificacion'],
            'must_change_password' => true,
            'activo' => true,
        ]);

        return to_route('admin.users.index')->with('status', 'Usuario creado correctamente.');
    }

    /**
     * HU-06 — Formulario de edición.
     */
    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'areas' => Area::query()->orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    /**
     * HU-06 — Editar datos y área asignada de un usuario existente.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        $user->update([
            ...$validated,
            'area_id' => $validated['rol'] === UserRole::Responsable->value ? $validated['area_id'] : null,
        ]);

        return to_route('admin.users.index')->with('status', 'Usuario actualizado correctamente.');
    }

    /**
     * HU-07 — Activar/inactivar usuario, sin perder su historial.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        $this->authorize('manageStatus', $user);

        $user->update(['activo' => ! $user->activo]);

        return back()->with('status', $user->activo ? 'Usuario activado.' : 'Usuario inactivado.');
    }

    /**
     * HU-09 — Restablecer la contraseña de un usuario (vuelve a ser su número
     * de identificación) y lo marca para cambio obligatorio en el próximo login.
     */
    public function resetPassword(User $user): RedirectResponse
    {
        $this->authorize('manageStatus', $user);

        $user->update([
            'password' => $user->numero_identificacion,
            'must_change_password' => true,
        ]);

        return back()->with('status', 'Contraseña restablecida.');
    }
}
