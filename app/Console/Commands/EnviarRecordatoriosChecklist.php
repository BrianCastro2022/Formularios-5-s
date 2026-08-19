<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\ChecklistRespuesta;
use App\Models\User;
use App\Notifications\RecordatorioChecklistPendiente;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * Corre a diario (ver bootstrap/app.php ->withSchedule) y envía un correo a
 * cada Responsable activo, con correo registrado, cuyo último registro 5S
 * (en cualquier checklist/activo de su área) tiene 7 días o más. Si nunca ha
 * diligenciado nada, se usa la fecha de creación de su cuenta como punto de
 * partida. No reenvía todos los días una vez vencido: solo cuando pasa otra
 * semana desde el último recordatorio (`recordatorio_enviado_at`), y ese
 * contador se limpia solo cuando el usuario vuelve a diligenciar un checklist
 * (ver FormularioController::store).
 */
class EnviarRecordatoriosChecklist extends Command
{
    protected $signature = 'checklists:recordar-pendientes';

    protected $description = 'Envía un correo a los responsables que llevan una semana o más sin diligenciar su formulario 5S';

    public function handle(): int
    {
        $limite = now()->subDays(7);

        $responsables = User::query()
            ->where('rol', UserRole::Responsable)
            ->where('activo', true)
            ->whereNotNull('email')
            ->with('area')
            ->get();

        $enviados = 0;

        foreach ($responsables as $responsable) {
            $ultimoRegistro = ChecklistRespuesta::query()
                ->where('usuario_id', $responsable->id)
                ->max('fecha');

            $ultimaFecha = $ultimoRegistro ? Carbon::parse($ultimoRegistro) : $responsable->created_at;

            if ($ultimaFecha->gt($limite)) {
                continue;
            }

            if ($responsable->recordatorio_enviado_at && $responsable->recordatorio_enviado_at->gt($limite)) {
                continue;
            }

            $responsable->notify(new RecordatorioChecklistPendiente((int) $ultimaFecha->diffInDays(now())));
            $responsable->update(['recordatorio_enviado_at' => now()]);
            $enviados++;
        }

        $this->info("Recordatorios enviados: {$enviados} de {$responsables->count()} responsables con correo.");

        return self::SUCCESS;
    }
}
