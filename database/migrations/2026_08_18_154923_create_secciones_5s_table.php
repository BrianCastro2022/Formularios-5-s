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
        Schema::create('secciones_5s', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_plantilla_id')->constrained('checklists_plantilla')->cascadeOnDelete();
            $table->string('nombre');
            $table->unsignedTinyInteger('orden');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('secciones_5s');
    }
};
