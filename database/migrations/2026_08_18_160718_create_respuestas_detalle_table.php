<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('respuestas_detalle', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_respuesta_id')->constrained('checklists_respuesta')->cascadeOnDelete();
            $table->foreignId('pregunta_id')->constrained('preguntas');
            $table->foreignId('opcion_id')->constrained('escalas_opciones');
            $table->text('observacion')->nullable();
            $table->string('foto_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('respuestas_detalle');
    }
};
