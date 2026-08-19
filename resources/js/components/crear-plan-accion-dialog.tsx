import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type SharedData, type User } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { ListPlus, LoaderCircle } from 'lucide-react';
import { FormEventHandler, ReactNode, useState } from 'react';

interface CrearPlanAccionDialogProps {
    respuestaDetalleId: number;
    responsables: User[];
    gapPregunta: string;
    gapOpcion?: string;
    trigger?: ReactNode;
}

/**
 * HU-31 — Formulario simple para registrar un plan de acción sobre una respuesta
 * marcada como GAP. Se usa desde el dashboard (Top oportunidades/Reincidencias,
 * rol Admin), el módulo de Planes de acción (ambos roles) y el detalle del
 * historial del Responsable (Fase 4/8).
 *
 * El selector de responsable es exclusivo del Admin: un Responsable siempre se
 * asigna el plan a sí mismo, sin poder elegir a otra persona (reforzado también
 * en el backend, ver StorePlanAccionRequest).
 */
export function CrearPlanAccionDialog({ respuestaDetalleId, responsables, gapPregunta, gapOpcion, trigger }: CrearPlanAccionDialogProps) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const esAdmin = auth.user.rol === 'admin';

    const { data, setData, post, processing, errors, reset } = useForm({
        respuesta_detalle_id: String(respuestaDetalleId),
        responsable_id: esAdmin ? '' : String(auth.user.id),
        descripcion: '',
        fecha_limite: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('planes-accion.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" size="sm">
                        <ListPlus className="h-4 w-4" />
                        Crear plan
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Crear plan de acción</DialogTitle>
                <DialogDescription>Registra una acción correctiva para hacerle seguimiento hasta que se resuelva.</DialogDescription>

                <div className="bg-muted/40 space-y-1.5 rounded-md border p-3">
                    <p className="text-sm font-medium">{gapPregunta}</p>
                    {gapOpcion && <Badge variant="destructive">{gapOpcion}</Badge>}
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {esAdmin ? (
                        <div className="grid gap-2">
                            <Label htmlFor="responsable_id">Responsable</Label>
                            <Select value={data.responsable_id} onValueChange={(value) => setData('responsable_id', value)}>
                                <SelectTrigger id="responsable_id">
                                    <SelectValue placeholder="Selecciona un responsable" />
                                </SelectTrigger>
                                <SelectContent>
                                    {responsables.map((r) => (
                                        <SelectItem key={r.id} value={String(r.id)}>
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.responsable_id && <p className="text-destructive text-sm">{errors.responsable_id}</p>}
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <Label>Responsable</Label>
                            <p className="text-muted-foreground text-sm">Este plan se te asignará a ti ({auth.user.name}).</p>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="descripcion">Descripción de la acción</Label>
                        <Textarea
                            id="descripcion"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                            required
                            autoFocus
                        />
                        {errors.descripcion && <p className="text-destructive text-sm">{errors.descripcion}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="fecha_limite">Fecha límite</Label>
                        <Input
                            id="fecha_limite"
                            type="date"
                            value={data.fecha_limite}
                            onChange={(e) => setData('fecha_limite', e.target.value)}
                            required
                        />
                        {errors.fecha_limite && <p className="text-destructive text-sm">{errors.fecha_limite}</p>}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Crear plan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
