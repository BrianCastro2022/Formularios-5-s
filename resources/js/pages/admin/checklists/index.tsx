import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type Area, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Checklists', href: '/admin/checklists' }];

interface ChecklistSummary {
    id: number;
    nombre: string;
    area: Area;
    secciones_count: number;
    preguntas_count: number;
}

export default function ChecklistsIndex({ checklists }: { checklists: ChecklistSummary[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checklists" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Checklists" description="Estructura de secciones y preguntas por área (5S)." />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {checklists.map((checklist) => (
                        <Link key={checklist.id} href={route('admin.checklists.show', checklist.id)}>
                            <Card className="hover:bg-accent transition-colors">
                                <CardHeader>
                                    <CardTitle>{checklist.nombre}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-muted-foreground text-sm">
                                    <p>Área: {checklist.area.nombre}</p>
                                    <p>
                                        {checklist.secciones_count} secciones · {checklist.preguntas_count} preguntas
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
