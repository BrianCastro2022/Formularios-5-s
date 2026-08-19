import { useEffect, useRef, useState } from 'react';

/**
 * Marks an element as visible the first time it scrolls into view, so it can be
 * paired with a CSS transition (opacity/translate) for a one-shot reveal animation.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
    const ref = useRef<T>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        if (typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, visible };
}
