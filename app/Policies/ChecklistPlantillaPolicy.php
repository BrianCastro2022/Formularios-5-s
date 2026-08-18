<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class ChecklistPlantillaPolicy
{
    /**
     * Solo el rol Administrador gestiona checklists (Fase 3, HU-12/HU-13).
     */
    public function viewAny(User $user): bool
    {
        return $user->rol === UserRole::Admin;
    }

    public function view(User $user): bool
    {
        return $user->rol === UserRole::Admin;
    }

    public function update(User $user): bool
    {
        return $user->rol === UserRole::Admin;
    }
}
