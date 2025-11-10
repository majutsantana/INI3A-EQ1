<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horarios_alunos', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('id_aluno');
            $table->integer('dia_semana'); // 1=Segunda, 2=Terça, ..., 6=Sábado
            $table->string('tipo'); // 'entrada' ou 'saida'
            $table->time('hora');
            $table->boolean('habilitado')->default(true);
            $table->timestamps();

            $table->foreign('id_aluno')->references('id')->on('alunos')->onDelete('cascade');
            $table->unique(['id_aluno', 'dia_semana', 'tipo']); // Um aluno só pode ter um horário de entrada e um de saída por dia
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios_alunos');
    }
};

