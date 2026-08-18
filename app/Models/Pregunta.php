<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pregunta extends Model
{
    protected $table = 'preguntas';

    protected $fillable = [
        'seccion_id',
        'subcategoria',
        'texto',
        'orden',
        'activa',
    ];

    protected function casts(): array
    {
        return [
            'activa' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Seccion5S, $this>
     */
    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion5S::class, 'seccion_id');
    }

    /**
     * Escala propia de esta pregunta, si la tiene (ej. la excepción de
     * "Mantenimiento" en Camiones). La mayoría de preguntas no tienen ninguna
     * y usan la escala general del checklist — ver opciones().
     *
     * @return HasMany<EscalaOpcion, $this>
     */
    public function escalaPropia(): HasMany
    {
        return $this->hasMany(EscalaOpcion::class, 'pregunta_id')->orderBy('orden');
    }

    /**
     * Las opciones de respuesta que debe usar esta pregunta: su escala propia
     * si existe, o si no la escala general del checklist al que pertenece.
     *
     * @return Collection<int, EscalaOpcion>
     */
    public function opciones(): Collection
    {
        $propias = $this->escalaPropia;

        return $propias->isNotEmpty()
            ? $propias
            : $this->seccion->checklistPlantilla->escalasGenerales;
    }
}
