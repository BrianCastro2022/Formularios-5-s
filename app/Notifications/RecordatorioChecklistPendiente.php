<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Recordatorio semanal para un Responsable que no ha diligenciado ningún
 * formulario 5S en los últimos 7 días — ver App\Console\Commands\EnviarRecordatoriosChecklist.
 *
 * Se envía de forma síncrona (no implementa ShouldQueue) a propósito: requiere
 * un worker de colas corriendo permanentemente (`queue:work`) que este proyecto
 * no tiene configurado, y un recordatorio que se queda esperando en la cola sin
 * enviarse nunca es peor que uno que tarda unos segundos más en el comando.
 */
class RecordatorioChecklistPendiente extends Notification
{
    use Queueable;

    public function __construct(private readonly int $diasSinDiligenciar) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(User $notifiable): MailMessage
    {
        $area = $notifiable->area?->nombre ?? 'tu área';

        return (new MailMessage)
            ->subject('Recordatorio: formulario 5S pendiente — '.$area)
            ->greeting('Hola '.$notifiable->nombres.',')
            ->line("Han pasado {$this->diasSinDiligenciar} días desde tu último registro 5S en {$area}.")
            ->line('Recuerda que el formulario debe diligenciarse una vez por semana calendario.')
            ->action('Diligenciar formulario', route('formulario.show'))
            ->line('Si ya lo diligenciaste recientemente, puedes ignorar este mensaje.');
    }
}
