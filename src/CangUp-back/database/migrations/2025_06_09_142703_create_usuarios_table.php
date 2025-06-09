<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Run the migrations.*/

    public function up() //Função public up modificada para fazer o back do Login
{
    Schema::create('usuarios', function (Blueprint $table) {
        $table->id();
        $table->string('login')->unique();
        $table->string('email')->unique();
        $table->string('senha'); // armazenada com bcrypt que esconde a senha do usuário, criptografa ela, garantindo maior segurança do Login
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }


    
};
