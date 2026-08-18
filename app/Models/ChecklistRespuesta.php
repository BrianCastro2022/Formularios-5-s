<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChecklistRespuesta extends Model
{
    protected $table = 'checklists_respuesta';

    protected $fillable = [
        'checklist_plantilla_id',
        'usuario_id',
        'activo_id',
        'fecha',
        'resultado_porcentaje',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'resultado_porcentaje' => 'float',
        ];
    }

    /**
     * @return BelongsTo<ChecklistPlantilla, $this>
     */
    public function checklistPlantilla(): BelongsTo
    {
        return $this->belongsTo(ChecklistPlantilla::class, 'checklist_plantilla_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * @return BelongsTo<Activo, $this>
     */
    public function activo(): BelongsTo
    {
        return $this->belongsTo(Activo::class, 'activo_id');
    }

    /**
     * @return HasMany<RespuestaDetalle, $this>
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(RespuestaDetalle::class, 'checklist_respuesta_id');
    }
}
