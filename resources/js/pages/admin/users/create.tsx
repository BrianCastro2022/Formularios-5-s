import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { type Area, type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { UserForm, type UserFormData } from './user-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Usuarios', href: '/admin/usuarios' },
    { title: 'Crear usuario', href: '/admin/usuarios/crear' },
];

export default function CreateUser({ areas }: { areas: Area[] }) {
    const { data, setData, post, processing, errors } = useForm<UserFormData>({
        nombres: '',
        apellidos: '',
        tipo_identificacion: 'CC',
        numero_identificacion: '',
        rol: 'responsable',
        area_id: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear usuario" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Crear usuario" description="La contraseña inicial será igual al número de identificación." />

                <UserForm
                    areas={areas}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submitLabel="Crear usuario"
                    onSubmit={submit}
                    helpText="Será la contraseña inicial del usuario (deberá cambiarla en su primer ingreso)."
                />
            </div>
        </AppLayout>
    );
}
