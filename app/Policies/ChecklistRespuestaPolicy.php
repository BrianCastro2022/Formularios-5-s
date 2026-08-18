<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class ChecklistRespuestaPolicy
{
    /**
     * Solo el rol Responsable diligencia y consulta su propio historial (Fase 4).
     * Necesita además tener un área asignada.
     */
    public function viewAny(User $user): bool
    {
        return $user->rol === UserRole::Responsable && $user->area_id !== null;
    }

    public function create(User $user): bool
    {
        return $user->rol === UserRole::Responsable && $user->area_id !== null;
    }
}
