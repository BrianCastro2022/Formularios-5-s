import { useReveal } from '@/hooks/use-reveal';
import { useCountUp, useParallax, useScrolled, useScrollProgress } from '@/hooks/use-landing-effects';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpDown,
    BadgeCheck,
    Building2,
    ChevronDown,
    ClipboardCheck,
    Filter,
    Forklift,
    Heart,
    LayoutGrid,
    ListChecks,
    LogIn,
    ShieldCheck,
    Sparkles,
    Truck,
    Users,
    Warehouse,
    Wrench,
} from 'lucide-react';
import { type ReactNode } from 'react';

type Accent = 'yellow' | 'blue' | 'blue-dark' | 'green' | 'red';

const ACCENT_BG: Record<Accent, string> = {
    yellow: 'bg-brand-yellow',
    blue: 'bg-brand-blue',
    'blue-dark': 'bg-brand-blue-dark',
    green: 'bg-brand-green',
    red: 'bg-brand-red',
};

const ACCENT_TEXT: Record<Accent, string> = {
    yellow: 'text-brand-yellow',
    blue: 'text-brand-blue',
    'blue-dark': 'text-brand-blue-dark',
    green: 'text-brand-green',
    red: 'text-brand-red',
};

const ACCENT_SOFT: Record<Accent, string> = {
    yellow: 'bg-brand-yellow/10',
    blue: 'bg-brand-blue/10',
    'blue-dark': 'bg-brand-blue-dark/10',
    green: 'bg-brand-green/10',
    red: 'bg-brand-red/10',
};

type Direction = 'up' | 'left' | 'right' | 'scale';

const HIDDEN_STATE: Record<Direction, string> = {
    up: 'translate-y-10 opacity-0 blur-[2px]',
    left: '-translate-x-10 opacity-0 blur-[2px]',
    right: 'translate-x-10 opacity-0 blur-[2px]',
    scale: 'scale-90 opacity-0 blur-[2px]',
};

function Reveal({
    children,
    delay = 0,
    className,
    direction = 'up',
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
    direction?: Direction;
}) {
    const { ref, visible } = useReveal<HTMLDivElement>();
    return (
        <div
            ref={ref}
            className={cn(
                'transition-all duration-700 ease-out',
                visible ? 'translate-x-0 translate-y-0 scale-100 opacity-100 blur-none' : HIDDEN_STATE[direction],
                className,
            )}
            style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
        >
            {children}
        </div>
    );
}

function ShineLink({
    href,
    children,
    variant = 'primary',
    className,
}: {
    href: string;
    children: ReactNode;
    variant?: 'primary' | 'light';
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={cn(
                'group relative inline-flex items-center gap-2 overflow-hidden rounded-md px-6 py-3 text-sm font-semibold shadow-md transition-all hover:shadow-lg active:scale-[0.98]',
                variant === 'primary'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-white text-neutral-900 hover:scale-[1.03]',
                className,
            )}
        >
            <span
                aria-hidden
                className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/30 transition-transform duration-700 ease-out group-hover:translate-x-[420%]"
            />
            <span className="relative flex items-center gap-2">{children}</span>
        </Link>
    );
}

