import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Area } from '@/types';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

export const TIPOS_IDENTIFICACION = ['CC', 'CE', 'TI', 'PPT', 'Pasaporte'] as const;

export interface UserFormData {
    nombres: string;
    apellidos: string;
    tipo_identificacion: string;
    numero_identificacion: string;
    rol: 'admin' | 'responsable';
    area_id: string;
    [key: string]: string;
}

interface UserFormProps {
    areas: Area[];
    data: UserFormData;
    setData: <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => void;
    errors: Partial<Record<keyof UserFormData, string>>;
    processing: boolean;
    submitLabel: string;
    onSubmit: FormEventHandler;
    helpText?: string;
}

export function UserForm({ areas, data, setData, errors, processing, submitLabel, onSubmit, helpText }: UserFormProps) {
    return (
        <form onSubmit={onSubmit} className="max-w-xl space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="nombres">Nombres</Label>
                    <Input id="nombres" value={data.nombres} onChange={(e) => setData('nombres', e.target.value)} required autoFocus />
                    <InputError message={errors.nombres} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="apellidos">Apellidos</Label>
                    <Input id="apellidos" value={data.apellidos} onChange={(e) => setData('apellidos', e.target.value)} required />
                    <InputError message={errors.apellidos} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="tipo_identificacion">Tipo de identificación</Label>
                    <Select value={data.tipo_identificacion} onValueChange={(value) => setData('tipo_identificacion', value)}>
                        <SelectTrigger id="tipo_identificacion">
                            <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            {TIPOS_IDENTIFICACION.map((tipo) => (
                                <SelectItem key={tipo} value={tipo}>
                                    {tipo}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.tipo_identificacion} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="numero_identificacion">Número de identificación</Label>
                    <Input
                        id="numero_identificacion"
                        value={data.numero_identificacion}
                        onChange={(e) => setData('numero_identificacion', e.target.value)}
                        required
                    />
                    <InputError message={errors.numero_identificacion} />
                    {helpText && <p className="text-muted-foreground text-xs">{helpText}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="rol">Rol</Label>
                    <Select value={data.rol} onValueChange={(value) => setData('rol', value as UserFormData['rol'])}>
                        <SelectTrigger id="rol">
                            <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="responsable">Responsable</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.rol} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="area_id">Área asignada{data.rol === 'responsable' && ' (obligatoria)'}</Label>
                    <Select value={data.area_id} onValueChange={(value) => setData('area_id', value)} disabled={data.rol !== 'responsable'}>
                        <SelectTrigger id="area_id">
                            <SelectValue placeholder={data.rol === 'responsable' ? 'Selecciona un área' : 'No aplica'} />
                        </SelectTrigger>
                        <SelectContent>
                            {areas.map((area) => (
                                <SelectItem key={area.id} value={String(area.id)}>
                                    {area.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.area_id} />
                </div>
            </div>

            <Button type="submit" disabled={processing}>
                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {submitLabel}
            </Button>
        </form>
    );
}
