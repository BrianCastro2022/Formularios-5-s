import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ChecklistRespuesta, type Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Historial', href: '/mi-formulario/historial' }];

export default function Historial({ checklists }: { checklists: Paginated<ChecklistRespuesta> }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Mi historial" description="Checklists que has diligenciado anteriormente." />

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Placa/Activo</TableHead>
                                <TableHead>Resultado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {checklists.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                                        Todavía no has diligenciado ningún checklist.
                                    </TableCell>
                                </TableRow>
                            )}

                            {checklists.data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.fecha}</TableCell>
                                    <TableCell>{item.activo?.codigo ?? '—'}</TableCell>
                                    <TableCell>
                                        {item.resultado_porcentaje !== null ? (
                                            <Badge variant={item.resultado_porcentaje >= 80 ? 'default' : 'secondary'}>
                                                {item.resultado_porcentaje}%
                                            </Badge>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('formulario.historial.show', item.id)}>Ver detalle</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {checklists.last_page > 1 && (
                    <div className="flex flex-wrap items-center gap-1">
                        {checklists.links.map((link, index) => (
                            <Button key={index} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url} asChild={!!link.url}>
                                {link.url ? (
                                    <Link href={link.url} preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
