<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChecklistPlantilla extends Model
{
    protected $table = 'checklists_plantilla';

    protected $fillable = [
        'area_id',
        'nombre',
    ];

    /**
     * @return BelongsTo<Area, $this>
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    /**
     * @return HasMany<Seccion5S, $this>
     */
    public function secciones(): HasMany
    {
        return $this->hasMany(Seccion5S::class, 'checklist_plantilla_id')->orderBy('orden');
    }

    /**
     * Opciones de la escala general del checklist (las que usan sus preguntas
     * salvo que una pregunta tenga su propia escala, ver Pregunta::opciones()).
     *
     * @return HasMany<EscalaOpcion, $this>
     */
    public function escalasGenerales(): HasMany
    {
        return $this->hasMany(EscalaOpcion::class, 'checklist_plantilla_id')->orderBy('orden');
    }
}
