import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ChecklistPlantilla, type Pregunta } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function ShowChecklist({ checklist }: { checklist: ChecklistPlantilla }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Checklists', href: '/admin/checklists' },
        { title: checklist.nombre, href: `/admin/checklists/${checklist.id}` },
    ];

    const [addingToSeccion, setAddingToSeccion] = useState<number | null>(null);
    const [editingPregunta, setEditingPregunta] = useState<Pregunta | null>(null);

    const addForm = useForm({ seccion_id: '', subcategoria: '', texto: '' });
    const editForm = useForm({ subcategoria: '', texto: '' });

    const openAdd = (seccionId: number) => {
        addForm.reset();
        addForm.setData({ seccion_id: String(seccionId), subcategoria: '', texto: '' });
        setAddingToSeccion(seccionId);
    };

    const submitAdd: FormEventHandler = (e) => {
        e.preventDefault();
        addForm.post(route('admin.checklists.preguntas.store', checklist.id), {
            preserveScroll: true,
            onSuccess: () => setAddingToSeccion(null),
        });
    };

    const openEdit = (pregunta: Pregunta) => {
        editForm.reset();
        editForm.setData({ subcategoria: pregunta.subcategoria ?? '', texto: pregunta.texto });
        setEditingPregunta(pregunta);
    };

    const submitEdit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingPregunta) return;
        editForm.put(route('admin.checklists.preguntas.update', [checklist.id, editingPregunta.id]), {
            preserveScroll: true,
            onSuccess: () => setEditingPregunta(null),
        });
    };

    const toggleStatus = (pregunta: Pregunta) => {
        router.patch(route('admin.checklists.preguntas.toggle-status', [checklist.id, pregunta.id]), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={checklist.nombre} />

            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading title={checklist.nombre} description={`Área: ${checklist.area?.nombre}`} />

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Escala general</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {checklist.escalas_generales?.map((opcion) => (
                            <Badge key={opcion.id} variant="outline">
                                {opcion.texto_opcion}
                                {opcion.excluye_promedio ? ' (no cuenta en el promedio)' : ` — peso ${opcion.peso_numerico}`}
                            </Badge>
                        ))}
                    </CardContent>
                </Card>

                {checklist.secciones?.map((seccion) => (
                    <Card key={seccion.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">{seccion.nombre}</CardTitle>
                            <Button size="sm" variant="outline" onClick={() => openAdd(seccion.id)}>
                                Agregar pregunta
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {seccion.preguntas?.length === 0 && <p className="text-muted-foreground text-sm">Sin preguntas.</p>}

                            {seccion.preguntas?.map((pregunta) => (
                                <div key={pregunta.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {pregunta.subcategoria && (
                                                <span className="text-muted-foreground text-xs font-medium uppercase">{pregunta.subcategoria}</span>
                                            )}
                                            {!pregunta.activa && <Badge variant="secondary">Inactiva</Badge>}
                                            {pregunta.escala_propia && pregunta.escala_propia.length > 0 && (
                                                <Badge variant="outline">Escala propia</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm">{pregunta.texto}</p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <Button size="sm" variant="outline" onClick={() => openEdit(pregunta)}>
                                            Editar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={pregunta.activa ? 'destructive' : 'default'}
                                            onClick={() => toggleStatus(pregunta)}
                                        >
                                            {pregunta.activa ? 'Desactivar' : 'Activar'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={addingToSeccion !== null} onOpenChange={(open) => !open && setAddingToSeccion(null)}>
                <DialogContent>
                    <DialogTitle>Agregar pregunta</DialogTitle>
                    <DialogDescription>Se agregará al final de la sección.</DialogDescription>
                    <form onSubmit={submitAdd} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-subcategoria">Subcategoría (opcional)</Label>
                            <Input
                                id="add-subcategoria"
                                value={addForm.data.subcategoria}
                                onChange={(e) => addForm.setData('subcategoria', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-texto">Pregunta</Label>
                            <Input
                                id="add-texto"
                                value={addForm.data.texto}
                                onChange={(e) => addForm.setData('texto', e.target.value)}
                                required
                                autoFocus
                            />
                            {addForm.errors.texto && <p className="text-destructive text-sm">{addForm.errors.texto}</p>}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={addForm.processing}>
                                {addForm.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Agregar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={editingPregunta !== null} onOpenChange={(open) => !open && setEditingPregunta(null)}>
                <DialogContent>
                    <DialogTitle>Editar pregunta</DialogTitle>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-subcategoria">Subcategoría (opcional)</Label>
                            <Input
                                id="edit-subcategoria"
                                value={editForm.data.subcategoria}
                                onChange={(e) => editForm.setData('subcategoria', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-texto">Pregunta</Label>
                            <Input id="edit-texto" value={editForm.data.texto} onChange={(e) => editForm.setData('texto', e.target.value)} required />
                            {editForm.errors.texto && <p className="text-destructive text-sm">{editForm.errors.texto}</p>}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
