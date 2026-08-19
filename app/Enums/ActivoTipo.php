<?php

namespace App\Enums;

enum ActivoTipo: string
{
    case Camion = 'camion';
    case Montacargas = 'montacargas';
    case ZonaAlmacen = 'zona_almacen';
    case ZonaAdministrativo = 'zona_administrativo';

    /**
     * Nombre del área (tabla `areas`) a la que pertenece este tipo de activo.
     * Cada tipo mapea a exactamente un área.
     */
    public function areaNombre(): string
    {
        return match ($this) {
            self::Camion => 'Camiones',
            self::Montacargas => 'Montacargas',
            self::ZonaAlmacen => 'Almacén',
            self::ZonaAdministrativo => 'Administrativo',
        };
    }
}
