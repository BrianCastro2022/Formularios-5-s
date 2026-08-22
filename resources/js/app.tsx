import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Cada deploy cambia los nombres (hash) de los archivos JS. Si el navegador
// dejó el sitio abierto/en caché desde antes del último deploy (común en
// móvil, donde las pestañas quedan suspendidas en vez de cerrarse) y luego
// navega a una página nueva, intenta cargar un chunk que ya no existe en el
// servidor y la app se queda en blanco sin ningún error visible. Vite emite
// este evento en ese caso — la recuperación es recargar, así se trae el HTML
// y los assets ya actualizados.
window.addEventListener('vite:preloadError', () => {
    window.location.reload();
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#2F4DB1',
    },
});

// This will set light / dark mode on load...
initializeTheme();
