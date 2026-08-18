<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Seccion5S extends Model
{
    protected $table = 'secciones_5s';

    protected $fillable = [
        'checklist_plantilla_id',
        'nombre',
        'orden',
    ];

    /**
     * @return BelongsTo<ChecklistPlantilla, $this>
     */
    public function checklistPlantilla(): BelongsTo
    {
        return $this->belongsTo(ChecklistPlantilla::class, 'checklist_plantilla_id');
    }

    /**
     * @return HasMany<Pregunta, $this>
     */
    public function preguntas(): HasMany
    {
        return $this->hasMany(Pregunta::class, 'seccion_id')->orderBy('orden');
    }
}
