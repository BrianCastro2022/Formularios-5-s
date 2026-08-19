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
     * literalmente desde el Apéndice de la Fase 3, más las zonas de Almacén y
     * Administrativo (pedidas por el negocio después de Fase 4) que se diligencian
     * igual que un activo: una por una, no una sola vez por área.
     */
    public function run(): void
    {
        $camiones = [
            'LJT758', 'XMC055', 'UYW793', 'LJU894', 'LJU879', 'LJV386', 'UYW786', 'VCM452',
            'UYW741', 'LJV503', 'JTY672', 'JTY662', 'LCN238', 'LCN242', 'JTY674', 'JTZ370',
            'VCM070', 'LJS641', 'LJS651', 'PSX019', 'PSX040', 'PSX041', 'PSX039',
        ];

        $montacargas = ['633', '872', '566'];

        $zonasAlmacen = [
            'Reempaque', 'Sorting', 'Residuos y Sustancias Químicas', 'Bahías de Carga y Descarga T1',
            'Picking', 'Marketplace', 'Almacén PT', 'Vertimiento', 'Centro de Acopio',
        ];

        $zonasAdministrativo = [
            'Oficinas Administrativas OL', 'Oficinas Administrativas UC', 'Zona de Liquidación', 'Salas de agencia',
        ];

        $porTipo = [
            ActivoTipo::Camion->value => $camiones,
            ActivoTipo::Montacargas->value => $montacargas,
            ActivoTipo::ZonaAlmacen->value => $zonasAlmacen,
            ActivoTipo::ZonaAdministrativo->value => $zonasAdministrativo,
        ];

        foreach ($porTipo as $tipoValue => $codigos) {
            $tipo = ActivoTipo::from($tipoValue);
            $area = Area::query()->where('nombre', $tipo->areaNombre())->firstOrFail();

            foreach ($codigos as $codigo) {
                Activo::query()->firstOrCreate(
                    ['codigo' => $codigo],
                    ['area_id' => $area->id, 'tipo' => $tipo, 'activo' => true],
                );
            }
        }
    }
}
