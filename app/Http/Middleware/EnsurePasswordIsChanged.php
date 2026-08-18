<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Fuerza a un usuario con must_change_password=true a pasar por /cambiar-password
 * antes de acceder a cualquier otra ruta protegida (HU-03).
 */
class EnsurePasswordIsChanged
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->must_change_password && ! $request->routeIs('password.change.edit', 'password.change.update', 'logout')) {
            return redirect()->route('password.change.edit');
        }

        return $next($request);
    }
}
