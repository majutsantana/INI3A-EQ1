<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsuariosTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insere todos os usuários do banco antigo (apenas os que não existem)
        $usuarios = [
            [
                'id' => 1,
                'login' => 'arthur',
                'email' => 'arthur@cangup.com',
                'senha' => '$2y$12$ocuQvFKqWYsm4fDj0SRhA.teppQz4g9ZcjVAq76A7nBAB67K7EW62',
                'created_at' => '2025-10-06 14:06:28',
                'updated_at' => '2025-10-06 14:06:28',
            ],
            [
                'id' => 2,
                'login' => 'chloe',
                'email' => 'chloe@cangup.com',
                'senha' => '$2y$12$/HpIk.E/l5fzMnZtieCEMOR/5f7zazPmB6N.GMC7RQa8vISI7cc46',
                'created_at' => '2025-10-06 14:06:29',
                'updated_at' => '2025-10-06 14:06:29',
            ],
            [
                'id' => 3,
                'login' => 'luiza',
                'email' => 'luiza@cangup.com',
                'senha' => '$2y$12$3QqqEivzDvkSSxuB32XxrOMfwvstPB48Jry6406i0lIWIPl.4FBXm',
                'created_at' => '2025-10-06 14:06:29',
                'updated_at' => '2025-10-06 14:06:29',
            ],
            [
                'id' => 4,
                'login' => 'mariajulia',
                'email' => 'mariajulia@cangup.com',
                'senha' => '$2y$12$a8J1hdssYqR4sh4KivBR/.Hts/xc9UlAgNBXBdLhbrbYwwa1kAKMu',
                'created_at' => '2025-10-06 14:06:29',
                'updated_at' => '2025-10-06 14:06:29',
            ],
            [
                'id' => 5,
                'login' => 'olivia',
                'email' => 'olivia@cangup.com',
                'senha' => '$2y$12$W9NWHeTfVjEtD1uAjuqyau0kX/uk9KhqFr7bkKDtljt2fYRVLxA6e',
                'created_at' => '2025-10-06 14:06:29',
                'updated_at' => '2025-10-06 14:06:29',
            ],
            [
                'id' => 6,
                'login' => 'yasmin',
                'email' => 'yasmin@cangup.com',
                'senha' => '$2y$12$AEGg7JPP8.iWD49DSYJhWegLDgxDgPPoi.dmMGAmWReNRgW4VB/8W',
                'created_at' => '2025-10-06 14:06:29',
                'updated_at' => '2025-10-06 14:06:29',
            ],
            [
                'id' => 15,
                'login' => 'instituicao@exemplo.com',
                'email' => 'instituicao@exemplo.com',
                'senha' => '$2y$12$1Unqarbr7t1.3zBcnKABT.L7hPsC9M1aJ133JI9VqZTHjDQziabvu',
                'created_at' => '2025-10-20 22:49:58',
                'updated_at' => '2025-10-20 22:49:58',
            ],
            [
                'id' => 16,
                'login' => 'instituicao2@exemplo.com',
                'email' => 'instituicao2@exemplo.com',
                'senha' => '$2y$12$m7i2LUcGteXm.WWgXbH0ROsXdhj/4NjBijQiug9zHtW0rX.ObRhiS',
                'created_at' => '2025-10-20 22:52:29',
                'updated_at' => '2025-10-20 22:52:29',
            ],
            [
                'id' => 17,
                'login' => 'aluno@exemplo.com',
                'email' => 'aluno@exemplo.com',
                'senha' => '$2y$12$AwWQFBRdXgXJTgDTIV6qvu8n8wy60jNd/FDiB9HOXvJ6I/cB03IR.',
                'created_at' => '2025-10-21 02:45:13',
                'updated_at' => '2025-10-21 02:45:13',
            ],
            [
                'id' => 18,
                'login' => 'responsavel@exmplo.com',
                'email' => 'responsavel@exmplo.com',
                'senha' => '$2y$12$ZozSeFcs.E5HtiokR5as6.yoypEDsaO3V3jku./hsmlaZEyB0wTYK',
                'created_at' => '2025-10-21 02:49:44',
                'updated_at' => '2025-10-21 02:49:44',
            ],
            [
                'id' => 20,
                'login' => 'secretaria.cti.feb@unesp.br',
                'email' => 'secretaria.cti.feb@unesp.br',
                'senha' => '$2y$12$4LP/8bOmt71DT/oHwLAJaeqe4jf80GCgkVOUTz.TlDtaaH8WZdh.6',
                'created_at' => '2025-10-22 10:42:29',
                'updated_at' => '2025-10-22 10:42:29',
            ],
            [
                'id' => 21,
                'login' => 'yasmin.diniz-oliveira@unesp.br',
                'email' => 'yasmin.diniz-oliveira@unesp.br',
                'senha' => '$2y$12$ySDNWR0SY8Q9ExencnCTYOdJ8RAHanoB83VB.bscymA5Y00oBFj5i',
                'created_at' => '2025-10-22 10:53:55',
                'updated_at' => '2025-10-22 10:53:55',
            ],
            [
                'id' => 22,
                'login' => 'olivia.v.martins@unesp.br',
                'email' => 'olivia.v.martins@unesp.br',
                'senha' => '$2y$12$QyhOnpxKuLsWr5p6zHrqeuwzmxDAxt1E8wWQm8Vwam5.dESFwsgpm',
                'created_at' => '2025-10-22 10:55:31',
                'updated_at' => '2025-10-22 10:55:31',
            ],
            [
                'id' => 23,
                'login' => 'eliane@gmail.com',
                'email' => 'eliane@gmail.com',
                'senha' => '$2y$12$tTTfTO1dUdEPDE7Gl/IpPO8zJr7ZKNo/MjWC7x43tZHpyjj4tIfvq',
                'created_at' => '2025-10-22 11:09:39',
                'updated_at' => '2025-10-22 11:09:39',
            ],
            [
                'id' => 24,
                'login' => 'responsavel@exemplo.com',
                'email' => 'responsavel@exemplo.com',
                'senha' => '$2y$12$PytplzGFiR2KjVKsHZ7BwuD/4frPLZ0Ldl.iPjUr5p6vCS1ICvrAC',
                'created_at' => '2025-10-28 02:55:52',
                'updated_at' => '2025-10-28 02:55:52',
            ],
            [
                'id' => 27,
                'login' => 'cti.unesp@exemplo.com',
                'email' => 'cti.unesp@exemplo.com',
                'senha' => '$2y$10$U.rTTNJd/j28wcG1T0BbKOOnv/Oq9GgltJfMQqzOW0vz42.a9nxKG',
                'created_at' => '2025-11-02 19:51:30',
                'updated_at' => '2025-11-02 19:51:30',
            ],
            [
                'id' => 28,
                'login' => 'jonathas.aluno@exemplo.com',
                'email' => 'jonathas.aluno@exemplo.com',
                'senha' => '$2y$10$U.rTTNJd/j28wcG1T0BbKOOnv/Oq9GgltJfMQqzOW0vz42.a9nxKG',
                'created_at' => '2025-11-02 19:51:30',
                'updated_at' => '2025-11-02 19:51:30',
            ],
            [
                'id' => 29,
                'login' => 'responsavel.exemplo@exemplo.com',
                'email' => 'responsavel.exemplo@exemplo.com',
                'senha' => '$2y$10$U.rTTNJd/j28wcG1T0BbKOOnv/Oq9GgltJfMQqzOW0vz42.a9nxKG',
                'created_at' => '2025-11-02 19:51:30',
                'updated_at' => '2025-11-02 19:51:30',
            ],
            [
                'id' => 30,
                'login' => 'admin.exemplo@exemplo.com',
                'email' => 'admin.exemplo@exemplo.com',
                'senha' => '$2y$10$U.rTTNJd/j28wcG1T0BbKOOnv/Oq9GgltJfMQqzOW0vz42.a9nxKG',
                'created_at' => '2025-11-02 19:51:30',
                'updated_at' => '2025-11-02 19:51:30',
            ],
        ];

        $inseridos = 0;
        foreach ($usuarios as $usuario) {
            // Verifica se já existe pelo ID
            $existePorId = DB::table('usuarios')->where('id', $usuario['id'])->exists();
            
            // Verifica se já existe pelo login ou email (unique constraint)
            $existePorLogin = DB::table('usuarios')->where('login', $usuario['login'])->exists();
            $existePorEmail = DB::table('usuarios')->where('email', $usuario['email'])->exists();
            
            if (!$existePorId && !$existePorLogin && !$existePorEmail) {
                DB::table('usuarios')->insert($usuario);
                $inseridos++;
            }
        }
        
        // Ajustar a sequência para o próximo ID disponível (31)
        DB::statement("SELECT setval('usuarios_id_seq', 31, true)");

        $this->command->info("✓ {$inseridos} usuários criados (outros já existiam)!");
    }
}
