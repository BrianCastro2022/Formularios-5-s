<?php

namespace Database\Seeders;

use App\Enums\ActivoTipo;
use App\Models\Activo;
use App\Models\Area;
use Illuminate\Database\Seeder;

class ActivoSeeder extends Seeder
{
    /**
     * Placas de camiones (23, HU-10) y unidades de montacargas (3, HU-11) precargadas
     * literalmente desde el Apéndice de la Fase 3.
     */
    public function run(): void
    {
        $camiones = [
            'LJT758', 'XMC055', 'UYW793', 'LJU894', 'LJU879', 'LJV386', 'UYW786', 'VCM452',
            'UYW741', 'LJV503', 'JTY672', 'JTY662', 'LCN238', 'LCN242', 'JTY674', 'JTZ370',
            'VCM070', 'LJS641', 'LJS651', 'PSX019', 'PSX040', 'PSX041', 'PSX039',
        ];

        $montacargas = ['633', '872', '566'];

        $areaCamiones = Area::query()->where('nombre', 'Camiones')->firstOrFail();
        $areaMontacargas = Area::query()->where('nombre', 'Montacargas')->firstOrFail();

        foreach ($camiones as $placa) {
            Activo::query()->firstOrCreate(
                ['codigo' => $placa],
                ['area_id' => $areaCamiones->id, 'tipo' => ActivoTipo::Camion, 'activo' => true],
            );
        }

        foreach ($montacargas as $numero) {
            Activo::query()->firstOrCreate(
                ['codigo' => $numero],
                ['area_id' => $areaMontacargas->id, 'tipo' => ActivoTipo::Montacargas, 'activo' => true],
            );
        }
    }
}
