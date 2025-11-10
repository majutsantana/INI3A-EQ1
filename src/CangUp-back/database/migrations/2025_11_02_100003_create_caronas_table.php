<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('caronas', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('id_aluno');
            $table->unsignedInteger('id_responsavel');
            $table->integer('dia_semana'); // 1=Segunda, 2=Terça, ..., 6=Sábado
            $table->string('tipo'); // 'entrada' ou 'saida'
            $table->time('hora');
            $table->string('status')->default('pendente'); // 'pendente', 'aceita', 'recusada', 'cancelada'
            $table->decimal('distancia_km', 8, 2)->nullable();
            $table->timestamp('data_solicitacao')->nullable();
            $table->timestamp('data_aceitacao')->nullable();
            $table->timestamps();

            $table->foreign('id_aluno')->references('id')->on('alunos')->onDelete('cascade');
            $table->foreign('id_responsavel')->references('id')->on('responsaveis')->onDelete('cascade');
            
            // Não há constraint unique no dump original, mas pode ser adicionado depois se necessário
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('caronas');
    }
};

