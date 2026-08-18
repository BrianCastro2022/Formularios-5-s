<?php

namespace App\Services;

use App\Models\ChecklistRespuesta;
use App\Models\RespuestaDetalle;

/**
 * Calcula el % de adherencia de un checklist ya respondido.
 *
 * FÓRMULA PROVISIONAL — pendiente de confirmar con negocio (ver CLAUDE.md).
 * Por cada respuesta, normaliza el peso de la opción elegida a un 0-100% dentro
 * de la propia escala de esa pregunta (el peso más bajo de esa escala = 0%, el más
 * alto = 100%), y promedia esos porcentajes. Esto resuelve que la escala especial de
 * "Mantenimiento" en Camiones use pesos 0/1/3 en vez de 0-100: cada pregunta se
 * normaliza contra su propia escala antes de promediar, no se mezclan pesos crudos
 * de escalas distintas.
 * Las respuestas cuya opción es "No aplica" (excluye_promedio = true) no participan.
 * Aislado a propósito en este servicio, no mezclado con la lógica de guardado, para
 * poder ajustar la fórmula sin tocar el controlador cuando el negocio la confirme.
 *
 * El dashboard (Fase 5) reutiliza normalizar() para agregar por sección/5S sin
 * duplicar esta lógica.
 */
class AdherenciaCalculator
{
    public function calcular(ChecklistRespuesta $respuesta): ?float
    {
        $porcentajes = $respuesta->detalles
            ->map(fn (RespuestaDetalle $detalle) => $this->normalizar($detalle))
            ->filter(fn (?float $valor) => $valor !== null);

        if ($porcentajes->isEmpty()) {
            return null;
        }

        return round($porcentajes->avg(), 2);
    }

    /**
     * Normaliza una sola respuesta a un valor 0-100 dentro de su propia escala,
     * o null si la opción elegida no participa del promedio ("No aplica").
     */
    public function normalizar(RespuestaDetalle $detalle): ?float
    {
        $opcionElegida = $detalle->opcion;

        if ($opcionElegida->excluye_promedio || $opcionElegida->peso_numerico === null) {
            return null;
        }

        $escala = $detalle->pregunta->opciones()
            ->filter(fn ($opcion) => ! $opcion->excluye_promedio && $opcion->peso_numerico !== null);

        $min = $escala->min('peso_numerico');
        $max = $escala->max('peso_numerico');

        return $max === $min
            ? 100.0
            : (($opcionElegida->peso_numerico - $min) / ($max - $min)) * 100;
    }
}
