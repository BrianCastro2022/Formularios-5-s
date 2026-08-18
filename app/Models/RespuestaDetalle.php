<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RespuestaDetalle extends Model
{
    protected $table = 'respuestas_detalle';

    protected $fillable = [
        'checklist_respuesta_id',
        'pregunta_id',
        'opcion_id',
        'observacion',
        'foto_url',
    ];

    /**
     * @return BelongsTo<ChecklistRespuesta, $this>
     */
    public function checklistRespuesta(): BelongsTo
    {
        return $this->belongsTo(ChecklistRespuesta::class, 'checklist_respuesta_id');
    }

    /**
     * @return BelongsTo<Pregunta, $this>
     */
    public function pregunta(): BelongsTo
    {
        return $this->belongsTo(Pregunta::class, 'pregunta_id');
    }

    /**
     * @return BelongsTo<EscalaOpcion, $this>
     */
    public function opcion(): BelongsTo
    {
        return $this->belongsTo(EscalaOpcion::class, 'opcion_id');
    }

    /**
     * @return HasMany<PlanAccion, $this>
     */
    public function planesAccion(): HasMany
    {
        return $this->hasMany(PlanAccion::class, 'respuesta_detalle_id');
    }
}
