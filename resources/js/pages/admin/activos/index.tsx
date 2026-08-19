import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type Activo, type BreadcrumbItem, type Paginated } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Activos', href: '/admin/activos' }];

const TIPO_LABELS: Record<Activo['tipo'], string> = {
    camion: 'Camión',
    montacargas: 'Montacargas',
    zona_almacen: 'Zona de almacén',
    zona_administrativo: 'Zona administrativa',
};

const CODIGO_LABELS: Record<Activo['tipo'], string> = {
    camion: 'Placa',
    montacargas: 'Número',
    zona_almacen: 'Nombre de la zona',
    zona_administrativo: 'Nombre de la zona',
};

interface ActivosIndexProps {
    activos: Paginated<Activo>;
    filters: { q?: string; tipo?: string; estado?: string };
}

export default function ActivosIndex({ activos, filters }: ActivosIndexProps) {
    const [q, setQ] = useState(filters.q ?? '');
    const [createOpen, setCreateOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        tipo: 'camion' as Activo['tipo'],
        codigo: '',
    });

    const applyFilters = (next: Partial<ActivosIndexProps['filters']>) => {
        router.get(route('admin.activos.index'), { ...filters, q, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (q !== (filters.q ?? '')) {
                applyFilters({ q });
            }
        }, 350);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.activos.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setCreateOpen(false);
            },
        });
    };

    const toggleStatus = (activo: Activo) => {
        router.patch(route('admin.activos.toggle-status', activo.id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activos" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Activos" description="Placas, montacargas y zonas para diligenciar checklists por activo individual." />

                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Agregar activo</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>Agregar activo</DialogTitle>
                            <DialogDescription>Registra una nueva placa, unidad de montacargas o zona.</DialogDescription>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="tipo">Tipo</Label>
                                    <Select value={data.tipo} onValueChange={(value) => setData('tipo', value as Activo['tipo'])}>
                                        <SelectTrigger id="tipo">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="camion">Camión</SelectItem>
                                            <SelectItem value="montacargas">Montacargas</SelectItem>
                                            <SelectItem value="zona_almacen">Zona de almacén</SelectItem>
                                            <SelectItem value="zona_administrativo">Zona administrativa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="codigo">{CODIGO_LABELS[data.tipo]}</Label>
                                    <Input id="codigo" value={data.codigo} onChange={(e) => setData('codigo', e.target.value)} required autoFocus />
                                    {errors.codigo && <p className="text-destructive text-sm">{errors.codigo}</p>}
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">
                                            Cancelar
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={processing}>
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Guardar
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Input placeholder="Buscar por código" value={q} onChange={(e) => setQ(e.target.value)} />

                    <Select value={filters.tipo ?? 'todos'} onValueChange={(value) => applyFilters({ tipo: value === 'todos' ? undefined : value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos los tipos</SelectItem>
                            <SelectItem value="camion">Camión</SelectItem>
                            <SelectItem value="montacargas">Montacargas</SelectItem>
                            <SelectItem value="zona_almacen">Zona de almacén</SelectItem>
                            <SelectItem value="zona_administrativo">Zona administrativa</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.estado ?? 'todos'}
                        onValueChange={(value) => applyFilters({ estado: value === 'todos' ? undefined : value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos los estados</SelectItem>
                            <SelectItem value="activo">Activo</SelectItem>
                            <SelectItem value="inactivo">Inactivo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activos.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                                        No hay activos que coincidan con los filtros.
                                    </TableCell>
                                </TableRow>
                            )}

                            {activos.data.map((activo) => (
                                <TableRow key={activo.id}>
                                    <TableCell className="font-medium">{activo.codigo}</TableCell>
                                    <TableCell>{TIPO_LABELS[activo.tipo]}</TableCell>
                                    <TableCell>
                                        <Badge variant={activo.activo ? 'default' : 'secondary'}>{activo.activo ? 'Activo' : 'Inactivo'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant={activo.activo ? 'destructive' : 'default'} size="sm" onClick={() => toggleStatus(activo)}>
                                            {activo.activo ? 'Inactivar' : 'Activar'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {activos.last_page > 1 && (
                    <div className="flex flex-wrap items-center gap-1">
                        {activos.links.map((link, index) => (
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
