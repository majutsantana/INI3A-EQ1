<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
      //  \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        \App\Models\Usuario::create([
            'login'=>'yasmin1',
            'email'=>'teste@srasda.com',
            'senha'=>'1234'
        ]);

        \App\Models\Perfil::create([
            'rotulo' => 'adm',
            'nome'=>'administrativo'
        ]);
        \App\Models\Perfil::create([
            'rotulo' => 'inst',
            'nome'=>'instituição'
        ]);
        \App\Models\Perfil::create([
            'rotulo' => 'resp',
            'nome'=>'responsável'
        ]);
        \App\Models\Perfil::create([
            'rotulo' => 'alun',
            'nome'=>'aluno'
        ]);
    }
}
