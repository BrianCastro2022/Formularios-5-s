<?php

namespace App\Http\Requests;

use App\Models\PlanAccion;
use App\Models\RespuestaDetalle;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePlanAccionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', PlanAccion::class);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'respuesta_detalle_id' => ['required', 'integer', 'exists:respuestas_detalle,id'],
            'responsable_id' => ['required', 'integer', 'exists:users,id'],
            'descripcion' => ['required', 'string'],
            'fecha_limite' => ['required', 'date', 'after_or_equal:today'],
        ];
    }

    /**
     * Solo se pueden crear planes de acción sobre respuestas marcadas como GAP.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $respuestaDetalleId = $this->input('respuesta_detalle_id');

            if (! $respuestaDetalleId) {
                return;
            }

            $esGap = RespuestaDetalle::query()
                ->whereKey($respuestaDetalleId)
                ->whereHas('opcion', fn ($query) => $query->where('es_gap', true))
                ->exists();

            if (! $esGap) {
                $validator->errors()->add('respuesta_detalle_id', 'Solo se pueden crear planes de acción sobre respuestas marcadas como GAP.');
            }
        });
    }
}
