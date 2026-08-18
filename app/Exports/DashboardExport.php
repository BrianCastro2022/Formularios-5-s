<?php

namespace App\Exports;

use Illuminate\Support\Collection as SupportCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

/**
 * HU-29 — Exporta el dashboard (con los filtros aplicados) a Excel: una hoja por
 * cada bloque, con exactamente los mismos números que se ven en pantalla
 * (usa el mismo array que produce DashboardAggregator).
 */
class DashboardExport implements WithMultipleSheets
{
    public function __construct(private readonly array $datos) {}

    public function sheets(): array
    {
        $d = $this->datos;

        return [
            new ArraySheet('Resumen', ['Indicador', 'Valor'], [
                ['Checklists ejecutados', $d['tarjetas']['checklists_ejecutados']],
                ['Activos revisados', $d['tarjetas']['activos_revisados']],
                ['% Adherencia general', $d['tarjetas']['adherencia_general']],
            ]),
            new ArraySheet(
                'Por área',
                ['Área', 'Checklists', '% Adherencia'],
                $this->filas($d['por_area'], ['area', 'total', 'promedio'])
            ),
            new ArraySheet(
                'Por evaluador',
                ['Evaluador', 'Checklists', '% Adherencia'],
                $this->filas($d['por_evaluador'], ['evaluador', 'total', 'promedio'])
            ),
            new ArraySheet(
                'Por subcategoría',
                ['Subcategoría', 'Respuestas', '% Adherencia'],
                $this->filas($d['por_subcategoria'], ['subcategoria', 'total', 'promedio'])
            ),
            new ArraySheet(
                'Por activo',
                ['Activo', 'Checklists', '% Adherencia'],
                $this->filas($d['por_activo'], ['activo', 'total', 'promedio'])
            ),
            new ArraySheet(
                'Top oportunidades',
                ['Pregunta', 'Subcategoría', 'Respuestas GAP'],
                $this->filas($d['top_oportunidades'], ['texto', 'subcategoria', 'gaps'])
            ),
            new ArraySheet(
                'Reincidencias',
                ['Pregunta', 'Área/Activo', 'Veces'],
                $this->filas($d['reincidencias'], ['texto', 'alcance', 'veces'])
            ),
            new ArraySheet(
                'Detalle cruzado',
                ['Área', 'Sección', 'Respuestas', '% Adherencia'],
                $this->filas($d['detalle_cruzado'], ['area', 'seccion_nombre', 'total', 'promedio'])
            ),
            new ArraySheet('Planes de acción', ['Estado', 'Cantidad'], [
                ['Abiertos', $d['planes_accion']['abierto'] ?? 0],
                ['En progreso', $d['planes_accion']['en_progreso'] ?? 0],
                ['Cerrados', $d['planes_accion']['cerrado'] ?? 0],
                ['Vencidos', $d['planes_accion']['vencido'] ?? 0],
            ]),
        ];
    }

    /**
     * @param  SupportCollection<int, array<string, mixed>>|array<int, array<string, mixed>>  $bloque
     * @param  array<int, string>  $columnas
     * @return array<int, array<int, mixed>>
     */
    private function filas(SupportCollection|array $bloque, array $columnas): array
    {
        return collect($bloque)
            ->map(fn (array $fila) => collect($columnas)->map(fn (string $col) => $fila[$col] ?? null)->all())
            ->all();
    }
}
