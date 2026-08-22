import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, Copy, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Código QR', href: '/admin/qr-publico' }];

interface QrPublicoIndexProps {
    activo: boolean;
    url: string;
}

export default function QrPublicoIndex({ activo, url }: QrPublicoIndexProps) {
    const [copiado, setCopiado] = useState(false);

    const toggleStatus = () => {
        router.patch(route('admin.qr-publico.toggle-status'), {}, { preserveScroll: true });
    };

    const copiarUrl = async () => {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Código QR" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title="Código QR de acceso público"
                    description="Habilita una vista de solo lectura del dashboard, sin necesidad de iniciar sesión."
                />

                <Card className="max-w-2xl">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-base">Estado del QR</CardTitle>
                            <p className="text-muted-foreground text-sm">
                                Mientras esté <strong>desactivado</strong>, nadie puede acceder al dashboard público, aunque conserve el enlace o el
                                propio código QR ya impreso.
                            </p>
                        </div>
                        <Badge variant={activo ? 'default' : 'secondary'}>{activo ? 'Activo' : 'Inactivo'}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Button variant={activo ? 'destructive' : 'default'} onClick={toggleStatus}>
                            {activo ? 'Desactivar QR' : 'Activar QR'}
                        </Button>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Enlace público</p>
                            <div className="flex gap-2">
                                <Input readOnly value={url} className="font-mono text-xs" />
                                <Button type="button" variant="outline" size="icon" onClick={copiarUrl} title="Copiar enlace">
                                    {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            {!activo && (
                                <p className="text-muted-foreground text-xs">
                                    Este enlace no funcionará hasta que actives el QR — puedes copiarlo o imprimirlo desde ya.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Código QR</p>
                            <div className="flex w-fit items-center justify-center rounded-lg border bg-white p-4">
                                <QRCodeSVG value={url} size={200} marginSize={2} />
                            </div>
                            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                <QrCode className="h-3.5 w-3.5" />
                                Cualquier lector de QR puede escanear esta imagen directamente desde la pantalla.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
