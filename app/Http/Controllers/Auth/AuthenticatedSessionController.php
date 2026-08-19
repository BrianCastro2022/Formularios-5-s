<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();

        if ($user->must_change_password) {
            return redirect()->route('password.change.edit');
        }

        // No se usa redirect()->intended(): la URL "intended" queda en la sesión
        // desde el intento de acceso de CUALQUIER visitante anterior (incluso de
        // otro usuario/rol) y, si sobrevive hasta este login, mandaba al usuario
        // recién autenticado a una ruta de un rol distinto al suyo (403 intermitente
        // que se "arreglaba" con F5 porque la siguiente navegación ya no la usaba).
        if ($user->rol === UserRole::Responsable) {
            return redirect()->route('formulario.show');
        }

        return redirect()->route('dashboard');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
