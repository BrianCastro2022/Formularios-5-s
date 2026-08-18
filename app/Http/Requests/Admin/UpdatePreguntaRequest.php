<?php

namespace App\Http\Requests\Admin;

use App\Models\ChecklistPlantilla;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePreguntaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', ChecklistPlantilla::class);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'subcategoria' => ['nullable', 'string', 'max:255'],
            'texto' => ['required', 'string'],
        ];
    }
}
