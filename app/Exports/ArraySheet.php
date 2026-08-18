<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

/**
 * Hoja genérica reutilizable: título + encabezados + filas ya formateadas.
 * Evita crear una clase de exportación distinta por cada bloque del dashboard.
 */
class ArraySheet implements FromArray, WithHeadings, WithTitle
{
    /**
     * @param  array<int, string>  $encabezados
     * @param  array<int, array<int, mixed>>  $filas
     */
    public function __construct(
        private readonly string $titulo,
        private readonly array $encabezados,
        private readonly array $filas,
    ) {}

    public function array(): array
    {
        return $this->filas;
    }

    public function headings(): array
    {
        return $this->encabezados;
    }

    public function title(): string
    {
        return $this->titulo;
    }
}
