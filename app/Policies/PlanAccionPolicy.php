<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\PlanAccion;
use App\Models\User;

class PlanAccionPolicy
{
    /**
     * HU-31 — "Como responsable o administrador, quiero registrar una acción
     * correctiva..." — cualquiera de los dos roles puede crear un plan, un
     * Responsable necesita tener área asignada (como en el resto de Fase 4).
     */
    public function create(User $user): bool
    {
        return $user->rol === UserRole::Admin || ($user->rol === UserRole::Responsable && $user->area_id !== null);
    }

    /**
     * Actualizar el estado: el administrador puede con cualquier plan; un
     * responsable solo con los que tiene asignados a él.
     */
    public function update(User $user, PlanAccion $planAccion): bool
    {
        return $user->rol === UserRole::Admin || $planAccion->responsable_id === $user->id;
    }

    /**
     * Ver el listado: administrador ve todos (con filtros), responsable solo
     * los suyos — el propio controlador ajusta el alcance de la consulta.
     */
    public function viewAny(User $user): bool
    {
        return $user->rol === UserRole::Admin || $user->rol === UserRole::Responsable;
    }
}
