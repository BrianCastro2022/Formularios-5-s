import { CrearPlanAccionDialog } from '@/components/crear-plan-accion-dialog';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import {
    type Area,
    type BreadcrumbItem,
    type EstadoPlanAccion,
    type Paginated,
    type PlanAccion,
    type RespuestaDetalle,
    type User,
} from '@/types';
import { Head, Link, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Planes de acción', href: '/planes-accion' }];

const ESTADOS: { value: EstadoPlanAccion; label: string }[] = [
    { value: 'abierto', label: 'Abierto' },
    { value: 'en_progreso', label: 'En progreso' },
    { value: 'cerrado', label: 'Cerrado' },
];

const ETIQUETAS_ESTADO: Record<EstadoPlanAccion, string> = {
    abierto: 'Abierto',
    en_progreso: 'En progreso',
    cerrado: 'Cerrado',
    vencido: 'Vencido',
};

const VARIANTE_ESTADO: Record<EstadoPlanAccion, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    abierto: 'secondary',
    en_progreso: 'outline',
    cerrado: 'default',
    vencido: 'destructive',
};

interface IndexProps {
    planes: Paginated<PlanAccion>;
    gapsPendientes: Paginated<RespuestaDetalle>;
    areas: Area[];
    responsables: User[];
    filtros: { estado?: string; area_id?: string };
    esAdmin: boolean;
}

/** Controles de paginación (máx. 10 registros por página), mismo patrón que admin/users. */
function Paginacion({ paginado }: { paginado: Paginated<unknown> }) {
    if (paginado.last_page <= 1) return null;

    return (
        <div className="flex flex-wrap items-center gap-1">
            {paginado.links.map((link, index) => (
                <Button key={index} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url} asChild={!!link.url}>
                    {link.url ? (
                        <Link href={link.url} preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} />
                    ) : (
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    )}
                </Button>
            ))}
        </div>
    );
}

export default function PlanesAccionIndex({ planes, gapsPendientes, areas, responsables, filtros, esAdmin }: IndexProps) {
    const applyFilters = (next: Partial<IndexProps['filtros']>) => {
        router.get(route('planes-accion.index'), { ...filtros, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const actualizarEstado = (plan: PlanAccion, estado: EstadoPlanAccion) => {
        if (estado === 'vencido') return;
        router.patch(route('planes-accion.update-estado', plan.id), { estado }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Planes de acción" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading
                    title="Planes de acción"
                    description={
                        esAdmin ? 'Seguimiento de acciones correctivas sobre los GAPs detectados.' : 'Acciones correctivas que tienes asignadas.'
                    }
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Select
                        value={filtros.estado ?? 'todos'}
                        onValueChange={(value) => applyFilters({ estado: value === 'todos' ? undefined : value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos los estados</SelectItem>
                            <SelectItem value="abierto">Abierto</SelectItem>
                            <SelectItem value="en_progreso">En progreso</SelectItem>
                            <SelectItem value="cerrado">Cerrado</SelectItem>
                            <SelectItem value="vencido">Vencido</SelectItem>
                        </SelectContent>
                    </Select>

                    {esAdmin && (
                        <Select
                            value={filtros.area_id ?? 'todas'}
                            onValueChange={(value) => applyFilters({ area_id: value === 'todas' ? undefined : value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Área" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todas">Todas las áreas</SelectItem>
                                {areas.map((area) => (
                                    <SelectItem key={area.id} value={String(area.id)}>
                                        {area.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">GAPs sin plan de acción ({gapsPendientes.total})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {gapsPendientes.data.length === 0 && (
                            <p className="text-muted-foreground text-sm">No hay GAPs pendientes por convertir en plan de acción.</p>
                        )}

                        {gapsPendientes.data.map((detalle) => {
                            const pregunta = detalle.pregunta;
                            const areaNombre = pregunta?.seccion?.checklist_plantilla?.area?.nombre;
                            const activoCodigo = detalle.checklist_respuesta?.activo?.codigo;
                            const evaluador = detalle.checklist_respuesta?.usuario?.name;

                            return (
                                <div
                                    key={detalle.id}
                                    className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm">{pregunta?.texto}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {[areaNombre, activoCodigo, evaluador].filter(Boolean).join(' — ')}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                                        <Badge variant="destructive">{detalle.opcion?.texto_opcion}</Badge>
                                        <CrearPlanAccionDialog
                                            respuestaDetalleId={detalle.id}
                                            responsables={responsables}
                                            gapPregunta={pregunta?.texto ?? ''}
                                            gapOpcion={detalle.opcion?.texto_opcion}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                    {gapsPendientes.data.length > 0 && (
                        <CardContent className="pt-0">
                            <Paginacion paginado={gapsPendientes} />
                        </CardContent>
                    )}
                </Card>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pregunta (GAP)</TableHead>
                                <TableHead>Área/Activo</TableHead>
                                {esAdmin && <TableHead>Responsable</TableHead>}
                                <TableHead>Descripción</TableHead>
                                <TableHead>Fecha límite</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {planes.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                                        No hay planes de acción con estos filtros.
                                    </TableCell>
                                </TableRow>
                            )}

                            {planes.data.map((plan) => {
                                const pregunta = plan.respuesta_detalle?.pregunta;
                                const areaNombre = pregunta?.seccion?.checklist_plantilla?.area?.nombre;
                                const activoCodigo = plan.respuesta_detalle?.checklist_respuesta?.activo?.codigo;

                                return (
                                    <TableRow key={plan.id}>
                                        <TableCell className="max-w-xs">{pregunta?.texto ?? '—'}</TableCell>
                                        <TableCell>{activoCodigo ?? areaNombre ?? '—'}</TableCell>
                                        {esAdmin && <TableCell>{plan.responsable?.name}</TableCell>}
                                        <TableCell className="max-w-xs">{plan.descripcion}</TableCell>
                                        <TableCell>{plan.fecha_limite}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={VARIANTE_ESTADO[plan.estado_efectivo]}>
                                                    {ETIQUETAS_ESTADO[plan.estado_efectivo]}
                                                </Badge>
                                                {plan.estado_efectivo !== 'cerrado' && (
                                                    <Select
                                                        value={plan.estado}
                                                        onValueChange={(value) => actualizarEstado(plan, value as EstadoPlanAccion)}
                                                    >
                                                        <SelectTrigger className="h-8 w-36">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ESTADOS.map((estado) => (
                                                                <SelectItem key={estado.value} value={estado.value}>
                                                                    {estado.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <Paginacion paginado={planes} />
            </div>
        </AppLayout>
    );
}
