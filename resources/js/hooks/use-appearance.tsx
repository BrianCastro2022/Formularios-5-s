import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

// El negocio pidió que el software quede siempre en modo claro por ahora —
// dark/system quedan desactivados (no borrados) en los selectores de UI, y
// esta bandera es el refuerzo a nivel de lógica: aunque quede algo en
// localStorage de una sesión previa, el tema aplicado siempre es 'light'.
// Para reactivar dark/system: poner esto en false y quitar `disabled` de los
// botones/items en appearance-tabs.tsx y appearance-dropdown.tsx.
const SOLO_MODO_CLARO = true;

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (appearance: Appearance) => {
    const isDark = !SOLO_MODO_CLARO && (appearance === 'dark' || (appearance === 'system' && prefersDark()));

    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    const savedAppearance = SOLO_MODO_CLARO ? 'light' : (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);

    // Add the event listener for system theme changes...
    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem('appearance', mode);
        applyTheme(mode);
    };

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        // Con SOLO_MODO_CLARO en true, se ignora cualquier 'dark'/'system' que
        // haya quedado guardado de antes, para que ni el estado interno ni el
        // ícono del selector muestren algo distinto al tema realmente aplicado.
        updateAppearance(SOLO_MODO_CLARO ? 'light' : savedAppearance || 'system');

        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return { appearance, updateAppearance };
}
