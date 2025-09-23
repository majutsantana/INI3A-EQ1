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

        \App\Models\Usuario::create([
            'login'=>'arthur',
            'email'=>'arthur@cangup.com',
            'senha'=>'arthurCangUp'
        ]);

        \App\Models\PerfilUsuario::create([
            'perfil_id'=>'1',
            'usuario_id'=>'1'
        ]);

        \App\Models\Usuario::create([
            'login'=>'chloe',
            'email'=>'chloe@cangup.com',
            'senha'=>'chloeCangUp'
        ]);

        \App\Models\PerfilUsuario::create([
            'perfil_id'=>'1',
            'usuario_id'=>'2'
        ]);

        \App\Models\Usuario::create([
            'login'=>'luiza',
            'email'=>'luiza@cangup.com',
            'senha'=>'luizaCangUp'
        ]);

        \App\Models\PerfilUsuario::create([
            'perfil_id'=>'1',
            'usuario_id'=>'3'
        ]);

        \App\Models\Usuario::create([
            'login'=>'mariajulia',
            'email'=>'mariajulia@cangup.com',
            'senha'=>'mariajuliaCangUp'
        ]);

        \App\Models\PerfilUsuario::create([
            'perfil_id'=>'1',
            'usuario_id'=>'4'
        ]);

        \App\Models\Usuario::create([
            'login'=>'olivia',
            'email'=>'olivia@cangup.com',
            'senha'=>'oliviaCangUp'
        ]);

        \App\Models\PerfilUsuario::create([
            'perfil_id'=>'1',
            'usuario_id'=>'5'
        ]);

        \App\Models\Usuario::create([
            'login'=>'yasmin',
            'email'=>'yasmin@cangup.com',
            'senha'=>'yasminCangUp'
        ]);

        \App\Models\PerfilUsuario::create([
            'perfil_id'=>'1',
            'usuario_id'=>'6'
        ]);
    }
}
