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
        Schema::create('perfil_usuario', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('perfil_id');
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('instituicao_id')->nullable();
            $table->foreign('perfil_id')->references('id')->on('perfils');
            $table->foreign('usuario_id')->references('id')->on('usuarios');
            $table->foreign('instituicao_id')->references('id')->on('instituicoes');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perfil_usuario');
    }
};
