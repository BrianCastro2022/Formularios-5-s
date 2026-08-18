<?php

namespace Database\Seeders;

use App\Models\Area;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    /**
     * Áreas fijas del CD Nariño (Fase 2 / HU-05..HU-08).
     */
    public function run(): void
    {
        collect(['Almacén', 'Administrativo', 'Montacargas', 'Camiones', 'Taller mecánico'])
            ->each(fn (string $nombre) => Area::query()->firstOrCreate(['nombre' => $nombre]));
    }
}
