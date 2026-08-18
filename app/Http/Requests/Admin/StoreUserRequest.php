<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombres' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'tipo_identificacion' => ['required', Rule::in(['CC', 'CE', 'TI', 'PPT', 'Pasaporte'])],
            'numero_identificacion' => ['required', 'string', 'max:50', 'unique:users,numero_identificacion'],
            'rol' => ['required', Rule::enum(UserRole::class)],
            'area_id' => ['nullable', 'required_if:rol,'.UserRole::Responsable->value, 'exists:areas,id'],
        ];
    }
}
