<?php

namespace App\Models;

use App\Enums\EstadoPlanAccion;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanAccion extends Model
{
    protected $table = 'planes_accion';

    protected $fillable = [
        'respuesta_detalle_id',
        'responsable_id',
        'descripcion',
        'fecha_limite',
        'estado',
        'fecha_cierre',
    ];

    protected $appends = [
        'estado_efectivo',
    ];

    protected function casts(): array
    {
        return [
            'fecha_limite' => 'date',
            'fecha_cierre' => 'date',
            'estado' => EstadoPlanAccion::class,
        ];
    }

    /**
     * @return BelongsTo<RespuestaDetalle, $this>
     */
    public function respuestaDetalle(): BelongsTo
    {
        return $this->belongsTo(RespuestaDetalle::class, 'respuesta_detalle_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function responsable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    /**
     * "Vencido" no se guarda como estado propio — se deriva en caliente para no
     * arriesgarse a que quede desactualizado si nadie corre un job que lo cambie.
     */
    protected function estadoEfectivo(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->estado !== EstadoPlanAccion::Cerrado && $this->fecha_limite->isPast()) {
                    return 'vencido';
                }

                return $this->estado->value;
            },
        );
    }
}
