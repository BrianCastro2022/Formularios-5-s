import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ClipboardCheck, ClipboardList, FileStack, History, LayoutGrid, ListChecks, QrCode, Truck, Users } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const homeUrl = auth.user.rol === 'admin' ? '/dashboard' : '/mi-formulario';

    const mainNavItems: NavItem[] =
        auth.user.rol === 'admin'
            ? [
                  { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
                  { title: 'Usuarios', url: '/admin/usuarios', icon: Users },
                  { title: 'Activos', url: '/admin/activos', icon: Truck },
                  { title: 'Checklists', url: '/admin/checklists', icon: ClipboardList },
                  { title: 'Checklists diligenciados', url: '/admin/checklists-respuesta', icon: FileStack },
                  { title: 'Planes de acción', url: '/planes-accion', icon: ClipboardCheck },
                  { title: 'Código QR', url: '/admin/qr-publico', icon: QrCode },
              ]
            : [
                  { title: 'Mi formulario', url: '/mi-formulario', icon: ListChecks },
                  { title: 'Historial', url: '/mi-formulario/historial', icon: History },
                  { title: 'Planes de acción', url: '/planes-accion', icon: ClipboardCheck },
              ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
