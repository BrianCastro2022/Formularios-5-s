<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Area extends Model
{
    protected $fillable = [
        'nombre',
    ];

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * @return HasMany<Activo, $this>
     */
    public function activos(): HasMany
    {
        return $this->hasMany(Activo::class);
    }

    /**
     * @return HasMany<ChecklistPlantilla, $this>
     */
    public function checklistsPlantilla(): HasMany
    {
        return $this->hasMany(ChecklistPlantilla::class);
    }
}
