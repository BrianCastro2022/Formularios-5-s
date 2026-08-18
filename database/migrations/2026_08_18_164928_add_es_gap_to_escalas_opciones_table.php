<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Qué opción(es) de cada escala cuentan como "GAP" (Fase 6, HU-26/HU-27) queda
     * parametrizado por dato (esta columna), no hardcodeado por texto en el código —
     * cada checklist puede tener un criterio distinto (ver ChecklistSeeder).
     */
    public function up(): void
    {
        Schema::table('escalas_opciones', function (Blueprint $table) {
            $table->boolean('es_gap')->default(false)->after('excluye_promedio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('escalas_opciones', function (Blueprint $table) {
            $table->dropColumn('es_gap');
        });
    }
};
