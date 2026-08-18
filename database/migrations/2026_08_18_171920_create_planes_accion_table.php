<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * "Vencido" NO es un valor de `estado` guardado — se calcula dinámicamente
     * (fecha_limite < hoy && estado != cerrado) para evitar que quede
     * inconsistente si nadie actualiza el registro a tiempo (sugerencia del PDF).
     */
    public function up(): void
    {
        Schema::create('planes_accion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('respuesta_detalle_id')->constrained('respuestas_detalle')->cascadeOnDelete();
            $table->foreignId('responsable_id')->constrained('users');
            $table->text('descripcion');
            $table->date('fecha_limite');
            $table->string('estado')->default('abierto');
            $table->date('fecha_cierre')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planes_accion');
    }
};
