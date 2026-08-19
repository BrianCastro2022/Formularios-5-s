import { useEffect, useRef, useState } from 'react';

/** Scroll position as a 0-100 percentage of the full page height. */
export function useScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let ticking = false;

        const update = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
            setProgress(Math.min(100, Math.max(0, pct)));
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return progress;
}

/** True once the page has scrolled past `threshold` pixels. */
export function useScrolled(threshold = 12) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > threshold);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    return scrolled;
}

/** True when the user's OS/browser asks for reduced motion. */
export function useReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(query.matches);
        const onChange = () => setReduced(query.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);

    return reduced;
}

/**
 * Tracks pointer position within an element and continuously eases towards it (a lerp on every
 * animation frame), so the returned offset trails the cursor smoothly instead of jumping to it —
 * relying on a CSS `transition` for this instead fights any keyframe animation on the same
 * element and produces a jerky, stepped motion.
 */
export function useParallax<T extends HTMLElement>(strength = 20, ease = 0.06) {
    const ref = useRef<T>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const target = useRef({ x: 0, y: 0 });
    const current = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const node = ref.current;
        if (!node || window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const onMove = (e: MouseEvent) => {
            const rect = node.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            target.current = { x: x * strength, y: y * strength };
        };
        const onLeave = () => {
            target.current = { x: 0, y: 0 };
        };

        let raf: number;
        const tick = () => {
            current.current.x += (target.current.x - current.current.x) * ease;
            current.current.y += (target.current.y - current.current.y) * ease;
            setOffset({ x: current.current.x, y: current.current.y });
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        node.addEventListener('mousemove', onMove);
        node.addEventListener('mouseleave', onLeave);
        return () => {
            node.removeEventListener('mousemove', onMove);
            node.removeEventListener('mouseleave', onLeave);
            cancelAnimationFrame(raf);
        };
    }, [strength, ease]);

    return { ref, offset };
}

/** Eases from 0 to `target` over `duration`ms once `active` becomes true. */
export function useCountUp(target: number, active: boolean, duration = 1400) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!active) return;

        let raf: number;
        const start = performance.now();

        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(eased * target));
            if (t < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [active, target, duration]);

    return value;
}
