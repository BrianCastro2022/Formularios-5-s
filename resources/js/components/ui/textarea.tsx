import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
    return (
        <textarea
            className={cn(
                // text-base (16px) en vez de text-sm: en iOS, un campo de texto con
                // font-size < 16px hace que Safari haga zoom automático al enfocarlo
                // — el textarea de CrearPlanAccionDialog tiene autoFocus, así que el
                // zoom se disparaba apenas se abría el diálogo. md:text-sm restaura el
                // tamaño original en desktop, donde este zoom automático no aplica.
                'flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                className,
            )}
            ref={ref}
            {...props}
        />
    );
});
Textarea.displayName = 'Textarea';

export { Textarea };
