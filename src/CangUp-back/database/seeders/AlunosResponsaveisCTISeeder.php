<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlunosResponsaveisCTISeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('========================================');
        $this->command->info('CRIANDO ALUNOS E RESPONSÁVEIS PARA CTI');
        $this->command->info('========================================');

        // Buscar ID da instituição CTI
        $instituicao = DB::table('instituicoes')
            ->where('email', 'cti.unesp@exemplo.com')
            ->first();

        if (!$instituicao) {
            $this->command->error('❌ Instituição CTI não encontrada! Execute primeiro o SCRIPT_SQL_DADOS_TESTE.sql');
            return;
        }

        $inst_id = $instituicao->id;
        // Hash bcrypt para "12345" (mesmo usado no script SQL)
        $senha_hash = '$2y$10$U.rTTNJd/j28wcG1T0BbKOOnv/Oq9GgltJfMQqzOW0vz42.a9nxKG';

        $this->command->info("✓ Instituição CTI encontrada (ID: {$inst_id})");

        // =================================================================================
        // CRIAR 10 ALUNOS
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO 10 ALUNOS ---');

        $alunos = [
            [
                'nome' => 'Aluno Um',
                'cpf' => '111.111.111-11',
                'ra' => '2357001',
                'email' => 'aluno1@gmail.com',
                'genero' => 'Masculino',
                'endereco' => 'Rua das Acácias, 100 - Vila Cardia, Bauru - SP, 17067-130',
                'telefone' => '14991234567',
                'cep' => '17067-130',
            ],
            [
                'nome' => 'Aluno Dois',
                'cpf' => '222.222.222-22',
                'ra' => '2357002',
                'email' => 'aluno2@gmail.com',
                'genero' => 'Feminino',
                'endereco' => 'Avenida Nações Unidas, 200 - Vila Cardia, Bauru - SP, 17025-774',
                'telefone' => '14991234568',
                'cep' => '17025-774',
            ],
            [
                'nome' => 'Aluno Três',
                'cpf' => '333.333.333-33',
                'ra' => '2357003',
                'email' => 'aluno3@gmail.com',
                'genero' => 'Masculino',
                'endereco' => 'Rua dos Ipês, 300 - Vila Cardia, Bauru - SP, 17022-899',
                'telefone' => '14991234569',
                'cep' => '17022-899',
            ],
            [
                'nome' => 'Aluno Quatro',
                'cpf' => '444.444.444-44',
                'ra' => '2357004',
                'email' => 'aluno4@gmail.com',
                'genero' => 'Feminino',
                'endereco' => 'Rua das Rosas, 400 - Vila Cardia, Bauru - SP, 17054-580',
                'telefone' => '14991234570',
                'cep' => '17054-580',
            ],
            [
                'nome' => 'Aluno Cinco',
                'cpf' => '555.555.555-55',
                'ra' => '2357005',
                'email' => 'aluno5@gmail.com',
                'genero' => 'Masculino',
                'endereco' => 'Avenida Duque de Caxias, 500 - Vila Cardia, Bauru - SP, 17025-164',
                'telefone' => '14991234571',
                'cep' => '17025-164',
            ],
            [
                'nome' => 'Aluno Seis',
                'cpf' => '666.666.666-66',
                'ra' => '2357006',
                'email' => 'aluno6@gmail.com',
                'genero' => 'Feminino',
                'endereco' => 'Rua das Margaridas, 600 - Vila Cardia, Bauru - SP, 17021-869',
                'telefone' => '14991234572',
                'cep' => '17021-869',
            ],
            [
                'nome' => 'Aluno Sete',
                'cpf' => '777.777.777-77',
                'ra' => '2357007',
                'email' => 'aluno7@gmail.com',
                'genero' => 'Masculino',
                'endereco' => 'Rua das Violetas, 700 - Vila Cardia, Bauru - SP, 17066-140',
                'telefone' => '14991234573',
                'cep' => '17066-140',
            ],
            [
                'nome' => 'Aluno Oito',
                'cpf' => '888.888.888-88',
                'ra' => '2357008',
                'email' => 'aluno8@gmail.com',
                'genero' => 'Feminino',
                'endereco' => 'Avenida Getúlio Vargas, 800 - Vila Cardia, Bauru - SP, 17020-460',
                'telefone' => '14991234574',
                'cep' => '17020-460',
            ],
            [
                'nome' => 'Aluno Nove',
                'cpf' => '999.999.999-99',
                'ra' => '2357009',
                'email' => 'aluno9@gmail.com',
                'genero' => 'Masculino',
                'endereco' => 'Rua das Orquídeas, 900 - Vila Cardia, Bauru - SP, 17037-520',
                'telefone' => '14991234575',
                'cep' => '17037-520',
            ],
            [
                'nome' => 'Aluno Dez',
                'cpf' => '000.000.000-00',
                'ra' => '2357010',
                'email' => 'aluno10@gmail.com',
                'genero' => 'Feminino',
                'endereco' => 'Rua das Tulipas, 1000 - Vila Cardia, Bauru - SP, 17027-420',
                'telefone' => '14991234576',
                'cep' => '17027-420',
            ],
        ];

        $alunosCriados = 0;
        foreach ($alunos as $aluno) {
            // Verifica se já existe
            $existe = DB::table('alunos')->where('email', $aluno['email'])->exists();
            
            if (!$existe) {
                // Criar usuário
                $usuarioId = DB::table('usuarios')->insertGetId([
                    'login' => $aluno['email'],
                    'email' => $aluno['email'],
                    'senha' => $senha_hash,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Criar aluno
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

                // Associar perfil de aluno
                DB::table('perfil_usuario')->insert([
                    'perfil_id' => 4, // perfil 'alun'
                    'usuario_id' => $usuarioId,
                    'instituicao_id' => $inst_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $alunosCriados++;
                $this->command->info("✓ Aluno criado: {$aluno['nome']} ({$aluno['email']})");
            } else {
                $this->command->warn("⚠ Aluno já existe: {$aluno['email']}");
            }
        }

        $this->command->info("✓ {$alunosCriados} alunos criados!");

        // =================================================================================
        // CRIAR 4 RESPONSÁVEIS
        // =================================================================================
        $this->command->info('');
        $this->command->info('--- CRIANDO 4 RESPONSÁVEIS ---');

        $responsaveis = [
            [
                'nome' => 'Responsável Um',
                'cpf' => '111.111.111-11',
                'email' => 'resp1@gmail.com',
                'telefone' => '14998887777',
                'genero' => 'Masculino',
                'endereco' => 'Rua das Palmeiras, 100 - Vila Cardia, Bauru - SP, 17064-854',
                'cep' => '17064-854',
            ],
            [
                'nome' => 'Responsável Dois',
                'cpf' => '222.222.222-22',
                'email' => 'resp2@gmail.com',
                'telefone' => '14998887778',
                'genero' => 'Feminino',
                'endereco' => 'Avenida Paulista, 200 - Vila Cardia, Bauru - SP, 17018-825',
                'cep' => '17018-825',
            ],
            [
                'nome' => 'Responsável Três',
                'cpf' => '333.333.333-33',
                'email' => 'resp3@gmail.com',
                'telefone' => '14998887779',
                'genero' => 'Masculino',
                'endereco' => 'Rua das Azaleias, 300 - Vila Cardia, Bauru - SP, 17054-080',
                'cep' => '17054-080',
            ],
            [
                'nome' => 'Responsável Quatro',
                'cpf' => '444.444.444-44',
                'email' => 'resp4@gmail.com',
                'telefone' => '14998887780',
                'genero' => 'Feminino',
                'endereco' => 'Rua das Camélias, 400 - Vila Cardia, Bauru - SP, 17033-821',
                'cep' => '17033-821',
            ],
        ];

        $responsaveisCriados = 0;
        foreach ($responsaveis as $responsavel) {
            // Verifica se já existe
            $existe = DB::table('responsaveis')->where('email', $responsavel['email'])->exists();
            
            if (!$existe) {
                // Criar usuário
                $usuarioId = DB::table('usuarios')->insertGetId([
                    'login' => $responsavel['email'],
                    'email' => $responsavel['email'],
                    'senha' => $senha_hash,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Criar responsável
                $responsavelId = DB::table('responsaveis')->insertGetId([
                    'nome' => $responsavel['nome'],
                    'cpf' => $responsavel['cpf'],
                    'email' => $responsavel['email'],
                    'telefone' => $responsavel['telefone'],
                    'genero' => $responsavel['genero'],
                    'endereco' => $responsavel['endereco'],
                    'imagem' => null,
                    'id_inst' => $inst_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Associar perfil de responsável
                DB::table('perfil_usuario')->insert([
                    'perfil_id' => 3, // perfil 'resp'
                    'usuario_id' => $usuarioId,
                    'instituicao_id' => $inst_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $responsaveisCriados++;
                $this->command->info("✓ Responsável criado: {$responsavel['nome']} ({$responsavel['email']})");
            } else {
                $this->command->warn("⚠ Responsável já existe: {$responsavel['email']}");
            }
        }

        $this->command->info("✓ {$responsaveisCriados} responsáveis criados!");

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('DADOS DE LOGIN PARA TESTES');
        $this->command->info('========================================');
        $this->command->info('Senha para TODOS os usuários: 12345');
        $this->command->info('');
        $this->command->info('ALUNOS (10):');
        $this->command->info('  aluno1@gmail.com até aluno10@gmail.com');
        $this->command->info('  Senha: 12345');
        $this->command->info('  Perfil: alun (aluno)');
        $this->command->info('');
        $this->command->info('RESPONSÁVEIS (4):');
        $this->command->info('  resp1@gmail.com até resp4@gmail.com');
        $this->command->info('  Senha: 12345');
        $this->command->info('  Perfil: resp (responsável)');
        $this->command->info('');
        $this->command->info('TODOS associados à instituição CTI (ID: ' . $inst_id . ')');
        $this->command->info('========================================');
    }
}

