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
        Schema::create('qr_publico', function (Blueprint $table) {
            $table->id();
            // Token que forma parte de la URL pública (/qr/{token}) — se compara
            // con hash_equals() en QrPublicoDashboardController, no es un secreto
            // criptográfico de alta entropía crítica, pero sí lo bastante largo
            // para no ser adivinable.
            $table->string('token', 64)->unique();
            $table->boolean('activo')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qr_publico');
    }
};
