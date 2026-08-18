import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type Activo, type BreadcrumbItem, type ChecklistPlantilla, type EscalaOpcion, type Pregunta } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface DiligenciarProps {
    checklist: ChecklistPlantilla;
    activo: Activo | null;
    yaDiligenciadoEstePeriodo: boolean;
}

interface RespuestaForm {
    pregunta_id: number;
    opcion_id: string;
    observacion: string;
    foto: File | null;
    [key: string]: number | string | File | null | undefined;
}

function opcionesDePregunta(pregunta: Pregunta, generales: EscalaOpcion[]): EscalaOpcion[] {
    return pregunta.escala_propia && pregunta.escala_propia.length > 0 ? pregunta.escala_propia : generales;
}

export default function Diligenciar({ checklist, activo, yaDiligenciadoEstePeriodo }: DiligenciarProps) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mi formulario', href: '/mi-formulario' }];
    const generales = checklist.escalas_generales ?? [];
    const secciones = checklist.secciones ?? [];

    const [step, setStep] = useState<'form' | 'resumen'>('form');

    const respuestasIniciales: RespuestaForm[] = secciones
        .flatMap((s) => s.preguntas ?? [])
        .map((p) => ({ pregunta_id: p.id, opcion_id: '', observacion: '', foto: null }));

    const { data, setData, post, processing, errors } = useForm({
        activo_id: activo ? String(activo.id) : '',
        respuestas: respuestasIniciales,
    });

    const fieldErrors = errors as Record<string, string>;

    const totalPreguntas = data.respuestas.length;
    const respondidas = data.respuestas.filter((r) => r.opcion_id !== '').length;
    const completo = respondidas === totalPreguntas;

    const actualizarRespuesta = (preguntaId: number, cambios: Partial<RespuestaForm>) => {
        setData(
            'respuestas',
            data.respuestas.map((r) => (r.pregunta_id === preguntaId ? { ...r, ...cambios } : r)),
        );
    };

    const irARevisar: FormEventHandler = (e) => {
        e.preventDefault();
        setStep('resumen');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const enviar: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('formulario.store'), { preserveScroll: true });
    };

    const tituloActivo = activo ? ` — ${activo.codigo}` : '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={checklist.nombre} />

            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title={`${checklist.nombre}${tituloActivo}`}
                    description={step === 'form' ? `${respondidas}/${totalPreguntas} preguntas respondidas` : 'Revisa tus respuestas antes de enviar'}
                />

                {yaDiligenciadoEstePeriodo && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Ya diligenciaste este checklist este mes</AlertTitle>
                        <AlertDescription>
                            Puedes continuar si necesitas registrar una nueva revisión, pero verifica que no sea un envío duplicado.
                        </AlertDescription>
                    </Alert>
                )}

                {fieldErrors.respuestas && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{fieldErrors.respuestas}</AlertDescription>
                    </Alert>
                )}

                {step === 'form' && (
                    <form onSubmit={irARevisar} className="space-y-6">
                        {secciones.map((seccion) => (
                            <Card key={seccion.id}>
                                <CardHeader>
                                    <CardTitle className="text-base">{seccion.nombre}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(seccion.preguntas ?? []).map((pregunta) => {
                                        const index = data.respuestas.findIndex((r) => r.pregunta_id === pregunta.id);
                                        const respuesta = data.respuestas[index];
                                        const opciones = opcionesDePregunta(pregunta, generales);

                                        return (
                                            <div key={pregunta.id} className="space-y-3 rounded-lg border p-3">
                                                <div>
                                                    {pregunta.subcategoria && (
                                                        <span className="text-muted-foreground text-xs font-medium uppercase">
                                                            {pregunta.subcategoria}
                                                        </span>
                                                    )}
                                                    <p className="text-sm font-medium">{pregunta.texto}</p>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {opciones.map((opcion) => (
                                                        <Button
                                                            key={opcion.id}
                                                            type="button"
                                                            size="sm"
                                                            variant={respuesta.opcion_id === String(opcion.id) ? 'default' : 'outline'}
                                                            onClick={() => actualizarRespuesta(pregunta.id, { opcion_id: String(opcion.id) })}
                                                        >
                                                            {opcion.texto_opcion}
                                                        </Button>
                                                    ))}
                                                </div>
                                                {fieldErrors[`respuestas.${index}.opcion_id`] && (
                                                    <p className="text-destructive text-sm">{fieldErrors[`respuestas.${index}.opcion_id`]}</p>
                                                )}

                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    <div className="grid gap-1.5">
                                                        <Label className="text-muted-foreground text-xs">Observación (opcional)</Label>
                                                        <Textarea
                                                            value={respuesta.observacion}
                                                            onChange={(e) => actualizarRespuesta(pregunta.id, { observacion: e.target.value })}
                                                            rows={2}
                                                        />
                                                    </div>
                                                    <div className="grid gap-1.5">
                                                        <Label className="text-muted-foreground text-xs">Foto de evidencia (opcional)</Label>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => actualizarRespuesta(pregunta.id, { foto: e.target.files?.[0] ?? null })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        ))}

                        <Button type="submit" size="lg" disabled={!completo} className="w-full">
                            Revisar antes de enviar
                        </Button>
                        {!completo && <p className="text-muted-foreground text-center text-sm">Responde todas las preguntas para continuar.</p>}
                    </form>
                )}

                {step === 'resumen' && (
                    <form onSubmit={enviar} className="space-y-6">
                        {secciones.map((seccion) => (
                            <Card key={seccion.id}>
                                <CardHeader>
                                    <CardTitle className="text-base">{seccion.nombre}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {(seccion.preguntas ?? []).map((pregunta) => {
                                        const respuesta = data.respuestas.find((r) => r.pregunta_id === pregunta.id)!;
                                        const opciones = opcionesDePregunta(pregunta, generales);
                                        const opcionElegida = opciones.find((o) => String(o.id) === respuesta.opcion_id);

                                        return (
                                            <div key={pregunta.id} className="flex items-start justify-between gap-4 border-b pb-2 last:border-0">
                                                <div>
                                                    <p className="text-sm">{pregunta.texto}</p>
                                                    {respuesta.observacion && (
                                                        <p className="text-muted-foreground text-xs italic">"{respuesta.observacion}"</p>
                                                    )}
                                                    {respuesta.foto && <p className="text-muted-foreground text-xs">📎 {respuesta.foto.name}</p>}
                                                </div>
                                                <Badge variant="outline" className="shrink-0">
                                                    {opcionElegida?.texto_opcion}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        ))}

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('form')}>
                                Volver a editar
                            </Button>
                            <Button type="submit" className="flex-1" disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Confirmar y enviar
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </AppLayout>
    );
}
