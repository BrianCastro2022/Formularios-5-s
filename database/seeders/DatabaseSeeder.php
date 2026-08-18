<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(AreaSeeder::class);
        $this->call(ActivoSeeder::class);
        $this->call(ChecklistSeeder::class);

        // Usuario administrador semilla (HU-01/HU-03): login = numero_identificacion,
        // password inicial = numero_identificacion, cambio obligatorio en primer ingreso.
        User::factory()->create([
            'nombres' => 'Administrador',
            'apellidos' => 'CD Nariño',
            'tipo_identificacion' => 'CC',
            'numero_identificacion' => '1000000000',
            'password' => '1000000000',
            'rol' => UserRole::Admin,
            'must_change_password' => true,
        ]);
    }
}
