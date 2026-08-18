<?php

namespace App\Http\Requests\Admin;

use App\Models\ChecklistPlantilla;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePreguntaRequest extends FormRequest
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
            'seccion_id' => [
                'required',
                Rule::exists('secciones_5s', 'id')->where('checklist_plantilla_id', $this->route('checklist')->id),
            ],
            'subcategoria' => ['nullable', 'string', 'max:255'],
            'texto' => ['required', 'string'],
        ];
    }
}
