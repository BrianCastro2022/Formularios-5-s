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
        Schema::create('checklists_respuesta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_plantilla_id')->constrained('checklists_plantilla');
            $table->foreignId('usuario_id')->constrained('users');
            $table->foreignId('activo_id')->nullable()->constrained('activos');
            $table->date('fecha');
            $table->decimal('resultado_porcentaje', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checklists_respuesta');
    }
};
