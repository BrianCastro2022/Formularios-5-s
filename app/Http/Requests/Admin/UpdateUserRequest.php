<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('user'));
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
            'numero_identificacion' => [
                'required', 'string', 'max:50',
                Rule::unique('users', 'numero_identificacion')->ignore($this->route('user')),
            ],
            'email' => [
                'nullable', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($this->route('user')),
                'required_if:rol,'.UserRole::Responsable->value,
            ],
            'rol' => ['required', Rule::enum(UserRole::class)],
            'area_id' => ['nullable', 'required_if:rol,'.UserRole::Responsable->value, 'exists:areas,id'],
        ];
    }
}
