<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class ActivoPolicy
{
    /**
     * Solo el rol Administrador gestiona el catálogo de activos (Fase 3, HU-10/HU-11).
     */
    public function viewAny(User $user): bool
    {
        return $user->rol === UserRole::Admin;
    }

    public function create(User $user): bool
    {
        return $user->rol === UserRole::Admin;
    }

    public function toggleStatus(User $user): bool
    {
        return $user->rol === UserRole::Admin;
    }
}
