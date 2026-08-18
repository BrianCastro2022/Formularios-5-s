<?php

namespace App\Http\Requests\Admin;

use App\Enums\ActivoTipo;
use App\Models\Activo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreActivoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Activo::class);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tipo' => ['required', Rule::enum(ActivoTipo::class)],
            'codigo' => ['required', 'string', 'max:50', 'unique:activos,codigo'],
        ];
    }
}