function Stat({ value, suffix = '', label, icon: Icon, accent }: { value: number; suffix?: string; label: string; icon: typeof Filter; accent: Accent }) {
    const { ref, visible } = useReveal<HTMLDivElement>();
    const count = useCountUp(value, visible);
    return (
        <div
            ref={ref}
            className={cn(
                'text-center transition-all duration-700',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
        >
            <div className={cn('mx-auto mb-3 inline-flex size-9 items-center justify-center rounded-full', ACCENT_SOFT[accent])}>
                <Icon className={cn('size-4', ACCENT_TEXT[accent])} />
            </div>
            <p className="text-4xl font-bold tabular-nums sm:text-5xl">
                <span className="from-brand-blue to-brand-green bg-gradient-to-br bg-clip-text text-transparent">{count}</span>
                {suffix}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">{label}</p>
        </div>
    );
}

const AREAS: { nombre: string; detalle: string; icon: typeof Warehouse; accent: Accent }[] = [
    { nombre: 'Almacén', detalle: '9 zonas — de Reempaque a Centro de Acopio — evaluadas por separado.', icon: Warehouse, accent: 'blue' },
    { nombre: 'Administrativo', detalle: '4 zonas de oficinas, evaluadas por separado.', icon: Building2, accent: 'yellow' },
    { nombre: 'Montacargas', detalle: '3 unidades — 633, 872 y 566 — evaluadas por activo.', icon: Forklift, accent: 'green' },
    { nombre: 'Camiones', detalle: '23 placas evaluadas de forma individual cada una.', icon: Truck, accent: 'red' },
    { nombre: 'Taller mecánico', detalle: 'Diligenciamiento único por área, escala de 4 niveles.', icon: Wrench, accent: 'blue-dark' },
];

const PILARES: { s: string; nombre: string; detalle: string; icon: typeof Filter; accent: Accent }[] = [
    { s: '1°S', nombre: 'Clasificación', detalle: 'Separar lo necesario de lo que sobra.', icon: Filter, accent: 'yellow' },
    { s: '2°S', nombre: 'Orden', detalle: 'Un lugar para cada cosa, y cada cosa en su lugar.', icon: ArrowUpDown, accent: 'blue' },
    { s: '3°S', nombre: 'Limpieza', detalle: 'Mantener el puesto de trabajo impecable.', icon: Sparkles, accent: 'green' },
    { s: '4°S', nombre: 'Estandarización', detalle: 'Convertir las buenas prácticas en hábito.', icon: BadgeCheck, accent: 'red' },
    { s: '5°S', nombre: 'Disciplina', detalle: 'Sostener el estándar en el tiempo.', icon: ShieldCheck, accent: 'blue-dark' },
];

const PASOS = [
    { titulo: 'Inicia sesión', detalle: 'Con tu número de identificación como usuario y contraseña.' },
    { titulo: 'Diligencia tu formulario', detalle: 'El del área asignada; si tu área usa placas, unidades o zonas, eliges primero cuál. Una vez por semana.' },
    { titulo: 'Haz seguimiento', detalle: 'El administrador consulta el avance en un dashboard con indicadores 5S en tiempo real.' },
];

const STATS: { value: number; label: string; icon: typeof Filter; accent: Accent }[] = [
    { value: 5, label: 'Formularios, uno por área', icon: LayoutGrid, accent: 'blue' },
    { value: 5, label: 'Secciones 5S por checklist', icon: ListChecks, accent: 'green' },
    { value: 23, label: 'Placas de camiones evaluadas', icon: Truck, accent: 'red' },
    { value: 3, label: 'Montacargas evaluados', icon: Forklift, accent: 'yellow' },
];

const FLOATERS: { icon: typeof Filter; top: string; left: string; accent: Accent; delay: string; factor: number; size: string }[] = [
    { icon: Filter, top: '20%', left: '9%', accent: 'yellow', delay: '0s', factor: 0.7, size: 'size-8' },
    { icon: ArrowUpDown, top: '68%', left: '15%', accent: 'blue', delay: '-2s', factor: 1, size: 'size-7' },
    { icon: Sparkles, top: '14%', left: '87%', accent: 'green', delay: '-4s', factor: 0.6, size: 'size-9' },
    { icon: ShieldCheck, top: '72%', left: '89%', accent: 'red', delay: '-1.2s', factor: 0.9, size: 'size-7' },
    { icon: BadgeCheck, top: '88%', left: '48%', accent: 'blue-dark', delay: '-3s', factor: 0.5, size: 'size-6' },
];

export default function Welcome() {
    const progress = useScrollProgress();
    const scrolled = useScrolled();
    const { ref: heroRef, offset } = useParallax<HTMLDivElement>(22, 0.045);

    return (
        <>
            <Head title="Bienvenido" />

            <div className="relative min-h-screen overflow-x-hidden bg-white text-neutral-900 antialiased">
                {/* Scroll progress */}
                <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent">
                    <div
                        className="from-brand-yellow via-brand-blue to-brand-green h-full bg-gradient-to-r transition-[width] duration-150 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Nav */}
                <header
                    className={cn(
                        'sticky top-0 z-50 border-b transition-all duration-300',
                        scrolled ? 'border-black/5 bg-white/85 shadow-sm backdrop-blur-md' : 'border-transparent bg-white/0',
                    )}
                >
                    <div
                        className={cn(
                            'mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300',
                            scrolled ? 'py-2.5' : 'py-4',
                        )}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-24 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-black/5">
                                <img
                                    src="/image/CD NARIÑO.png"
                                    alt="Bavaria · Adenar S.A.S. · Easy Logística"
                                    className="h-full w-full object-contain p-1.5"
                                />
                            </div>
                            <div className="leading-tight">
                                <p className="text-sm font-semibold">Software 5S</p>
                                <p className="text-muted-foreground text-xs">CD Nariño</p>
                            </div>
                        </div>
                        <Link
                            href={route('login')}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-all hover:scale-[1.03] active:scale-[0.97]"
                        >
                            <LogIn className="size-4" />
                            Iniciar sesión
                        </Link>
                    </div>
                </header>

                {/* Hero */}
                <section ref={heroRef} className="relative isolate px-6 pt-20 pb-16">
                    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                        <div className="absolute -top-24 -left-24" style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}>
                            <div className="bg-brand-yellow animate-blob size-96 rounded-full opacity-25 blur-3xl" />
                        </div>
                        <div
                            className="absolute top-10 -right-20"
                            style={{ transform: `translate3d(${offset.x * -0.8}px, ${offset.y * -0.8}px, 0)` }}
                        >
                            <div className="bg-brand-blue animate-blob size-[28rem] rounded-full opacity-20 blur-3xl [animation-delay:-6s]" />
                        </div>
                        <div
                            className="absolute bottom-0 left-1/3"
                            style={{ transform: `translate3d(${offset.x * 0.6}px, ${offset.y * 0.6}px, 0)` }}
                        >
                            <div className="bg-brand-green animate-blob size-80 rounded-full opacity-20 blur-3xl [animation-delay:-11s]" />
                        </div>

                        {FLOATERS.map((f, i) => (
                            <div
                                key={i}
                                className="absolute"
                                style={{
                                    top: f.top,
                                    left: f.left,
                                    transform: `translate3d(${offset.x * f.factor}px, ${offset.y * f.factor}px, 0)`,
                                }}
                            >
                                <f.icon
                                    className={cn('animate-float opacity-[0.18]', f.size, ACCENT_TEXT[f.accent])}
                                    style={{ animationDelay: f.delay }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="animate-fade-in-up mx-auto flex max-w-3xl flex-col items-center text-center">
                        <span className="border-brand-blue/20 bg-brand-blue/5 text-brand-blue-dark inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium">
                            <span className="relative flex size-1.5">
                                <span className="bg-brand-green absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                                <span className="bg-brand-green relative inline-flex size-1.5 rounded-full" />
                            </span>
                            AB InBev · Centro de Distribución Nariño
                        </span>

                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl">
                            La cultura{' '}
                            <span className="from-brand-blue via-brand-blue-dark to-brand-green animate-gradient bg-gradient-to-r bg-[length:200%_auto] bg-clip-text text-transparent">
                                5S
                            </span>
                            , ahora digital
                        </h1>

                        <p className="text-muted-foreground mt-6 max-w-xl text-lg text-balance">
                            Reemplaza el checklist físico y de Excel por auditorías 5S digitales para Almacén, Administrativo, Montacargas,
                            Camiones y Taller mecánico — con seguimiento en tiempo real.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <div className="relative inline-flex">
                                <span aria-hidden className="border-primary/40 animate-pulse-ring absolute inset-0 rounded-md border-2" />
                                <ShineLink href={route('login')}>
                                    Iniciar sesión
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </ShineLink>
                            </div>
                            <a
                                href="#como-funciona"
                                className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 transition-all hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-sm"
                            >
                                Cómo funciona
                            </a>
                        </div>
                    </div>

                    <div
                        className="mx-auto mt-16 flex max-w-4xl flex-col items-center gap-3"
                        style={{ transform: `translate3d(${offset.x * 0.25}px, 0, 0)` }}
                    >
                        <div className="animate-float-slow w-full max-w-2xl">
                            <img
                                src="/image/CD NARIÑO.png"
                                alt="Bavaria · Adenar S.A.S. · Easy Logística"
                                className="h-auto w-full rounded-2xl border border-black/5 bg-white p-8 shadow-xl shadow-neutral-200/60"
                            />
                        </div>
                        <p className="text-muted-foreground text-xs">Una alianza entre Bavaria, Adenar S.A.S. y Easy Logística.</p>
                    </div>

                    <a
                        href="#como-funciona"
                        aria-label="Ir a cómo funciona"
                        className="text-muted-foreground/60 mt-4 hidden justify-center hover:text-neutral-600 sm:flex"
                    >
                        <ChevronDown className="size-6 animate-bounce" />
                    </a>
                </section>

                {/* Stats */}
                <section className="mx-auto max-w-5xl px-6 py-14">
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                        {STATS.map((s) => (
                            <Stat key={s.label} value={s.value} label={s.label} icon={s.icon} accent={s.accent} />
                        ))}
                    </div>
                </section>

                {/* Marquee */}
                <div className="overflow-hidden border-y border-black/5 bg-neutral-50/60 py-4">
                    <div className="animate-marquee flex w-max items-center gap-12 hover:[animation-play-state:paused]">
                        {[...AREAS, ...AREAS].map((area, i) => (
                            <span key={i} className="text-muted-foreground flex items-center gap-2 text-sm font-semibold whitespace-nowrap">
                                <span className={cn('size-1.5 rounded-full', ACCENT_BG[area.accent])} />
                                {area.nombre.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Cómo funciona */}
                <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-20">
                    <Reveal direction="scale" className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight">Cómo funciona</h2>
                        <p className="text-muted-foreground mt-3">Tres pasos, del formulario en papel al indicador en pantalla.</p>
                    </Reveal>

                    <div className="mt-14 grid gap-6 sm:grid-cols-3">
                        {PASOS.map((paso, i) => (
                            <Reveal key={paso.titulo} delay={i * 120}>
                                <div className="relative h-full rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                    <span className="from-brand-blue to-brand-blue-dark inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white">
                                        {i + 1}
                                    </span>
                                    <h3 className="mt-4 font-semibold">{paso.titulo}</h3>
                                    <p className="text-muted-foreground mt-1.5 text-sm">{paso.detalle}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Áreas */}
                <section className="bg-neutral-50/60 px-6 py-20">
                    <div className="mx-auto max-w-6xl">
                        <Reveal direction="scale" className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight">Cinco formularios, un mismo estándar</h2>
                            <p className="text-muted-foreground mt-3">Cada área tiene su propio checklist, secciones y escala de evaluación.</p>
                        </Reveal>

                        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                            {AREAS.map((area, i) => (
                                <Reveal key={area.nombre} delay={i * 90}>
                                    <div className="group h-full rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                        <div
                                            className={cn(
                                                'inline-flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6',
                                                ACCENT_SOFT[area.accent],
                                            )}
                                        >
                                            <area.icon className={cn('size-5', ACCENT_TEXT[area.accent])} />
                                        </div>
                                        <h3 className="mt-4 font-semibold">{area.nombre}</h3>
                                        <p className="text-muted-foreground mt-1.5 text-sm">{area.detalle}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Las 5S */}
                <section className="mx-auto max-w-6xl px-6 py-20">
                    <Reveal direction="scale" className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight">Las 5 S</h2>
                        <p className="text-muted-foreground mt-3">Cada pregunta del formulario pertenece a una de estas cinco secciones.</p>
                    </Reveal>

                    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                        {PILARES.map((pilar, i) => (
                            <Reveal key={pilar.s} delay={i * 90}>
                                <div className="group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                    <div className={cn('absolute inset-x-0 top-0 h-1', ACCENT_BG[pilar.accent])} />
                                    <div className="flex items-center justify-between">
                                        <pilar.icon
                                            className={cn(
                                                'size-6 transition-transform duration-300 group-hover:scale-125',
                                                ACCENT_TEXT[pilar.accent],
                                            )}
                                        />
                                        <span className="text-muted-foreground text-xs font-semibold">{pilar.s}</span>
                                    </div>
                                    <h3 className="mt-4 font-semibold">{pilar.nombre}</h3>
                                    <p className="text-muted-foreground mt-1.5 text-sm">{pilar.detalle}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Roles */}
                <section className="bg-neutral-50/60 px-6 py-20">
                    <div className="mx-auto max-w-5xl">
                        <Reveal direction="scale" className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight">Pensado para cada rol</h2>
                            <p className="text-muted-foreground mt-3">Cada usuario ve exactamente lo que necesita.</p>
                        </Reveal>

                        <div className="mt-14 grid gap-6 sm:grid-cols-2">
                            <Reveal direction="left">
                                <div className="h-full rounded-2xl border border-black/5 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                    <div className="bg-brand-blue/10 inline-flex size-11 items-center justify-center rounded-xl">
                                        <Users className="text-brand-blue-dark size-5" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold">Administrador</h3>
                                    <p className="text-muted-foreground mt-2 text-sm">
                                        Gestiona usuarios, catálogos de activos y checklists, y consulta el dashboard general con rankings,
                                        reincidencias y exportación a PDF y Excel.
                                    </p>
                                </div>
                            </Reveal>
                            <Reveal direction="right" delay={120}>
                                <div className="h-full rounded-2xl border border-black/5 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                    <div className="bg-brand-green/10 inline-flex size-11 items-center justify-center rounded-xl">
                                        <ClipboardCheck className="text-brand-green size-5" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold">Responsable</h3>
                                    <p className="text-muted-foreground mt-2 text-sm">
                                        Diligencia el formulario de su área asignada, una vez por semana. Si su área se evalúa por placa, unidad
                                        o zona, primero elige cuál va a auditar.
                                    </p>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* CTA final */}
                <section className="px-6 py-20">
                    <Reveal direction="scale">
                        <div className="from-brand-blue to-brand-blue-dark relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br p-10 text-center text-white shadow-xl sm:p-14">
                            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                                <LayoutGrid className="absolute -top-6 -right-6 size-40 animate-[spin_40s_linear_infinite] text-white/10" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Empieza tu auditoría 5S</h2>
                            <p className="mt-3 text-white/85">Ingresa con tu número de identificación para diligenciar tu formulario.</p>
                            <ShineLink href={route('login')} variant="light" className="mt-8">
                                <LogIn className="size-4" />
                                Iniciar sesión
                            </ShineLink>
                        </div>
                    </Reveal>
                </section>

                {/* Footer */}
                <footer className="border-t border-black/5 px-6 py-10">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-20 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-black/5">
                                <img
                                    src="/image/CD NARIÑO.png"
                                    alt="Bavaria · Adenar S.A.S. · Easy Logística"
                                    className="h-full w-full object-contain p-1"
                                />
                            </div>
                            <p className="text-muted-foreground text-sm">Software 5S · CD Nariño</p>
                        </div>
                        <p className="text-muted-foreground text-xs">
                            © {new Date().getFullYear()} Bavaria · Adenar S.A.S. · Easy Logística. Todos los derechos reservados.
                        </p>
                    </div>
                    <p className="text-muted-foreground/70 mt-6 flex items-center justify-center gap-1.5 text-center text-xs">
                        Desarrollado por Brian Castro
                    </p>
                </footer>   
            </div>
        </>
    );
}
