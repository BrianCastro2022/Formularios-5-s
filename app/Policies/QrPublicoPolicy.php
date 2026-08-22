<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class QrPublicoPolicy
{
    /**
     * Solo el rol Administrador gestiona el QR de acceso público al dashboard.
     */
    public function view(User $user): bool
    {
        return $user->rol === UserRole::Admin;
    }

    public function update(User $user): bool
    {
        return $user->rol === UserRole::Admin;
    }
}
