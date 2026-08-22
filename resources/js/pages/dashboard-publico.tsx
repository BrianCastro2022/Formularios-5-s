import AppLogo from '@/components/app-logo';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Activo, type Area } from '@/types';
import { Head } from '@inertiajs/react';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    RadialLinearScale,
    Title,
    Tooltip,
    type ChartOptions,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { FilterX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Line, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, RadialLinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, annotationPlugin);

const AREAS_CON_ACTIVO = ['Camiones', 'Montacargas', 'Almacén', 'Administrativo'];

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const NOMBRES_5S = ['Clasificación', 'Orden', 'Limpieza', 'Estandarización', 'Disciplina'];

interface DashboardData {
    tarjetas: {
        checklists_ejecutados: number;
        activos_revisados: number;
        adherencia_general: number | null;
    };
    por_area: { area: string; total: number; promedio: number }[];
    tendencia_mensual: { periodo: string; total: number; promedio: number }[];
    por_s: { orden: number; nombre: string; porcentaje: number | null }[];
    por_evaluador: { evaluador: string; total: number; promedio: number }[];
    por_subcategoria: { subcategoria: string; total: number; promedio: number | null }[];
    por_activo: { activo: string; total: number; promedio: number }[];
    top_oportunidades: { pregunta_id: number; texto: string; subcategoria: string | null; gaps: number }[];
    reincidencias: { texto: string; alcance: string; veces: number }[];
    detalle_cruzado: { area: string; seccion_orden: number; seccion_nombre: string; total: number; promedio: number | null }[];
    planes_accion: { abierto: number; en_progreso: number; cerrado: number; vencido: number };
    meta: number;
}

interface DashboardPublicoProps {
    areas: Area[];
    activos: Activo[];
    metaDefault: number;
    token: string;
}

/**
 * Vista pública y de solo lectura del dashboard, servida detrás del QR
 * administrado en admin/qr-publico. A propósito NO usa AppLayout (no hay
 * sesión: nada de sidebar, menú de usuario ni acciones de crear/editar) y
 * pide los datos a qr.publico.data en vez de dashboard.data.
 */
