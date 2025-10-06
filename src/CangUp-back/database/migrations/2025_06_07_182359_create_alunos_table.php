<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alunos', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nome');
            $table->string('cpf');
            $table->string('ra');
            $table->string('email')->nullable();
            $table->string('genero')->nullable();
            $table->string('endereco')->nullable();
            $table->string('telefone')->nullable();
            $table->text('imagem')->nullable();
            $table->unsignedInteger('id_inst');
            $table->foreign('id_inst')->references('id')->on('instituicoes')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alunos');
    }
};
