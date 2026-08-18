<?php

namespace App\Http\Requests\Formulario;

use App\Models\ChecklistRespuesta;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreChecklistRespuestaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', ChecklistRespuesta::class);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'activo_id' => ['nullable', 'exists:activos,id'],
            'respuestas' => ['required', 'array', 'min:1'],
            'respuestas.*.pregunta_id' => ['required', 'integer', 'exists:preguntas,id'],
            'respuestas.*.opcion_id' => ['required', 'integer', 'exists:escalas_opciones,id'],
            'respuestas.*.observacion' => ['nullable', 'string'],
            'respuestas.*.foto' => ['nullable', 'image', 'max:5120'],
        ];
    }
}
