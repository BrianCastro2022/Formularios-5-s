import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export type UserRole = 'admin' | 'responsable';

export interface Area {
    id: number;
    nombre: string;
}

export interface User {
    id: number;
    nombres: string;
    apellidos: string;
    name: string;
    tipo_identificacion: string;
    numero_identificacion: string;
    email: string | null;
    rol: UserRole;
    must_change_password: boolean;
    activo: boolean;
    area_id: number | null;
    area?: Area | null;
    avatar?: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export type ActivoTipo = 'camion' | 'montacargas';

export interface Activo {
    id: number;
    area_id: number;
    codigo: string;
    tipo: ActivoTipo;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export interface EscalaOpcion {
    id: number;
    checklist_plantilla_id: number | null;
    pregunta_id: number | null;
    texto_opcion: string;
    peso_numerico: number | null;
    excluye_promedio: boolean;
    es_gap: boolean;
    orden: number;
}

export interface Pregunta {
    id: number;
    seccion_id: number;
    subcategoria: string | null;
    texto: string;
    orden: number;
    activa: boolean;
    escala_propia?: EscalaOpcion[];
}

export interface Seccion5S {
    id: number;
    checklist_plantilla_id: number;
    nombre: string;
    orden: number;
    preguntas?: Pregunta[];
    checklist_plantilla?: ChecklistPlantilla;
}

export interface ChecklistPlantilla {
    id: number;
    area_id: number;
    nombre: string;
    area?: Area;
    secciones?: Seccion5S[];
    escalas_generales?: EscalaOpcion[];
    secciones_count?: number;
    preguntas_count?: number;
}

export interface ChecklistRespuesta {
    id: number;
    checklist_plantilla_id: number;
    usuario_id: number;
    activo_id: number | null;
    fecha: string;
    resultado_porcentaje: number | null;
    activo?: Activo | null;
    usuario?: User;
    checklist_plantilla?: ChecklistPlantilla;
    detalles?: RespuestaDetalle[];
    created_at: string;
}

export interface RespuestaDetalle {
    id: number;
    checklist_respuesta_id: number;
    pregunta_id: number;
    opcion_id: number;
    observacion: string | null;
    foto_url: string | null;
    pregunta?: Pregunta & { seccion?: Seccion5S };
    opcion?: EscalaOpcion;
    planes_accion?: PlanAccion[];
    checklist_respuesta?: ChecklistRespuesta;
}

export type EstadoPlanAccion = 'abierto' | 'en_progreso' | 'cerrado' | 'vencido';

export interface PlanAccion {
    id: number;
    respuesta_detalle_id: number;
    responsable_id: number;
    descripcion: string;
    fecha_limite: string;
    estado: EstadoPlanAccion;
    estado_efectivo: EstadoPlanAccion;
    fecha_cierre: string | null;
    responsable?: User;
    respuesta_detalle?: RespuestaDetalle;
    created_at: string;
}

export interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}
