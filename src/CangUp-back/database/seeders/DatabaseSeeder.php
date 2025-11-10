<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('========================================');
        $this->command->info('INICIANDO SEEDERS DO BANCO DE DADOS');
        $this->command->info('========================================');
        
        // 1. Perfis primeiro (necessário para foreign keys)
        $this->call(PerfilsTableSeeder::class);
        
        // 2. Seeder completo da CTI (cria tudo: instituição, admin, responsáveis, alunos, horários, veículos, caronas)
        $this->call(SeederCompletoCTI::class);
        
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('SEEDERS CONCLUÍDOS COM SUCESSO!');
        $this->command->info('========================================');
    }
}
