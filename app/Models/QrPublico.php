<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Tabla de una sola fila (id=1): controla si el enlace público del dashboard
 * (accedido vía QR) está activo, y qué token debe traer la URL para que
 * cuente como válida. Ver QrPublicoDashboardController::validarToken().
 */
class QrPublico extends Model
{
    protected $table = 'qr_publico';

    protected $fillable = [
        'token',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    public static function actual(): self
    {
        return static::firstOrCreate(['id' => 1], ['token' => Str::random(48), 'activo' => false]);
    }
}
