<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SeederCompletoCTI extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Este seeder cria TODOS os dados necessários para o sistema:
     * - Instituição CTI
     * - Administrador
     * - 5 Responsáveis
     * - 10 Alunos
     * - Horários da instituição
     * - Veículos para responsáveis
     * - Horários dos responsáveis
     * - Horários dos alunos
     * - Caronas para todos os dias
     */
    public function run(): void
    {
        $this->command->info('========================================');
        $this->command->info('SEEDER COMPLETO - CTI UNESP');
        $this->command->info('========================================');

        // Hash bcrypt para "12345"
        $senha_hash = '$2y$10$U.rTTNJd/j28wcG1T0BbKOOnv/Oq9GgltJfMQqzOW0vz42.a9nxKG';

        // =================================================================================
        // 1. CRIAR INSTITUIÇÃO CTI
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO INSTITUIÇÃO CTI ---');

        $instituicao = DB::table('instituicoes')
            ->where('email', 'cti@unesp.br')
            ->first();

        if (!$instituicao) {
            $inst_id = DB::table('instituicoes')->insertGetId([
                'nome' => 'Colégio Técnico Industrial - UNESP',
                'email' => 'cti@unesp.br',
                'endereco' => 'Rua Engenheiro Luiz Edmundo Carrijo Coube, 14-01 - Vargem Limpa, Bauru - SP',
                'cnpj' => '48.031.918/0001-24',
                'telefone' => '1431036000',
                'plano' => 'B',
                'imagem' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Criar usuário da instituição
            $usuarioInstId = DB::table('usuarios')->insertGetId([
                'login' => 'cti@unesp.br',
                'email' => 'cti@unesp.br',
                'senha' => $senha_hash,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Associar perfil de instituição
            DB::table('perfil_usuario')->insert([
                'perfil_id' => 2, // perfil 'inst'
                'usuario_id' => $usuarioInstId,
                'instituicao_id' => $inst_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->command->info("✓ Instituição CTI criada (ID: {$inst_id})");
        } else {
            $inst_id = $instituicao->id;
            $this->command->info("✓ Instituição CTI já existe (ID: {$inst_id})");
        }

        // =================================================================================
        // 2. CRIAR ADMINISTRADOR
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO ADMINISTRADOR ---');

        $adminExiste = DB::table('usuarios')->where('email', 'admin@unesp.br')->exists();
        
        if (!$adminExiste) {
            $adminUserId = DB::table('usuarios')->insertGetId([
                'login' => 'admin@unesp.br',
                'email' => 'admin@unesp.br',
                'senha' => $senha_hash,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('perfil_usuario')->insert([
                'perfil_id' => 1, // perfil 'adm'
                'usuario_id' => $adminUserId,
                'instituicao_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->command->info("✓ Administrador criado (admin@unesp.br)");
        } else {
            $this->command->info("✓ Administrador já existe");
        }

        // =================================================================================
        // 3. CRIAR 5 RESPONSÁVEIS
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO 5 RESPONSÁVEIS ---');

        // CEPs: antigos (4) + novos (5) = 9 CEPs, mas só precisamos de 5
        $responsaveis = [
            [
                'nome' => 'Responsável Um',
                'cpf' => '111.111.111-11',
                'email' => 'resp1@unesp.br',
                'telefone' => '14998887777',
                'genero' => 'Masculino',
                'endereco' => 'Rua das Palmeiras, 100 - Vila Cardia, Bauru - SP, 17064-854',
            ],
            [
                'nome' => 'Responsável Dois',
                'cpf' => '222.222.222-22',
                'email' => 'resp2@unesp.br',
                'telefone' => '14998887778',
                'genero' => 'Feminino',
                'endereco' => 'Avenida Paulista, 200 - Vila Cardia, Bauru - SP, 17018-825',
            ],
            [
                'nome' => 'Responsável Três',
                'cpf' => '333.333.333-33',
                'email' => 'resp3@unesp.br',
                'telefone' => '14998887779',
                'genero' => 'Masculino',
                'endereco' => 'Rua das Azaleias, 300 - Vila Cardia, Bauru - SP, 17054-080',
            ],
            [
                'nome' => 'Responsável Quatro',
                'cpf' => '444.444.444-44',
                'email' => 'resp4@unesp.br',
                'telefone' => '14998887780',
                'genero' => 'Feminino',
                'endereco' => 'Rua das Camélias, 400 - Vila Cardia, Bauru - SP, 17033-821',
            ],
            [
                'nome' => 'Responsável Cinco',
                'cpf' => '555.555.555-55',
                'email' => 'resp5@unesp.br',
                'telefone' => '14998887781',
                'genero' => 'Masculino',
                'endereco' => 'Rua Nova, 500 - Vila Cardia, Bauru - SP, 17065-380', // Novo CEP
            ],
        ];

        $responsaveisIds = [];
        foreach ($responsaveis as $index => $resp) {
            $existe = DB::table('responsaveis')->where('email', $resp['email'])->exists();
            
            if (!$existe) {
                $usuarioId = DB::table('usuarios')->insertGetId([
                    'login' => $resp['email'],
                    'email' => $resp['email'],
                    'senha' => $senha_hash,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $respId = DB::table('responsaveis')->insertGetId([
                    'nome' => $resp['nome'],
                    'cpf' => $resp['cpf'],
                    'email' => $resp['email'],
                    'telefone' => $resp['telefone'],
                    'genero' => $resp['genero'],
                    'endereco' => $resp['endereco'],
                    'imagem' => null,
                    'id_inst' => $inst_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('perfil_usuario')->insert([
                    'perfil_id' => 3, // perfil 'resp'
                    'usuario_id' => $usuarioId,
                    'instituicao_id' => $inst_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $responsaveisIds[] = $respId;
                $this->command->info("✓ Responsável " . ($index + 1) . " criado: {$resp['nome']}");
            } else {
                $respExistente = DB::table('responsaveis')->where('email', $resp['email'])->first();
                $responsaveisIds[] = $respExistente->id;
                $this->command->warn("⚠ Responsável " . ($index + 1) . " já existe: {$resp['email']}");
            }
        }

        // =================================================================================
        // 4. CRIAR 10 ALUNOS
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO 10 ALUNOS ---');

        // CEPs: antigos (10) + novos (5) = 15 CEPs disponíveis
        $alunos = [
            ['nome' => 'Aluno Um', 'cpf' => '111.111.111-11', 'ra' => '2357001', 'email' => 'aluno1@unesp.br', 'genero' => 'Masculino', 'endereco' => 'Rua das Acácias, 100 - Vila Cardia, Bauru - SP, 17067-130', 'telefone' => '14991234567'],
            ['nome' => 'Aluno Dois', 'cpf' => '222.222.222-22', 'ra' => '2357002', 'email' => 'aluno2@unesp.br', 'genero' => 'Feminino', 'endereco' => 'Avenida Nações Unidas, 200 - Vila Cardia, Bauru - SP, 17025-774', 'telefone' => '14991234568'],
            ['nome' => 'Aluno Três', 'cpf' => '333.333.333-33', 'ra' => '2357003', 'email' => 'aluno3@unesp.br', 'genero' => 'Masculino', 'endereco' => 'Rua dos Ipês, 300 - Vila Cardia, Bauru - SP, 17022-899', 'telefone' => '14991234569'],
            ['nome' => 'Aluno Quatro', 'cpf' => '444.444.444-44', 'ra' => '2357004', 'email' => 'aluno4@unesp.br', 'genero' => 'Feminino', 'endereco' => 'Rua das Rosas, 400 - Vila Cardia, Bauru - SP, 17054-580', 'telefone' => '14991234570'],
            ['nome' => 'Aluno Cinco', 'cpf' => '555.555.555-55', 'ra' => '2357005', 'email' => 'aluno5@unesp.br', 'genero' => 'Masculino', 'endereco' => 'Avenida Duque de Caxias, 500 - Vila Cardia, Bauru - SP, 17025-164', 'telefone' => '14991234571'],
            ['nome' => 'Aluno Seis', 'cpf' => '666.666.666-66', 'ra' => '2357006', 'email' => 'aluno6@unesp.br', 'genero' => 'Feminino', 'endereco' => 'Rua das Margaridas, 600 - Vila Cardia, Bauru - SP, 17021-869', 'telefone' => '14991234572'],
            ['nome' => 'Aluno Sete', 'cpf' => '777.777.777-77', 'ra' => '2357007', 'email' => 'aluno7@unesp.br', 'genero' => 'Masculino', 'endereco' => 'Rua das Violetas, 700 - Vila Cardia, Bauru - SP, 17066-140', 'telefone' => '14991234573'],
            ['nome' => 'Aluno Oito', 'cpf' => '888.888.888-88', 'ra' => '2357008', 'email' => 'aluno8@unesp.br', 'genero' => 'Feminino', 'endereco' => 'Avenida Getúlio Vargas, 800 - Vila Cardia, Bauru - SP, 17020-460', 'telefone' => '14991234574'],
            ['nome' => 'Aluno Nove', 'cpf' => '999.999.999-99', 'ra' => '2357009', 'email' => 'aluno9@unesp.br', 'genero' => 'Masculino', 'endereco' => 'Rua das Orquídeas, 900 - Vila Cardia, Bauru - SP, 17037-520', 'telefone' => '14991234575'],
            ['nome' => 'Aluno Dez', 'cpf' => '000.000.000-00', 'ra' => '2357010', 'email' => 'aluno10@unesp.br', 'genero' => 'Feminino', 'endereco' => 'Rua das Tulipas, 1000 - Vila Cardia, Bauru - SP, 17027-420', 'telefone' => '14991234576'],
        ];

        $alunosIds = [];
        foreach ($alunos as $index => $aluno) {
            $existe = DB::table('alunos')->where('email', $aluno['email'])->exists();
            
            if (!$existe) {
                $usuarioId = DB::table('usuarios')->insertGetId([
                    'login' => $aluno['email'],
                    'email' => $aluno['email'],
                    'senha' => $senha_hash,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $alunoId = DB::table('alunos')->insertGetId([
                    'nome' => $aluno['nome'],
                    'cpf' => $aluno['cpf'],
                    'ra' => $aluno['ra'],
                    'email' => $aluno['email'],
                    'genero' => $aluno['genero'],
                    'endereco' => $aluno['endereco'],
                    'telefone' => $aluno['telefone'],
                    'imagem' => null,
                    'id_inst' => $inst_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('perfil_usuario')->insert([
                    'perfil_id' => 4, // perfil 'alun'
                    'usuario_id' => $usuarioId,
                    'instituicao_id' => $inst_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $alunosIds[] = $alunoId;
                $this->command->info("✓ Aluno " . ($index + 1) . " criado: {$aluno['nome']}");
            } else {
                $alunoExistente = DB::table('alunos')->where('email', $aluno['email'])->first();
                $alunosIds[] = $alunoExistente->id;
                $this->command->warn("⚠ Aluno " . ($index + 1) . " já existe: {$aluno['email']}");
            }
        }

        // Buscar IDs reais dos responsáveis e alunos (caso já existam)
        if (empty($responsaveisIds)) {
            $responsaveisIds = DB::table('responsaveis')
                ->where('id_inst', $inst_id)
                ->where('email', 'LIKE', 'resp%@unesp.br')
                ->orderBy('id')
                ->pluck('id')
                ->toArray();
        }

        if (empty($alunosIds)) {
            $alunosIds = DB::table('alunos')
                ->where('id_inst', $inst_id)
                ->where('email', 'LIKE', 'aluno%@unesp.br')
                ->orderBy('id')
                ->pluck('id')
                ->toArray();
        }

        // =================================================================================
        // 5. HORÁRIOS DA INSTITUIÇÃO
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO HORÁRIOS DA INSTITUIÇÃO ---');

        DB::table('horarios_instituicoes')->where('id_inst', $inst_id)->delete();

        // Segunda a Sexta (1-5): Manhã, Tarde, Noite
        for ($dia = 1; $dia <= 5; $dia++) {
            DB::table('horarios_instituicoes')->insert([
                ['id_inst' => $inst_id, 'dia_semana' => $dia, 'hora_inicio' => '07:15:00', 'hora_fim' => '12:15:00', 'periodo' => 'manha', 'created_at' => now(), 'updated_at' => now()],
                ['id_inst' => $inst_id, 'dia_semana' => $dia, 'hora_inicio' => '14:00:00', 'hora_fim' => '17:15:00', 'periodo' => 'tarde', 'created_at' => now(), 'updated_at' => now()],
                ['id_inst' => $inst_id, 'dia_semana' => $dia, 'hora_inicio' => '19:00:00', 'hora_fim' => '22:00:00', 'periodo' => 'noite', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // Sábado (6): Só manhã
        DB::table('horarios_instituicoes')->insert([
            'id_inst' => $inst_id,
            'dia_semana' => 6,
            'hora_inicio' => '07:15:00',
            'hora_fim' => '12:15:00',
            'periodo' => 'manha',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('✓ Horários da instituição criados');

        // =================================================================================
        // 6. VEÍCULOS PARA RESPONSÁVEIS
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO VEÍCULOS ---');

        $assentos = [4, 4, 3, 2, 4]; // 5 responsáveis
        $modelos = ['Honda Civic', 'Toyota Corolla', 'Volkswagen Gol', 'Fiat Uno', 'Chevrolet Onix'];
        $cores = ['Branco', 'Prata', 'Preto', 'Vermelho', 'Azul'];
        $placas = ['ABC-1234', 'DEF-5678', 'GHI-9012', 'JKL-3456', 'MNO-7890'];

        foreach ($responsaveisIds as $index => $respId) {
            $temVeiculo = DB::table('veiculos')->where('id_resp', $respId)->exists();
            
            if (!$temVeiculo) {
                DB::table('veiculos')->insert([
                    'modelo' => $modelos[$index] ?? 'Carro Modelo ' . ($index + 1),
                    'placa' => $placas[$index] ?? 'PLA-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                    'cor' => $cores[$index] ?? 'Branco',
                    'qtde_assentos' => $assentos[$index] ?? 4,
                    'id_resp' => $respId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $this->command->info("✓ Veículo criado para responsável " . ($index + 1) . " ({$assentos[$index]} assentos)");
            }
        }

        // =================================================================================
        // 7. HORÁRIOS DOS RESPONSÁVEIS (Distribuir entre manhã, tarde, noite)
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO HORÁRIOS DOS RESPONSÁVEIS ---');

        // Limpar horários existentes
        foreach ($responsaveisIds as $respId) {
            DB::table('horarios_responsaveis')->where('id_responsavel', $respId)->delete();
        }

        // Distribuição: máximo 2 responsáveis por período por dia
        $distribuicao = [
            1 => [['resp' => 0, 'periodo' => 'manha'], ['resp' => 1, 'periodo' => 'tarde'], ['resp' => 2, 'periodo' => 'noite'], ['resp' => 3, 'periodo' => 'manha'], ['resp' => 4, 'periodo' => 'tarde']],
            2 => [['resp' => 0, 'periodo' => 'tarde'], ['resp' => 1, 'periodo' => 'noite'], ['resp' => 2, 'periodo' => 'manha'], ['resp' => 3, 'periodo' => 'tarde'], ['resp' => 4, 'periodo' => 'noite']],
            3 => [['resp' => 0, 'periodo' => 'noite'], ['resp' => 1, 'periodo' => 'manha'], ['resp' => 2, 'periodo' => 'tarde'], ['resp' => 3, 'periodo' => 'noite'], ['resp' => 4, 'periodo' => 'manha']],
            4 => [['resp' => 0, 'periodo' => 'manha'], ['resp' => 1, 'periodo' => 'tarde'], ['resp' => 2, 'periodo' => 'noite'], ['resp' => 3, 'periodo' => 'manha'], ['resp' => 4, 'periodo' => 'tarde']],
            5 => [['resp' => 0, 'periodo' => 'tarde'], ['resp' => 1, 'periodo' => 'noite'], ['resp' => 2, 'periodo' => 'manha'], ['resp' => 3, 'periodo' => 'tarde'], ['resp' => 4, 'periodo' => 'noite']],
            6 => [['resp' => 0, 'periodo' => 'manha'], ['resp' => 1, 'periodo' => 'manha'], ['resp' => 2, 'periodo' => 'manha'], ['resp' => 3, 'periodo' => 'manha'], ['resp' => 4, 'periodo' => 'manha']], // Sábado só manhã
        ];

        $horariosRespCriados = 0;
        foreach ($distribuicao as $dia => $configs) {
            foreach ($configs as $config) {
                if (isset($responsaveisIds[$config['resp']])) {
                    $respId = $responsaveisIds[$config['resp']];
                    
                    $horaEntrada = $config['periodo'] === 'manha' ? '07:15:00' : ($config['periodo'] === 'tarde' ? '14:00:00' : '19:00:00');
                    $horaSaida = $config['periodo'] === 'manha' ? '12:15:00' : ($config['periodo'] === 'tarde' ? '17:15:00' : '22:00:00');

                    DB::table('horarios_responsaveis')->insert([
                        ['id_responsavel' => $respId, 'dia_semana' => $dia, 'tipo' => 'entrada', 'hora' => $horaEntrada, 'habilitado' => true, 'created_at' => now(), 'updated_at' => now()],
                        ['id_responsavel' => $respId, 'dia_semana' => $dia, 'tipo' => 'saida', 'hora' => $horaSaida, 'habilitado' => true, 'created_at' => now(), 'updated_at' => now()],
                    ]);

                    $horariosRespCriados += 2;
                }
            }
        }

        $this->command->info("✓ {$horariosRespCriados} horários de responsáveis criados");

        // =================================================================================
        // 8. HORÁRIOS DOS ALUNOS (Variar entre manhã, tarde, noite)
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO HORÁRIOS DOS ALUNOS ---');

        // Limpar horários existentes
        foreach ($alunosIds as $alunoId) {
            DB::table('horarios_alunos')->where('id_aluno', $alunoId)->delete();
        }

        $horariosAlunosCriados = 0;
        foreach ($alunosIds as $index => $alunoId) {
            // Alunos 1-3: manhã, 4-6: tarde, 7-9: noite, 10: varia
            if ($index < 3) {
                $periodo = 'manha';
            } elseif ($index < 6) {
                $periodo = 'tarde';
            } elseif ($index < 9) {
                $periodo = 'noite';
            } else {
                $periodo = ($index % 3 == 0) ? 'manha' : (($index % 3 == 1) ? 'tarde' : 'noite');
            }

            // Segunda a Sexta
            for ($dia = 1; $dia <= 5; $dia++) {
                $horaEntrada = $periodo === 'manha' ? '07:15:00' : ($periodo === 'tarde' ? '14:00:00' : '19:00:00');
                $horaSaida = $periodo === 'manha' ? '12:15:00' : ($periodo === 'tarde' ? '17:15:00' : '22:00:00');

                DB::table('horarios_alunos')->insert([
                    ['id_aluno' => $alunoId, 'dia_semana' => $dia, 'tipo' => 'entrada', 'hora' => $horaEntrada, 'habilitado' => true, 'created_at' => now(), 'updated_at' => now()],
                    ['id_aluno' => $alunoId, 'dia_semana' => $dia, 'tipo' => 'saida', 'hora' => $horaSaida, 'habilitado' => true, 'created_at' => now(), 'updated_at' => now()],
                ]);

                $horariosAlunosCriados += 2;
            }

            // Sábado: só manhã
            DB::table('horarios_alunos')->insert([
                ['id_aluno' => $alunoId, 'dia_semana' => 6, 'tipo' => 'entrada', 'hora' => '07:15:00', 'habilitado' => true, 'created_at' => now(), 'updated_at' => now()],
                ['id_aluno' => $alunoId, 'dia_semana' => 6, 'tipo' => 'saida', 'hora' => '12:15:00', 'habilitado' => true, 'created_at' => now(), 'updated_at' => now()],
            ]);

            $horariosAlunosCriados += 2;
        }

        $this->command->info("✓ {$horariosAlunosCriados} horários de alunos criados");

        // =================================================================================
        // 9. CRIAR CARONAS PARA TODOS OS DIAS
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO CARONAS ---');

        // Limpar caronas existentes
        DB::table('caronas')->whereIn('id_aluno', $alunosIds)->delete();
        DB::table('caronas')->whereIn('id_responsavel', $responsaveisIds)->delete();

        $caronasCriadas = 0;
        
        // Criar caronas aceitas para todos os dias e períodos
        // Distribuir alunos entre responsáveis de forma equilibrada
        foreach ([1, 2, 3, 4, 5, 6] as $dia) {
            // Manhã: 2 responsáveis, 4 alunos
            if ($dia <= 5) { // Segunda a Sexta
                // Manhã
                $respManha = array_slice($responsaveisIds, 0, 2);
                $alunosManha = array_slice($alunosIds, 0, 4);
                foreach ($respManha as $respIndex => $respId) {
                    $alunosParaResp = array_slice($alunosManha, $respIndex * 2, 2);
                    foreach ($alunosParaResp as $alunoId) {
                        DB::table('caronas')->insert([
                            'id_aluno' => $alunoId,
                            'id_responsavel' => $respId,
                            'dia_semana' => $dia,
                            'tipo' => 'entrada',
                            'hora' => '07:15:00',
                            'status' => 'aceita',
                            'distancia_km' => 5.0,
                            'data_solicitacao' => now(),
                            'data_aceitacao' => now(),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        $caronasCriadas++;
                    }
                }

                // Tarde: 2 responsáveis, 3 alunos
                $respTarde = array_slice($responsaveisIds, 2, 2);
                $alunosTarde = array_slice($alunosIds, 4, 3);
                foreach ($respTarde as $respIndex => $respId) {
                    $alunosParaResp = array_slice($alunosTarde, $respIndex * 1, 1);
                    if (!empty($alunosParaResp)) {
                        foreach ($alunosParaResp as $alunoId) {
                            DB::table('caronas')->insert([
                                'id_aluno' => $alunoId,
                                'id_responsavel' => $respId,
                                'dia_semana' => $dia,
                                'tipo' => 'entrada',
                                'hora' => '14:00:00',
                                'status' => 'aceita',
                                'distancia_km' => 5.0,
                                'data_solicitacao' => now(),
                                'data_aceitacao' => now(),
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                            $caronasCriadas++;
                        }
                    }
                }

                // Noite: 1 responsável, 3 alunos
                $respNoite = [$responsaveisIds[4]];
                $alunosNoite = array_slice($alunosIds, 7, 3);
                foreach ($respNoite as $respId) {
                    foreach ($alunosNoite as $alunoId) {
                        DB::table('caronas')->insert([
                            'id_aluno' => $alunoId,
                            'id_responsavel' => $respId,
                            'dia_semana' => $dia,
                            'tipo' => 'entrada',
                            'hora' => '19:00:00',
                            'status' => 'aceita',
                            'distancia_km' => 5.0,
                            'data_solicitacao' => now(),
                            'data_aceitacao' => now(),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        $caronasCriadas++;
                    }
                }
            } else { // Sábado: só manhã
                $respManha = array_slice($responsaveisIds, 0, 3);
                $alunosManha = array_slice($alunosIds, 0, 10);
                foreach ($respManha as $respIndex => $respId) {
                    $alunosParaResp = array_slice($alunosManha, $respIndex * 3, 3);
                    foreach ($alunosParaResp as $alunoId) {
                        DB::table('caronas')->insert([
                            'id_aluno' => $alunoId,
                            'id_responsavel' => $respId,
                            'dia_semana' => $dia,
                            'tipo' => 'entrada',
                            'hora' => '07:15:00',
                            'status' => 'aceita',
                            'distancia_km' => 5.0,
                            'data_solicitacao' => now(),
                            'data_aceitacao' => now(),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        $caronasCriadas++;
                    }
                }
            }
        }

        $this->command->info("✓ {$caronasCriadas} caronas criadas");

        // =================================================================================
        // RESUMO FINAL
        // =================================================================================
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('SEEDER CONCLUÍDO COM SUCESSO!');
        $this->command->info('========================================');
        $this->command->info('✓ Instituição: cti@unesp.br');
        $this->command->info('✓ Administrador: admin@unesp.br');
        $this->command->info('✓ 5 Responsáveis: resp1@unesp.br até resp5@unesp.br');
        $this->command->info('✓ 10 Alunos: aluno1@unesp.br até aluno10@unesp.br');
        $this->command->info('✓ Horários da instituição');
        $this->command->info('✓ Veículos para responsáveis');
        $this->command->info('✓ Horários dos responsáveis');
        $this->command->info('✓ Horários dos alunos');
        $this->command->info('✓ Caronas para todos os dias');
        $this->command->info('');
        $this->command->info('Senha para TODOS: 12345');
        $this->command->info('========================================');
    }
}

