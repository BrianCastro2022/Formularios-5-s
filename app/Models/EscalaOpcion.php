<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EscalaOpcion extends Model
{
    protected $table = 'escalas_opciones';

    protected $fillable = [
        'checklist_plantilla_id',
        'pregunta_id',
        'texto_opcion',
        'peso_numerico',
        'excluye_promedio',
        'es_gap',
        'orden',
    ];

    protected function casts(): array
    {
        return [
            'excluye_promedio' => 'boolean',
            'es_gap' => 'boolean',
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
     * @return BelongsTo<Pregunta, $this>
     */
    public function pregunta(): BelongsTo
    {
        return $this->belongsTo(Pregunta::class, 'pregunta_id');
    }
}
