import { CrearPlanAccionDialog } from '@/components/crear-plan-accion-dialog';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type Activo, type Area, type BreadcrumbItem, type User } from '@/types';
import { Head, Link } from '@inertiajs/react';
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
import { FileSpreadsheet, FileText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Line, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, RadialLinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const AREAS_CON_PLACA = ['Camiones', 'Montacargas'];

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
    top_oportunidades: {
        pregunta_id: number;
        texto: string;
        subcategoria: string | null;
        gaps: number;
        ultima_respuesta_detalle_id: number;
    }[];
    reincidencias: { texto: string; alcance: string; veces: number; ultima_respuesta_detalle_id: number }[];
    detalle_cruzado: { area: string; seccion_orden: number; seccion_nombre: string; total: number; promedio: number | null }[];
    planes_accion: { abierto: number; en_progreso: number; cerrado: number; vencido: number };
    meta: number;
}

interface DashboardProps {
    areas: Area[];
    activos: Activo[];
    metaDefault: number;
    responsables: User[];
}

export default function Dashboard({ areas, activos, metaDefault, responsables }: DashboardProps) {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];

    const [mes, setMes] = useState<string>('todos');
    const [anio, setAnio] = useState<string>(String(currentYear));
    const [areaId, setAreaId] = useState<string>('todas');
    const [activoId, setActivoId] = useState<string>('todos');
    const [meta, setMeta] = useState<number>(metaDefault);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const areaSeleccionada = areas.find((a) => String(a.id) === areaId);
    const requierePlaca = areaSeleccionada ? AREAS_CON_PLACA.includes(areaSeleccionada.nombre) : false;
    const activosDelArea = useMemo(() => activos.filter((a) => String(a.area_id) === areaId), [activos, areaId]);

    useEffect(() => {
        if (!requierePlaca && activoId !== 'todos') {
            setActivoId('todos');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [areaId]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (mes !== 'todos') params.set('mes', mes);
        if (anio !== 'todos') params.set('anio', anio);
        if (areaId !== 'todas') params.set('area_id', areaId);
        if (activoId !== 'todos') params.set('activo_id', activoId);
        params.set('meta', String(meta));

        setLoading(true);
        fetch(`${route('dashboard.data')}?${params.toString()}`, {
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json())
            .then((json: DashboardData) => setData(json))
            .finally(() => setLoading(false));
    }, [mes, anio, areaId, activoId, meta]);

    const barOptions: ChartOptions<'bar'> = {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.formattedValue}%` } } },
        scales: { y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } } },
    };

    const barHorizontalOptions: ChartOptions<'bar'> = {
        indexAxis: 'y' as const,
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.formattedValue}%` } } },
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
        plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.formattedValue}%` } } },
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 20, callback: (v) => `${v}%` } } },
    };

    const radarDataS = {
        labels: data?.por_s.map((s) => s.nombre) ?? [],
        datasets: [
            {
                label: '% adherencia',
                data: data?.por_s.map((s) => s.porcentaje ?? 0) ?? [],
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: '#2563eb',
                pointBackgroundColor: '#2563eb',
            },
        ],
    };

    const barDataArea = {
        labels: data?.por_area.map((a) => a.area) ?? [],
        datasets: [{ label: '% adherencia', data: data?.por_area.map((a) => a.promedio) ?? [], backgroundColor: '#0891b2' }],
    };

    const barDataSubcategoria = {
        labels: data?.por_subcategoria.map((s) => s.subcategoria) ?? [],
        datasets: [{ label: '% adherencia', data: data?.por_subcategoria.map((s) => s.promedio ?? 0) ?? [], backgroundColor: '#7c3aed' }],
    };

    const barDataEvaluador = {
        labels: data?.por_evaluador.map((e) => e.evaluador) ?? [],
        datasets: [{ label: '% adherencia', data: data?.por_evaluador.map((e) => e.promedio) ?? [], backgroundColor: '#16a34a' }],
    };

    const barDataOportunidades = {
        labels: data?.top_oportunidades.map((o) => (o.texto.length > 60 ? `${o.texto.slice(0, 60)}…` : o.texto)) ?? [],
        datasets: [{ label: 'Respuestas GAP', data: data?.top_oportunidades.map((o) => o.gaps) ?? [], backgroundColor: '#dc2626' }],
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
                borderColor: '#2563eb',
                backgroundColor: '#2563eb',
                tension: 0.3,
            },
            {
                label: 'Meta',
                data: data?.tendencia_mensual.map(() => meta) ?? [],
                borderColor: '#dc2626',
                borderDash: [6, 6],
                pointRadius: 0,
            },
        ],
    };

    // HU-28: pivotea el detalle plano (area, seccion) => matriz área × 1S-5S para la tabla cruzada.
    const areasEnDetalle = useMemo(() => [...new Set((data?.detalle_cruzado ?? []).map((d) => d.area))].sort(), [data]);
    const celda = (area: string, ordenSeccion: number) => data?.detalle_cruzado.find((d) => d.area === area && d.seccion_orden === ordenSeccion);

    // HU-29: exporta el dashboard con los filtros actualmente aplicados.
    const exportParams = useMemo(() => {
        const params = new URLSearchParams();
        if (mes !== 'todos') params.set('mes', mes);
        if (anio !== 'todos') params.set('anio', anio);
        if (areaId !== 'todas') params.set('area_id', areaId);
        if (activoId !== 'todos') params.set('activo_id', activoId);
        return params.toString();
    }, [mes, anio, areaId, activoId]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading title="Dashboard" description="Indicadores generales de adherencia 5S — CD Nariño." />
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={`${route('dashboard.exportar.pdf')}?${exportParams}`}>
                                <FileText className="h-4 w-4" />
                                Exportar PDF
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={`${route('dashboard.exportar.excel')}?${exportParams}`}>
                                <FileSpreadsheet className="h-4 w-4" />
                                Exportar Excel
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div className="grid gap-1.5">
                        <Label className="text-muted-foreground text-xs">Mes</Label>
                        <Select value={mes} onValueChange={setMes}>
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
                        <Select value={anio} onValueChange={setAnio}>
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
                        <Label className="text-muted-foreground text-xs">Placa</Label>
                        <Select value={activoId} onValueChange={setActivoId} disabled={!requierePlaca}>
                            <SelectTrigger>
                                <SelectValue placeholder={requierePlaca ? 'Todas' : 'No aplica'} />
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
                        <Label className="text-muted-foreground text-xs">Meta (%)</Label>
                        <Input type="number" min={0} max={100} value={meta} onChange={(e) => setMeta(Number(e.target.value))} />
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
                        <CardTitle className="text-muted-foreground text-sm font-medium">Planes de acción (HU-32)</CardTitle>
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
                        <Button variant="outline" size="sm" className="ml-auto self-center" asChild>
                            <Link href={route('planes-accion.index')}>Ver todos los planes</Link>
                        </Button>
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
                                    <div key={fila.pregunta_id} className="flex items-center justify-between gap-3 text-sm">
                                        <span className="flex-1">
                                            {fila.texto} <span className="text-muted-foreground">({fila.gaps} GAPs)</span>
                                        </span>
                                        <CrearPlanAccionDialog respuestaDetalleId={fila.ultima_respuesta_detalle_id} responsables={responsables} />
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
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(data?.reincidencias.length ?? 0) === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-muted-foreground text-center">
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
                                        <TableCell className="text-right">
                                            <CrearPlanAccionDialog
                                                respuestaDetalleId={fila.ultima_respuesta_detalle_id}
                                                responsables={responsables}
                                            />
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
        </AppLayout>
    );
}
