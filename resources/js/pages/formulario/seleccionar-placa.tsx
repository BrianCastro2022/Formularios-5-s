import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type Activo, type BreadcrumbItem, type ChecklistPlantilla } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mi formulario', href: '/mi-formulario' }];

export default function SeleccionarPlaca({
    checklist,
    activos,
    completadosEstaSemana,
}: {
    checklist: ChecklistPlantilla;
    activos: Activo[];
    completadosEstaSemana: number[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Selecciona un activo" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading
                    title={checklist.nombre}
                    description={`Elige la placa, unidad o zona de ${checklist.area?.nombre.toLowerCase()} que vas a auditar. Cada una se puede diligenciar una vez por semana.`}
                />

                {activos.length === 0 && (
                    <p className="text-muted-foreground text-sm">No hay activos activos registrados para tu área. Contacta a un administrador.</p>
                )}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {activos.map((activo) => {
                        const completado = completadosEstaSemana.includes(activo.id);

                        if (completado) {
                            return (
                                <Card key={activo.id} className="bg-muted/40 border-dashed">
                                    <CardContent className="flex flex-col items-center gap-1.5 p-4 text-center">
                                        <span className="text-base font-semibold">{activo.codigo}</span>
                                        <Badge variant="secondary" className="gap-1">
                                            <CheckCircle2 className="size-3" />
                                            Completado esta semana
                                        </Badge>
                                    </CardContent>
                                </Card>
                            );
                        }

                        return (
                            <Link key={activo.id} href={`${route('formulario.show')}?activo_id=${activo.id}`}>
                                <Card className={cn('hover:bg-accent h-full transition-colors')}>
                                    <CardContent className="flex h-full items-center justify-center p-4 text-center">
                                        <span className="text-base font-semibold">{activo.codigo}</span>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
