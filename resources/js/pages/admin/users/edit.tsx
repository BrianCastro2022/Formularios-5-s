import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { type Area, type BreadcrumbItem, type User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { UserForm, type UserFormData } from './user-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Usuarios', href: '/admin/usuarios' },
    { title: 'Editar usuario', href: '#' },
];

export default function EditUser({ user, areas }: { user: User; areas: Area[] }) {
    const { data, setData, put, processing, errors } = useForm<UserFormData>({
        nombres: user.nombres,
        apellidos: user.apellidos,
        tipo_identificacion: user.tipo_identificacion,
        numero_identificacion: user.numero_identificacion,
        rol: user.rol,
        area_id: user.area_id ? String(user.area_id) : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${user.name}`} />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title={`Editar ${user.name}`} description={`Cédula ${user.numero_identificacion}`} />

                <UserForm
                    areas={areas}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submitLabel="Guardar cambios"
                    onSubmit={submit}
                />
            </div>
        </AppLayout>
    );
}
