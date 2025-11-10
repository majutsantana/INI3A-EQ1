<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HorariosVeiculosCTISeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('========================================');
        $this->command->info('CRIANDO HORÁRIOS, VEÍCULOS E DADOS CTI');
        $this->command->info('========================================');

        // Buscar ID da instituição CTI
        $instituicao = DB::table('instituicoes')
            ->where('email', 'cti.unesp@exemplo.com')
            ->first();

        if (!$instituicao) {
            $this->command->error('❌ Instituição CTI não encontrada!');
            return;
        }

        $inst_id = $instituicao->id;
        $this->command->info("✓ Instituição CTI encontrada (ID: {$inst_id})");

        // Buscar endereço da instituição CTI
        $enderecoCTI = $instituicao->endereco ?? 'Rua Engenheiro Luiz Edmundo Carrijo Coube, 14-01 - Vargem Limpa, Bauru - SP';

        // =================================================================================
        // 1. HORÁRIOS DA INSTITUIÇÃO CTI
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO HORÁRIOS DA INSTITUIÇÃO ---');

        // Limpar horários existentes da instituição
        DB::table('horarios_instituicoes')->where('id_inst', $inst_id)->delete();

        // Segunda a Sexta (1-5)
        for ($dia = 1; $dia <= 5; $dia++) {
            // Manhã: 7:15 - 12:15
            DB::table('horarios_instituicoes')->insert([
                'id_inst' => $inst_id,
                'dia_semana' => $dia,
                'hora_inicio' => '07:15:00',
                'hora_fim' => '12:15:00',
                'periodo' => 'manha',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Tarde: 14:00 - 17:15
            DB::table('horarios_instituicoes')->insert([
                'id_inst' => $inst_id,
                'dia_semana' => $dia,
                'hora_inicio' => '14:00:00',
                'hora_fim' => '17:15:00',
                'periodo' => 'tarde',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Noite: 19:00 - 22:00
            DB::table('horarios_instituicoes')->insert([
                'id_inst' => $inst_id,
                'dia_semana' => $dia,
                'hora_inicio' => '19:00:00',
                'hora_fim' => '22:00:00',
                'periodo' => 'noite',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Sábado (6): Só manhã 7:15 - 12:15
        DB::table('horarios_instituicoes')->insert([
            'id_inst' => $inst_id,
            'dia_semana' => 6,
            'hora_inicio' => '07:15:00',
            'hora_fim' => '12:15:00',
            'periodo' => 'manha',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('✓ Horários da instituição criados (Seg-Sex: manhã/tarde/noite, Sáb: manhã)');

        // =================================================================================
        // 2. BUSCAR RESPONSÁVEIS E CRIAR VEÍCULOS
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO VEÍCULOS PARA RESPONSÁVEIS ---');

        $responsaveis = DB::table('responsaveis')
            ->where('id_inst', $inst_id)
            ->where('email', 'LIKE', 'resp%@gmail.com')
            ->orderBy('id')
            ->get();

        if ($responsaveis->isEmpty()) {
            $this->command->warn('⚠ Nenhum responsável encontrado. Execute primeiro AlunosResponsaveisCTISeeder.');
            return;
        }

        $assentos = [4, 4, 3, 2]; // Assentos para cada responsável
        $modelos = ['Honda Civic', 'Toyota Corolla', 'Volkswagen Gol', 'Fiat Uno'];
        $cores = ['Branco', 'Prata', 'Preto', 'Vermelho'];
        $placas = ['ABC-1234', 'DEF-5678', 'GHI-9012', 'JKL-3456'];

        $veiculosCriados = 0;
        foreach ($responsaveis as $index => $responsavel) {
            // Verifica se já tem veículo
            $temVeiculo = DB::table('veiculos')
                ->where('id_resp', $responsavel->id)
                ->exists();

            if (!$temVeiculo) {
                DB::table('veiculos')->insert([
                    'modelo' => $modelos[$index] ?? 'Carro Modelo ' . ($index + 1),
                    'placa' => $placas[$index] ?? 'PLA-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                    'cor' => $cores[$index] ?? 'Branco',
                    'qtde_assentos' => $assentos[$index] ?? 4,
                    'id_resp' => $responsavel->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $veiculosCriados++;
                $this->command->info("✓ Veículo criado para {$responsavel->nome} ({$assentos[$index]} assentos)");
            } else {
                $this->command->warn("⚠ Responsável {$responsavel->nome} já tem veículo");
            }
        }

        $this->command->info("✓ {$veiculosCriados} veículos criados!");

        // =================================================================================
        // 3. HORÁRIOS DOS RESPONSÁVEIS (Dividir entre manhã, tarde, noite)
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO HORÁRIOS DOS RESPONSÁVEIS ---');

        // Limpar horários existentes dos responsáveis
        foreach ($responsaveis as $resp) {
            DB::table('horarios_responsaveis')->where('id_responsavel', $resp->id)->delete();
        }

        // Distribuição dos responsáveis por dia e período
        // Segunda: Resp1 (manhã), Resp2 (tarde), Resp3 (noite), Resp4 (manhã)
        // Terça: Resp1 (tarde), Resp2 (noite), Resp3 (manhã), Resp4 (tarde)
        // E assim por diante...
        
        $distribuicao = [
            // Segunda (1)
            1 => [
                ['resp' => 0, 'periodo' => 'manha', 'hora' => '07:15:00'],
                ['resp' => 1, 'periodo' => 'tarde', 'hora' => '14:00:00'],
                ['resp' => 2, 'periodo' => 'noite', 'hora' => '19:00:00'],
                ['resp' => 3, 'periodo' => 'manha', 'hora' => '07:15:00'],
            ],
            // Terça (2)
            2 => [
                ['resp' => 0, 'periodo' => 'tarde', 'hora' => '14:00:00'],
                ['resp' => 1, 'periodo' => 'noite', 'hora' => '19:00:00'],
                ['resp' => 2, 'periodo' => 'manha', 'hora' => '07:15:00'],
                ['resp' => 3, 'periodo' => 'tarde', 'hora' => '14:00:00'],
            ],
            // Quarta (3)
            3 => [
                ['resp' => 0, 'periodo' => 'noite', 'hora' => '19:00:00'],
                ['resp' => 1, 'periodo' => 'manha', 'hora' => '07:15:00'],
                ['resp' => 2, 'periodo' => 'tarde', 'hora' => '14:00:00'],
                ['resp' => 3, 'periodo' => 'noite', 'hora' => '19:00:00'],
            ],
            // Quinta (4)
            4 => [
                ['resp' => 0, 'periodo' => 'manha', 'hora' => '07:15:00'],
                ['resp' => 1, 'periodo' => 'tarde', 'hora' => '14:00:00'],
                ['resp' => 2, 'periodo' => 'noite', 'hora' => '19:00:00'],
                ['resp' => 3, 'periodo' => 'manha', 'hora' => '07:15:00'],
            ],
            // Sexta (5)
            5 => [
                ['resp' => 0, 'periodo' => 'tarde', 'hora' => '14:00:00'],
                ['resp' => 1, 'periodo' => 'noite', 'hora' => '19:00:00'],
                ['resp' => 2, 'periodo' => 'manha', 'hora' => '07:15:00'],
                ['resp' => 3, 'periodo' => 'tarde', 'hora' => '14:00:00'],
            ],
            // Sábado (6) - Só manhã
            6 => [
                ['resp' => 0, 'periodo' => 'manha', 'hora' => '07:15:00'],
                ['resp' => 1, 'periodo' => 'manha', 'hora' => '07:15:00'],
            ],
        ];

        $horariosRespCriados = 0;
        foreach ($distribuicao as $dia => $configs) {
            foreach ($configs as $config) {
                if (isset($responsaveis[$config['resp']])) {
                    $resp = $responsaveis[$config['resp']];
                    
                    // Criar entrada e saída baseado no período
                    $horaEntrada = $config['hora'];
                    $horaSaida = '12:15:00'; // padrão
                    if ($config['periodo'] === 'manha') {
                        $horaSaida = '12:15:00';
                    } elseif ($config['periodo'] === 'tarde') {
                        $horaSaida = '17:15:00';
                    } elseif ($config['periodo'] === 'noite') {
                        $horaSaida = '22:00:00';
                    }

                    // Entrada
                    DB::table('horarios_responsaveis')->insert([
                        'id_responsavel' => $resp->id,
                        'dia_semana' => $dia,
                        'tipo' => 'entrada',
                        'hora' => $horaEntrada,
                        'habilitado' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Saída
                    DB::table('horarios_responsaveis')->insert([
                        'id_responsavel' => $resp->id,
                        'dia_semana' => $dia,
                        'tipo' => 'saida',
                        'hora' => $horaSaida,
                        'habilitado' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $horariosRespCriados += 2;
                }
            }
        }

        $this->command->info("✓ {$horariosRespCriados} horários de responsáveis criados!");

        // =================================================================================
        // 4. HORÁRIOS DOS ALUNOS (Variar entre manhã, tarde, noite)
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO HORÁRIOS DOS ALUNOS ---');

        $alunos = DB::table('alunos')
            ->where('id_inst', $inst_id)
            ->where('email', 'LIKE', 'aluno%@gmail.com')
            ->orderBy('id')
            ->get();

        if ($alunos->isEmpty()) {
            $this->command->warn('⚠ Nenhum aluno encontrado. Execute primeiro AlunosResponsaveisCTISeeder.');
            return;
        }

        // Limpar horários existentes dos alunos
        foreach ($alunos as $aluno) {
            DB::table('horarios_alunos')->where('id_aluno', $aluno->id)->delete();
        }

        // Distribuição: alguns sempre manhã, outros tarde, outros noite
        // Varia por dia da semana
        $distribuicaoAlunos = [
            // Alunos 1-3: Sempre manhã
            // Alunos 4-6: Sempre tarde
            // Alunos 7-9: Sempre noite
            // Aluno 10: Varia
        ];

        $horariosAlunosCriados = 0;
        foreach ($alunos as $index => $aluno) {
            // Determinar período baseado no índice
            if ($index < 3) {
                $periodo = 'manha';   // Alunos 1-3: manhã
            } elseif ($index < 6) {
                $periodo = 'tarde';   // Alunos 4-6: tarde
            } elseif ($index < 9) {
                $periodo = 'noite';   // Alunos 7-9: noite
            } else {
                // Aluno 10: varia
                $periodo = ($index % 3 == 0) ? 'manha' : (($index % 3 == 1) ? 'tarde' : 'noite');
            }

            // Para cada dia da semana (Segunda a Sexta)
            for ($dia = 1; $dia <= 5; $dia++) {
                if ($periodo === 'manha') {
                    $horaEntrada = '07:15:00';
                    $horaSaida = '12:15:00';
                } elseif ($periodo === 'tarde') {
                    $horaEntrada = '14:00:00';
                    $horaSaida = '17:15:00';
                } elseif ($periodo === 'noite') {
                    $horaEntrada = '19:00:00';
                    $horaSaida = '22:00:00';
                } else {
                    $horaEntrada = '07:15:00';
                    $horaSaida = '12:15:00';
                }

                // Entrada
                DB::table('horarios_alunos')->insert([
                    'id_aluno' => $aluno->id,
                    'dia_semana' => $dia,
                    'tipo' => 'entrada',
                    'hora' => $horaEntrada,
                    'habilitado' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Saída
                DB::table('horarios_alunos')->insert([
                    'id_aluno' => $aluno->id,
                    'dia_semana' => $dia,
                    'tipo' => 'saida',
                    'hora' => $horaSaida,
                    'habilitado' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $horariosAlunosCriados += 2;
            }

            // Sábado: só manhã para todos
            DB::table('horarios_alunos')->insert([
                'id_aluno' => $aluno->id,
                'dia_semana' => 6,
                'tipo' => 'entrada',
                'hora' => '07:15:00',
                'habilitado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('horarios_alunos')->insert([
                'id_aluno' => $aluno->id,
                'dia_semana' => 6,
                'tipo' => 'saida',
                'hora' => '12:15:00',
                'habilitado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $horariosAlunosCriados += 2;
        }

        $this->command->info("✓ {$horariosAlunosCriados} horários de alunos criados!");

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('DADOS CRIADOS COM SUCESSO!');
        $this->command->info('========================================');
        $this->command->info('✓ Horários da instituição');
        $this->command->info('✓ Veículos para responsáveis');
        $this->command->info('✓ Horários dos responsáveis (distribuídos)');
        $this->command->info('✓ Horários dos alunos (variados)');
        $this->command->info('========================================');
    }
}

