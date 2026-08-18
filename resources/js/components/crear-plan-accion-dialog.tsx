import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type User } from '@/types';
import { useForm } from '@inertiajs/react';
import { ListPlus, LoaderCircle } from 'lucide-react';
import { FormEventHandler, ReactNode, useState } from 'react';

interface CrearPlanAccionDialogProps {
    respuestaDetalleId: number;
    responsables: User[];
    trigger?: ReactNode;
}

/**
 * HU-31 — Formulario simple para registrar un plan de acción sobre una respuesta
 * marcada como GAP. Se usa desde el dashboard (Top oportunidades/Reincidencias,
 * rol Admin) y desde el detalle del historial del Responsable (Fase 4/8).
 */
export function CrearPlanAccionDialog({ respuestaDetalleId, responsables, trigger }: CrearPlanAccionDialogProps) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        respuesta_detalle_id: String(respuestaDetalleId),
        responsable_id: '',
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
                <form onSubmit={submit} className="space-y-4">
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
