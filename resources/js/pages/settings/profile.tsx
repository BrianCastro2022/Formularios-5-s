import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

export default function Profile() {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        nombres: auth.user.nombres,
        apellidos: auth.user.apellidos,
        email: auth.user.email ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="nombres">Nombres</Label>

                            <Input
                                id="nombres"
                                className="mt-1 block w-full"
                                value={data.nombres}
                                onChange={(e) => setData('nombres', e.target.value)}
                                required
                                autoComplete="given-name"
                                placeholder="Nombres"
                            />

                            <InputError className="mt-2" message={errors.nombres} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="apellidos">Apellidos</Label>

                            <Input
                                id="apellidos"
                                className="mt-1 block w-full"
                                value={data.apellidos}
                                onChange={(e) => setData('apellidos', e.target.value)}
                                required
                                autoComplete="family-name"
                                placeholder="Apellidos"
                            />

                            <InputError className="mt-2" message={errors.apellidos} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo electrónico (opcional)</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="email"
                                placeholder="Correo electrónico"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
