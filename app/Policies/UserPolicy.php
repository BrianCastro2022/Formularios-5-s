<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class UserPolicy
{
    /**
     * Solo el rol Administrador gestiona usuarios (Fase 2).
     */
    public function viewAny(User $user): bool
    {
        return $user->rol === UserRole::Admin;
    }

    public function view(User $user, User $model): bool
    {
        return $user->rol === UserRole::Admin;
    }

    public function create(User $user): bool
    {
        return $user->rol === UserRole::Admin;
    }

    public function update(User $user, User $model): bool
    {
        return $user->rol === UserRole::Admin;
    }

    /**
     * Activar/inactivar (HU-07) y restablecer contraseña (HU-09).
     * Un administrador no puede desactivarse ni resetearse la contraseña a sí mismo
     * desde este panel, para evitar quedarse fuera del sistema por accidente.
     */
    public function manageStatus(User $user, User $model): bool
    {
        return $user->rol === UserRole::Admin && $user->isNot($model);
    }
}
