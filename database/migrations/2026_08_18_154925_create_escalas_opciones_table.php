<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Cada fila pertenece EXACTAMENTE a uno de los dos: checklist_plantilla_id (escala
     * general del checklist, la que usan casi todas sus preguntas) o pregunta_id (escala
     * propia de una sola pregunta, ej. la excepción de "Mantenimiento" en Camiones).
     */
    public function up(): void
    {
        Schema::create('escalas_opciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_plantilla_id')->nullable()->constrained('checklists_plantilla')->cascadeOnDelete();
            $table->foreignId('pregunta_id')->nullable()->constrained('preguntas')->cascadeOnDelete();
            $table->string('texto_opcion');
            $table->integer('peso_numerico')->nullable();
            $table->boolean('excluye_promedio')->default(false);
            $table->unsignedTinyInteger('orden');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('escalas_opciones');
    }
};
