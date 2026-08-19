import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Muestra como alerta flotante cualquier mensaje que un controlador haya
 * dejado en la sesión vía `->with('status', '...')` (crear/editar usuario,
 * restablecer contraseña, activar/inactivar, crear plan de acción, etc.) sin
 * que cada página tenga que declararlo explícitamente como prop.
 */
export function FlashToast() {
    const { flash } = usePage<SharedData>().props;
    const [message, setMessage] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!flash?.status) return;

        setMessage(flash.status);
        setVisible(true);

        const timeout = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(timeout);
    }, [flash?.status]);

    if (!message) return null;

    return (
        <div
            role="status"
            className={cn(
                'fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg border border-brand-green/20 bg-white px-4 py-3 text-sm font-medium text-neutral-900 shadow-lg transition-all duration-300',
                visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
            )}
        >
            <CheckCircle2 className="text-brand-green size-4 shrink-0" />
            {message}
            <button
                type="button"
                onClick={() => setVisible(false)}
                aria-label="Cerrar aviso"
                className="text-muted-foreground hover:text-foreground ml-1"
            >
                <X className="size-3.5" />
            </button>
        </div>
    );
}
