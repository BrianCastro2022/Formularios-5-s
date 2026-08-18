<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombres',
        'apellidos',
        'tipo_identificacion',
        'numero_identificacion',
        'email',
        'password',
        'rol',
        'must_change_password',
        'activo',
        'area_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Accessors appended to the model's array/JSON form.
     *
     * @var list<string>
     */
    protected $appends = [
        'name',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'rol' => UserRole::class,
            'must_change_password' => 'boolean',
            'activo' => 'boolean',
        ];
    }

    /**
     * Nombre completo, para no romper componentes de UI que ya esperan `user.name`
     * (avatar, sidebar, etc.) mientras el modelo real usa nombres/apellidos por separado.
     */
    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn () => trim("{$this->nombres} {$this->apellidos}"),
        );
    }

    /**
     * @return BelongsTo<Area, $this>
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    /**
     * Planes de acción que este usuario debe ejecutar (Fase 8).
     *
     * @return HasMany<PlanAccion, $this>
     */
    public function planesAccionAsignados(): HasMany
    {
        return $this->hasMany(PlanAccion::class, 'responsable_id');
    }
}