export default function DashboardPublico({ areas, activos, metaDefault, token }: DashboardPublicoProps) {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];

    const [mes, setMes] = useState<string>('todos');
    const [anio, setAnio] = useState<string>(String(currentYear));
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');
    const [areaId, setAreaId] = useState<string>('todas');
    const [activoId, setActivoId] = useState<string>('todos');
    const [meta] = useState<number>(metaDefault);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const hayRangoFechas = fechaDesde !== '' || fechaHasta !== '';

    const limpiarFiltros = () => {
        setMes('todos');
        setAnio(String(currentYear));
        setFechaDesde('');
        setFechaHasta('');
        setAreaId('todas');
        setActivoId('todos');
    };

    const areaSeleccionada = areas.find((a) => String(a.id) === areaId);
    const requiereActivo = areaSeleccionada ? AREAS_CON_ACTIVO.includes(areaSeleccionada.nombre) : false;
    const activosDelArea = useMemo(() => activos.filter((a) => String(a.area_id) === areaId), [activos, areaId]);

    useEffect(() => {
        if (!requiereActivo && activoId !== 'todos') {
            setActivoId('todos');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [areaId]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (hayRangoFechas) {
            if (fechaDesde) params.set('fecha_desde', fechaDesde);
            if (fechaHasta) params.set('fecha_hasta', fechaHasta);
        } else {
            if (mes !== 'todos') params.set('mes', mes);
            if (anio !== 'todos') params.set('anio', anio);
        }
        if (areaId !== 'todas') params.set('area_id', areaId);
        if (activoId !== 'todos') params.set('activo_id', activoId);
        params.set('meta', String(meta));

        setLoading(true);
        fetch(`${route('qr.publico.data', token)}?${params.toString()}`, {
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json())
            .then((json: DashboardData) => setData(json))
            .finally(() => setLoading(false));
    }, [mes, anio, fechaDesde, fechaHasta, hayRangoFechas, areaId, activoId, meta, token]);

    const metaAnnotation = (axis: 'x' | 'y') => ({
        metaLine: {
            type: 'line' as const,
            [`${axis}Min`]: meta,
            [`${axis}Max`]: meta,
            borderColor: '#E6271A',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
                display: true,
                content: `Meta ${meta}%`,
                position: 'end' as const,
                backgroundColor: '#E6271A',
                color: '#fff',
                font: { size: 10 },
            },
        },
    });

    const barOptions: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => `${ctx.formattedValue}%` } },
            annotation: { annotations: metaAnnotation('y') },
        },
        scales: { y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } } },
    };

    const barHorizontalOptions: ChartOptions<'bar'> = {
        indexAxis: 'y' as const,
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => `${ctx.formattedValue}%` } },
            annotation: { annotations: metaAnnotation('x') },
        },
        scales: { x: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } } },
    };

    const gapsHorizontalOptions: ChartOptions<'bar'> = {
        indexAxis: 'y' as const,
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { min: 0, ticks: { stepSize: 1 } } },
    };

    const radarOptions: ChartOptions<'radar'> = {
        responsive: true,
        plugins: {
            legend: { display: true, position: 'bottom' as const },
            tooltip: { callbacks: { label: (ctx) => `${ctx.formattedValue}%` } },
        },
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 20, callback: (v) => `${v}%` } } },
    };

    const radarDataS = {
        labels: data?.por_s.map((s) => s.nombre) ?? [],
        datasets: [
            {
                label: '% adherencia',
                data: data?.por_s.map((s) => s.porcentaje ?? 0) ?? [],
                backgroundColor: 'rgba(47, 77, 177, 0.2)',
                borderColor: '#2F4DB1',
                pointBackgroundColor: '#2F4DB1',
            },
            {
                label: `Meta (${meta}%)`,
                data: data?.por_s.map(() => meta) ?? [],
                backgroundColor: 'transparent',
                borderColor: '#E6271A',
                borderDash: [6, 6],
                pointRadius: 0,
            },
        ],
    };

    const barDataArea = {
        labels: data?.por_area.map((a) => a.area) ?? [],
        datasets: [{ label: '% adherencia', data: data?.por_area.map((a) => a.promedio) ?? [], backgroundColor: '#2D8CC3' }],
    };

    const barDataSubcategoria = {
        labels: data?.por_subcategoria.map((s) => s.subcategoria) ?? [],
        datasets: [{ label: '% adherencia', data: data?.por_subcategoria.map((s) => s.promedio ?? 0) ?? [], backgroundColor: '#2F4DB1' }],
    };

    const barDataEvaluador = {
        labels: data?.por_evaluador.map((e) => e.evaluador) ?? [],
        datasets: [{ label: '% adherencia', data: data?.por_evaluador.map((e) => e.promedio) ?? [], backgroundColor: '#68B143' }],
    };

    const barDataOportunidades = {
        labels: data?.top_oportunidades.map((o) => (o.texto.length > 60 ? `${o.texto.slice(0, 60)}…` : o.texto)) ?? [],
        datasets: [{ label: 'Respuestas GAP', data: data?.top_oportunidades.map((o) => o.gaps) ?? [], backgroundColor: '#E6271A' }],
    };

    const lineOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue}%` } } },
        scales: { y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } } },
    };

    const lineDataTendencia = {
        labels: data?.tendencia_mensual.map((t) => t.periodo) ?? [],
        datasets: [
            {
                label: '% adherencia',
                data: data?.tendencia_mensual.map((t) => t.promedio) ?? [],
                borderColor: '#2F4DB1',
                backgroundColor: '#2F4DB1',
                tension: 0.3,
            },
            {
                label: 'Meta',
                data: data?.tendencia_mensual.map(() => meta) ?? [],
                borderColor: '#E6271A',
                borderDash: [6, 6],
                pointRadius: 0,
            },
        ],
    };

    const areasEnDetalle = useMemo(() => [...new Set((data?.detalle_cruzado ?? []).map((d) => d.area))].sort(), [data]);
    const celda = (area: string, ordenSeccion: number) => data?.detalle_cruzado.find((d) => d.area === area && d.seccion_orden === ordenSeccion);

    return (
        <>
            <Head title="Dashboard público — Software 5S CD Nariño">
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="bg-background min-h-screen">
                <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
                    <div className="flex items-center">
                        <AppLogo />
                    </div>
                    <Badge variant="secondary">Vista pública — solo lectura</Badge>
                </header>

                <div className="mx-auto flex max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6">
                    <Heading title="Dashboard" description="Indicadores generales de adherencia 5S — CD Nariño." />

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                        <div className="grid gap-1.5">
                            <Label className="text-muted-foreground text-xs">Mes</Label>
                            <Select value={mes} onValueChange={setMes} disabled={hayRangoFechas}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    {MESES.map((nombre, index) => (
                                        <SelectItem key={nombre} value={String(index + 1)}>
                                            {nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-muted-foreground text-xs">Año</Label>
                            <Select value={anio} onValueChange={setAnio} disabled={hayRangoFechas}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={String(y)}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-muted-foreground text-xs">Desde</Label>
                            <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} max={fechaHasta || undefined} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-muted-foreground text-xs">Hasta</Label>
                            <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} min={fechaDesde || undefined} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-muted-foreground text-xs">Área</Label>
                            <Select value={areaId} onValueChange={setAreaId}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todas">Todas</SelectItem>
                                    {areas.map((area) => (
                                        <SelectItem key={area.id} value={String(area.id)}>
                                            {area.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-muted-foreground text-xs">Activo</Label>
                            <Select value={activoId} onValueChange={setActivoId} disabled={!requiereActivo}>
                                <SelectTrigger>
                                    <SelectValue placeholder={requiereActivo ? 'Todas' : 'No aplica'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todas</SelectItem>
                                    {activosDelArea.map((activo) => (
                                        <SelectItem key={activo.id} value={String(activo.id)}>
                                            {activo.codigo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-muted-foreground text-xs">&nbsp;</Label>
                            <Button type="button" variant="outline" size="sm" onClick={limpiarFiltros} className="w-full">
                                <FilterX className="h-4 w-4" />
                                Limpiar filtros
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-muted-foreground text-sm font-medium">Checklists ejecutados</CardTitle>
                            </CardHeader>
                            <CardContent className="text-3xl font-bold">{data?.tarjetas.checklists_ejecutados ?? '—'}</CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-muted-foreground text-sm font-medium">Activos revisados</CardTitle>
                            </CardHeader>
                            <CardContent className="text-3xl font-bold">{data?.tarjetas.activos_revisados ?? '—'}</CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-muted-foreground text-sm font-medium">% Adherencia 5S general</CardTitle>
                            </CardHeader>
                            <CardContent className="text-3xl font-bold">
                                {data?.tarjetas.adherencia_general !== null && data?.tarjetas.adherencia_general !== undefined
                                    ? `${data.tarjetas.adherencia_general}%`
                                    : '—'}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">Planes de acción</CardTitle>
                            <p className="text-muted-foreground text-xs">Conteo global, no depende de los filtros de arriba.</p>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-6">
                            <div>
                                <div className="text-2xl font-bold">{data?.planes_accion.abierto ?? '—'}</div>
                                <div className="text-muted-foreground text-xs">Abiertos</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{data?.planes_accion.en_progreso ?? '—'}</div>
                                <div className="text-muted-foreground text-xs">En progreso</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{data?.planes_accion.cerrado ?? '—'}</div>
                                <div className="text-muted-foreground text-xs">Cerrados</div>
                            </div>
                            <div>
                                <div className="text-destructive text-2xl font-bold">{data?.planes_accion.vencido ?? '—'}</div>
                                <div className="text-muted-foreground text-xs">Vencidos</div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Resultado por las 5S</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Radar options={radarOptions} data={radarDataS} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Tendencia mensual</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Line options={lineOptions} data={lineDataTendencia} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Resultado por área</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Bar options={barOptions} data={barDataArea} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Resultado por subcategoría</CardTitle>
                                <p className="text-muted-foreground text-xs">Subcategorías con menor adherencia primero.</p>
                            </CardHeader>
                            <CardContent>
                                <Bar options={barHorizontalOptions} data={barDataSubcategoria} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Resultado por evaluador</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Bar options={barHorizontalOptions} data={barDataEvaluador} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Top oportunidades (preguntas con más GAPs)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Bar options={gapsHorizontalOptions} data={barDataOportunidades} />

                                <div className="space-y-2">
                                    {data?.top_oportunidades.map((fila) => (
                                        <div key={fila.pregunta_id} className="text-sm">
                                            {fila.texto} <span className="text-muted-foreground">({fila.gaps} GAPs)</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Resultado por vehículo/activo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Placa/Activo</TableHead>
                                        <TableHead>Checklists</TableHead>
                                        <TableHead>% adherencia</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(data?.por_activo.length ?? 0) === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-muted-foreground text-center">
                                                Sin datos para estos filtros.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {data?.por_activo.map((fila) => (
                                        <TableRow key={fila.activo}>
                                            <TableCell className="font-medium">{fila.activo}</TableCell>
                                            <TableCell>{fila.total}</TableCell>
                                            <TableCell>
                                                <Badge variant={fila.promedio >= meta ? 'default' : 'secondary'}>{fila.promedio}%</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Reincidencias</CardTitle>
                            <p className="text-muted-foreground text-xs">
                                Preguntas que se repiten como GAP en checklists sucesivos del mismo activo/área.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pregunta</TableHead>
                                        <TableHead>Área/Activo</TableHead>
                                        <TableHead>Veces</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(data?.reincidencias.length ?? 0) === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-muted-foreground text-center">
                                                No hay preguntas reincidentes con estos filtros.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {data?.reincidencias.map((fila, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{fila.texto}</TableCell>
                                            <TableCell>{fila.alcance}</TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">{fila.veces}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Detalle por área y sección</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Área</TableHead>
                                        {NOMBRES_5S.map((nombre) => (
                                            <TableHead key={nombre}>{nombre}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {areasEnDetalle.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-muted-foreground text-center">
                                                Sin datos para estos filtros.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {areasEnDetalle.map((area) => (
                                        <TableRow key={area}>
                                            <TableCell className="font-medium">{area}</TableCell>
                                            {NOMBRES_5S.map((_, index) => {
                                                const fila = celda(area, index + 1);
                                                return <TableCell key={index}>{fila ? `${fila.promedio}% (${fila.total})` : '—'}</TableCell>;
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {loading && <p className="text-muted-foreground text-center text-sm">Cargando...</p>}
                    {data && data.tarjetas.checklists_ejecutados === 0 && (
                        <p className="text-muted-foreground text-center text-sm">No hay checklists diligenciados con estos filtros.</p>
                    )}
                </div>
            </div>
        </>
    );
}
