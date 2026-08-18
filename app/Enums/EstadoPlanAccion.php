<?php

namespace App\Enums;

/**
 * Estados guardados de un plan de acción (Fase 8). "Vencido" no es un caso de este
 * enum — se calcula dinámicamente en PlanAccion::estadoEfectivo(), no se persiste.
 */
enum EstadoPlanAccion: string
{
    case Abierto = 'abierto';
    case EnProgreso = 'en_progreso';
    case Cerrado = 'cerrado';
}
