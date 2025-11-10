<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PerfilsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insere os perfis com os IDs específicos do banco antigo (apenas se não existirem)
        $perfis = [
            [
                'id' => 1,
                'nome' => 'administrativo',
                'rotulo' => 'adm',
                'created_at' => '2025-10-06 14:06:28',
                'updated_at' => '2025-10-06 14:06:28',
            ],
            [
                'id' => 2,
                'nome' => 'instituição',
                'rotulo' => 'inst',
                'created_at' => '2025-10-06 14:06:28',
                'updated_at' => '2025-10-06 14:06:28',
            ],
            [
                'id' => 3,
                'nome' => 'responsável',
                'rotulo' => 'resp',
                'created_at' => '2025-10-06 14:06:28',
                'updated_at' => '2025-10-06 14:06:28',
            ],
            [
                'id' => 4,
                'nome' => 'aluno',
                'rotulo' => 'alun',
                'created_at' => '2025-10-06 14:06:28',
                'updated_at' => '2025-10-06 14:06:28',
            ],
        ];
        
        $inseridos = 0;
        foreach ($perfis as $perfil) {
            $existe = DB::table('perfils')->where('id', $perfil['id'])->exists();
            if (!$existe) {
                DB::table('perfils')->insert($perfil);
                $inseridos++;
            }
        }
        
        // Ajustar a sequência para o próximo ID disponível (5)
        DB::statement("SELECT setval('perfils_id_seq', 5, true)");

        $this->command->info("✓ {$inseridos} perfis criados (outros já existiam)!");
    }
}
