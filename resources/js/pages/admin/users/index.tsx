import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type Area, type BreadcrumbItem, type Paginated, type User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Usuarios', href: '/admin/usuarios' }];

interface UsersIndexProps {
    users: Paginated<User>;
    areas: Area[];
    filters: {
        q?: string;
        area_id?: string;
        rol?: string;
        estado?: string;
    };
}

export default function UsersIndex({ users, areas, filters }: UsersIndexProps) {
    const [q, setQ] = useState(filters.q ?? '');

    const applyFilters = (next: Partial<UsersIndexProps['filters']>) => {
        router.get(route('admin.users.index'), { ...filters, q, ...next }, { preserveState: true, preserveScroll: true, replace: true });
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

    const toggleStatus = (user: User) => {
        router.patch(route('admin.users.toggle-status', user.id), {}, { preserveScroll: true });
    };

    const resetPassword = (user: User) => {
        router.patch(route('admin.users.reset-password', user.id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Usuarios" description="Gestiona el equipo con acceso al sistema." />
                    <Button asChild>
                        <Link href={route('admin.users.create')}>Crear usuario</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <Input placeholder="Buscar por nombre o cédula" value={q} onChange={(e) => setQ(e.target.value)} />

                    <Select
                        value={filters.area_id ?? 'todas'}
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

                    <Select value={filters.rol ?? 'todos'} onValueChange={(value) => applyFilters({ rol: value === 'todos' ? undefined : value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos los roles</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="responsable">Responsable</SelectItem>
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
                                <TableHead>Nombre</TableHead>
                                <TableHead>Cédula</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Área</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                                        No hay usuarios que coincidan con los filtros.
                                    </TableCell>
                                </TableRow>
                            )}

                            {users.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.numero_identificacion}</TableCell>
                                    <TableCell>{user.rol === 'admin' ? 'Administrador' : 'Responsable'}</TableCell>
                                    <TableCell>{user.area?.nombre ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.activo ? 'default' : 'secondary'}>{user.activo ? 'Activo' : 'Inactivo'}</Badge>
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('admin.users.edit', user.id)}>Editar</Link>
                                        </Button>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    Restablecer contraseña
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogTitle>¿Restablecer la contraseña de {user.name}?</DialogTitle>
                                                <DialogDescription>
                                                    Su nueva contraseña será su número de identificación ({user.numero_identificacion}) y deberá
                                                    cambiarla en su próximo ingreso.
                                                </DialogDescription>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="secondary">Cancelar</Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                        <Button onClick={() => resetPassword(user)}>Restablecer</Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant={user.activo ? 'destructive' : 'default'} size="sm">
                                                    {user.activo ? 'Inactivar' : 'Activar'}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogTitle>
                                                    ¿{user.activo ? 'Inactivar' : 'Activar'} a {user.name}?
                                                </DialogTitle>
                                                <DialogDescription>
                                                    {user.activo
                                                        ? 'No podrá iniciar sesión mientras esté inactivo. Su historial de checklists se conserva.'
                                                        : 'Podrá volver a iniciar sesión con su contraseña actual.'}
                                                </DialogDescription>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="secondary">Cancelar</Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                        <Button variant={user.activo ? 'destructive' : 'default'} onClick={() => toggleStatus(user)}>
                                                            {user.activo ? 'Inactivar' : 'Activar'}
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {users.last_page > 1 && (
                    <div className="flex flex-wrap items-center gap-1">
                        {users.links.map((link, index) => (
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
