<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horarios_responsaveis', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('id_responsavel');
            $table->integer('dia_semana'); // 1=Segunda, 2=Terça, ..., 6=Sábado
            $table->string('tipo'); // 'entrada' ou 'saida'
            $table->time('hora');
            $table->boolean('habilitado')->default(true);
            $table->timestamps();

            $table->foreign('id_responsavel')->references('id')->on('responsaveis')->onDelete('cascade');
            $table->unique(['id_responsavel', 'dia_semana', 'tipo']); // Um responsável só pode ter um horário de entrada e um de saída por dia
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios_responsaveis');
    }
};

