import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type Activo, type BreadcrumbItem, type ChecklistPlantilla } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mi formulario', href: '/mi-formulario' }];

export default function SeleccionarPlaca({ checklist, activos }: { checklist: ChecklistPlantilla; activos: Activo[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Selecciona una placa" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading
                    title={checklist.nombre}
                    description={`Elige la placa o unidad de ${checklist.area?.nombre.toLowerCase()} que vas a auditar.`}
                />

                {activos.length === 0 && (
                    <p className="text-muted-foreground text-sm">No hay activos activos registrados para tu área. Contacta a un administrador.</p>
                )}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {activos.map((activo) => (
                        <Link key={activo.id} href={`${route('formulario.show')}?activo_id=${activo.id}`}>
                            <Card className="hover:bg-accent transition-colors">
                                <CardContent className="p-4 text-center">
                                    <Button variant="ghost" className="pointer-events-none w-full text-base font-semibold">
                                        {activo.codigo}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
