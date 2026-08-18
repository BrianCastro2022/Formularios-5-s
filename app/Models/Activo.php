<?php

namespace App\Models;

use App\Enums\ActivoTipo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activo extends Model
{
    protected $table = 'activos';

    protected $fillable = [
        'area_id',
        'codigo',
        'tipo',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'tipo' => ActivoTipo::class,
            'activo' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Area, $this>
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }
}
