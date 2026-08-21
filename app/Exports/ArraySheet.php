<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithCharts;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Legend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title as ChartTitle;

/**
 * Hoja genérica reutilizable: título + encabezados + filas ya formateadas.
 * Evita crear una clase de exportación distinta por cada bloque del dashboard.
 *
 * Si se indican $columnaEtiqueta/$columnaValor, además dibuja un gráfico nativo
 * de Excel (editable, no una imagen) a partir de esas dos columnas — a pedido
 * del negocio, para que el Excel exportado no sean solo tablas.
 */
class ArraySheet implements FromArray, WithCharts, WithHeadings, WithTitle
{
    /**
     * @param  array<int, string>  $encabezados
     * @param  array<int, array<int, mixed>>  $filas
     * @param  int|null  $columnaEtiqueta  Índice (0-based) de la columna a usar como eje de categorías.
     * @param  int|null  $columnaValor  Índice (0-based) de la columna numérica a graficar.
     * @param  'bar'|'pie'  $tipoGrafico
     */
    public function __construct(
        private readonly string $titulo,
        private readonly array $encabezados,
        private readonly array $filas,
        private readonly ?int $columnaEtiqueta = null,
        private readonly ?int $columnaValor = null,
        private readonly string $tipoGrafico = 'bar',
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

    /**
     * @return Chart|array<int, Chart>
     */
    public function charts(): Chart|array
    {
        if ($this->columnaEtiqueta === null || $this->columnaValor === null || empty($this->filas)) {
            return [];
        }

        $primeraFila = 2; // fila 1 = encabezados
        $ultimaFila = $primeraFila + count($this->filas) - 1;
        $colEtiqueta = Coordinate::stringFromColumnIndex($this->columnaEtiqueta + 1);
        $colValor = Coordinate::stringFromColumnIndex($this->columnaValor + 1);

        $etiquetas = new DataSeriesValues(
            DataSeriesValues::DATASERIES_TYPE_STRING,
            "'{$this->titulo}'!\${$colEtiqueta}\${$primeraFila}:\${$colEtiqueta}\${$ultimaFila}",
            null,
            count($this->filas)
        );

        $valores = new DataSeriesValues(
            DataSeriesValues::DATASERIES_TYPE_NUMBER,
            "'{$this->titulo}'!\${$colValor}\${$primeraFila}:\${$colValor}\${$ultimaFila}",
            null,
            count($this->filas)
        );

        $tipo = $this->tipoGrafico === 'pie' ? DataSeries::TYPE_PIECHART : DataSeries::TYPE_BARCHART;
        $agrupacion = $this->tipoGrafico === 'pie' ? DataSeries::GROUPING_STANDARD : DataSeries::GROUPING_CLUSTERED;

        $series = new DataSeries($tipo, $agrupacion, [0], [], [$etiquetas], [$valores]);

        $plotArea = new PlotArea(null, [$series]);
        $legend = new Legend(Legend::POSITION_RIGHT, null, false);
        $chart = new Chart('grafico_'.$this->titulo, new ChartTitle($this->titulo), $legend, $plotArea);

        $columnaAncla = Coordinate::stringFromColumnIndex(count($this->encabezados) + 2);
        $chart->setTopLeftPosition("{$columnaAncla}2");
        $chart->setBottomRightPosition(Coordinate::stringFromColumnIndex(count($this->encabezados) + 12).'20');

        return $chart;
    }
}
