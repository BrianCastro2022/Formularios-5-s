import { CrearPlanAccionDialog } from '@/components/crear-plan-accion-dialog';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ChecklistRespuesta, type User } from '@/types';
import { Head } from '@inertiajs/react';

export default function HistorialDetalle({ checklist, responsables }: { checklist: ChecklistRespuesta; responsables: User[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Historial', href: '/mi-formulario/historial' },
        { title: checklist.fecha, href: `/mi-formulario/historial/${checklist.id}` },
    ];

    const secciones = new Map<number, { nombre: string; detalles: NonNullable<ChecklistRespuesta['detalles']> }>();
    (checklist.detalles ?? []).forEach((detalle) => {
        const seccion = detalle.pregunta?.seccion;
        if (!seccion) return;
        if (!secciones.has(seccion.id)) {
            secciones.set(seccion.id, { nombre: seccion.nombre, detalles: [] });
        }
        secciones.get(seccion.id)!.detalles.push(detalle);
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Checklist ${checklist.fecha}`} />

            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title={checklist.checklist_plantilla?.nombre ?? 'Checklist'}
                    description={`${checklist.fecha}${checklist.activo ? ` — ${checklist.activo.codigo}` : ''} — Resultado: ${checklist.resultado_porcentaje ?? '—'}%`}
                />

                {[...secciones.values()].map((seccion) => (
                    <Card key={seccion.nombre}>
                        <CardHeader>
                            <CardTitle className="text-base">{seccion.nombre}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {seccion.detalles.map((detalle) => (
                                <div key={detalle.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                                    <div className="space-y-1">
                                        <p className="text-sm">{detalle.pregunta?.texto}</p>
                                        {detalle.observacion && <p className="text-muted-foreground text-xs italic">"{detalle.observacion}"</p>}
                                        {detalle.foto_url && (
                                            <a href={`/storage/${detalle.foto_url}`} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={`/storage/${detalle.foto_url}`}
                                                    alt="Evidencia fotográfica"
                                                    className="mt-1 h-24 w-24 rounded-md border object-cover"
                                                />
                                            </a>
                                        )}
                                        {detalle.planes_accion && detalle.planes_accion.length > 0 && (
                                            <p className="text-muted-foreground text-xs">
                                                {detalle.planes_accion.length} plan(es) de acción registrado(s).
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Badge variant={detalle.opcion?.es_gap ? 'destructive' : 'outline'}>{detalle.opcion?.texto_opcion}</Badge>
                                        {detalle.opcion?.es_gap && (
                                            <CrearPlanAccionDialog
                                                respuestaDetalleId={detalle.id}
                                                responsables={responsables}
                                                gapPregunta={detalle.pregunta?.texto ?? ''}
                                                gapOpcion={detalle.opcion?.texto_opcion}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AppLayout>
    );
}
