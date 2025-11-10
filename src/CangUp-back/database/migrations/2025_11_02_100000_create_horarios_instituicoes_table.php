<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horarios_instituicoes', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('id_inst');
            $table->integer('dia_semana'); // 1=Segunda, 2=Terça, ..., 6=Sábado
            $table->time('hora_inicio');
            $table->time('hora_fim');
            $table->timestamps();

            $table->foreign('id_inst')->references('id')->on('instituicoes')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios_instituicoes');
    }
};

