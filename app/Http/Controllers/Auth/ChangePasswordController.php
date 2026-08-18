<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ChangePasswordController extends Controller
{
    /**
     * Show the forced "change your password" page (HU-03).
     */
    public function edit(): Response
    {
        return Inertia::render('auth/change-password');
    }

    /**
     * Update the user's password and clear the forced-change flag.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user = $request->user();

        $user->update([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
        ]);

        if ($user->rol === UserRole::Responsable) {
            return redirect()->route('formulario.show');
        }

        return redirect()->route('dashboard');
    }
}
