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
        Schema::create('veiculos', function (Blueprint $table) {
            $table->increments('id');
            $table->string('modelo');
            $table->string('placa');
            $table->string('cor');
            $table->integer('qtde_assentos');
            $table->unsignedInteger('id_resp');
            $table->foreign('id_resp')->references('id')->on('responsaveis')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('veiculos');
    }
};
