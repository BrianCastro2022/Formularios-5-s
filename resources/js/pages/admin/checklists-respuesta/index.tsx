import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type Area, type BreadcrumbItem, type ChecklistRespuesta, type Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Checklists diligenciados', href: '/admin/checklists-respuesta' }];

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface IndexProps {
    checklists: Paginated<ChecklistRespuesta>;
    areas: Area[];
    filtros: { area_id?: string; mes?: string; anio?: string };
}

export default function ChecklistsRespuestaIndex({ checklists, areas, filtros }: IndexProps) {
    const applyFilters = (next: Partial<IndexProps['filtros']>) => {
        router.get(route('admin.checklists-respuesta.index'), { ...filtros, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checklists diligenciados" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Checklists diligenciados" description="Consulta y exporta a PDF cualquier checklist puntual para auditoría." />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

                    <Select value={filtros.mes ?? 'todos'} onValueChange={(value) => applyFilters({ mes: value === 'todos' ? undefined : value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos los meses</SelectItem>
                            {MESES.map((nombre, index) => (
                                <SelectItem key={nombre} value={String(index + 1)}>
                                    {nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filtros.anio ?? 'todos'} onValueChange={(value) => applyFilters({ anio: value === 'todos' ? undefined : value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos los años</SelectItem>
                            {[0, 1, 2].map((offset) => {
                                const year = new Date().getFullYear() - offset;
                                return (
                                    <SelectItem key={year} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Área</TableHead>
                                <TableHead>Placa/Activo</TableHead>
                                <TableHead>Evaluador</TableHead>
                                <TableHead>% Adherencia</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {checklists.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                                        No hay checklists diligenciados con estos filtros.
                                    </TableCell>
                                </TableRow>
                            )}

                            {checklists.data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.fecha}</TableCell>
                                    <TableCell>{item.checklist_plantilla?.area?.nombre}</TableCell>
                                    <TableCell>{item.activo?.codigo ?? '—'}</TableCell>
                                    <TableCell>{item.usuario?.name}</TableCell>
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
                                            <a href={route('admin.checklists-respuesta.exportar', item.id)}>
                                                <FileText className="h-4 w-4" />
                                                PDF
                                            </a>
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
