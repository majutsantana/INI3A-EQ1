<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PerfilUsuarioTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insere todas as associações de perfil_usuario do banco antigo (apenas as que não existem)
        $perfisUsuario = [
            [
                'id' => 1,
                'perfil_id' => 1,
                'usuario_id' => 1,
                'instituicao_id' => null,
                'created_at' => '2025-10-06 14:06:28',
                'updated_at' => '2025-10-06 14:06:28',
            ],
            [
                'id' => 2,
                'perfil_id' => 1,
                'usuario_id' => 2,
                'instituicao_id' => null,
                'created_at' => '2025-10-06 14:06:29',
                'updated_at' => '2025-10-06 14:06:29',
            ],
            [
                'id' => 3,
                'perfil_id' => 1,
                'usuario_id' => 3,
                'instituicao_id' => null,
                'created_at' => '2025-10-06 14:06:29',
                'updated_at' => '2025-10-06 14:06:29',
            ],
            [
                'id' => 4,
                'perfil_id' => 1,
                'usuario_id' => 4,
                'instituicao_id' => null,
                'created_at' => '2025-10-06 14:06:29',
                'updated_at' => '2025-10-06 14:06:29',
            ],
            [
                'id' => 5,
                'perfil_id' => 1,
                'usuario_id' => 5,
                'instituicao_id' => null,
                'created_at' => '2025-10-06 14:06:29',
                'updated_at' => '2025-10-06 14:06:29',
            ],
            [
                'id' => 6,
                'perfil_id' => 1,
                'usuario_id' => 6,
                'instituicao_id' => null,
                'created_at' => '2025-10-06 14:06:29',
                'updated_at' => '2025-10-06 14:06:29',
            ],
            [
                'id' => 15,
                'perfil_id' => 2,
                'usuario_id' => 15,
                'instituicao_id' => null,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'id' => 16,
                'perfil_id' => 2,
                'usuario_id' => 16,
                'instituicao_id' => null,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'id' => 17,
                'perfil_id' => 4,
                'usuario_id' => 17,
                'instituicao_id' => null,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'id' => 18,
                'perfil_id' => 3,
                'usuario_id' => 18,
                'instituicao_id' => null,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'id' => 20,
                'perfil_id' => 2,
                'usuario_id' => 20,
                'instituicao_id' => null,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'id' => 21,
                'perfil_id' => 4,
                'usuario_id' => 21,
                'instituicao_id' => null,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'id' => 22,
                'perfil_id' => 4,
                'usuario_id' => 22,
                'instituicao_id' => null,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'id' => 23,
                'perfil_id' => 3,
                'usuario_id' => 23,
                'instituicao_id' => null,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'id' => 24,
                'perfil_id' => 3,
                'usuario_id' => 24,
                'instituicao_id' => null,
                'created_at' => null,
                'updated_at' => null,
            ],
            [
                'id' => 25,
                'perfil_id' => 2,
                'usuario_id' => 27,
                'instituicao_id' => 6,
                'created_at' => '2025-11-02 19:51:30',
                'updated_at' => '2025-11-02 19:51:30',
            ],
            [
                'id' => 26,
                'perfil_id' => 4,
                'usuario_id' => 28,
                'instituicao_id' => 6,
                'created_at' => '2025-11-02 19:51:30',
                'updated_at' => '2025-11-02 19:51:30',
            ],
            [
                'id' => 27,
                'perfil_id' => 3,
                'usuario_id' => 29,
                'instituicao_id' => 6,
                'created_at' => '2025-11-02 19:51:30',
                'updated_at' => '2025-11-02 19:51:30',
            ],
            [
                'id' => 28,
                'perfil_id' => 1,
                'usuario_id' => 30,
                'instituicao_id' => null,
                'created_at' => '2025-11-02 19:51:30',
                'updated_at' => '2025-11-02 19:51:30',
            ],
        ];

        $inseridos = 0;
        foreach ($perfisUsuario as $perfilUsuario) {
            // Verifica se o usuário existe antes de criar a associação
            $usuarioExiste = DB::table('usuarios')->where('id', $perfilUsuario['usuario_id'])->exists();
            if (!$usuarioExiste) {
                $this->command->warn("⚠ Pulando associação para usuario_id={$perfilUsuario['usuario_id']} (usuário não existe)");
                continue;
            }
            
            // Verifica se o perfil existe
            $perfilExiste = DB::table('perfils')->where('id', $perfilUsuario['perfil_id'])->exists();
            if (!$perfilExiste) {
                $this->command->warn("⚠ Pulando associação para perfil_id={$perfilUsuario['perfil_id']} (perfil não existe)");
                continue;
            }
            
            // Verifica se a instituição existe (quando houver instituicao_id)
            if (isset($perfilUsuario['instituicao_id']) && $perfilUsuario['instituicao_id'] !== null) {
                $instituicaoExiste = DB::table('instituicoes')->where('id', $perfilUsuario['instituicao_id'])->exists();
                if (!$instituicaoExiste) {
                    $this->command->warn("⚠ Pulando associação para instituicao_id={$perfilUsuario['instituicao_id']} (instituição não existe)");
                    continue;
                }
            }
            
            // Verifica se já existe pelo ID ou pela combinação perfil_id + usuario_id
            $associacaoExiste = DB::table('perfil_usuario')
                ->where('id', $perfilUsuario['id'])
                ->orWhere(function($query) use ($perfilUsuario) {
                    $query->where('perfil_id', $perfilUsuario['perfil_id'])
                          ->where('usuario_id', $perfilUsuario['usuario_id']);
                })
                ->exists();
            
            if (!$associacaoExiste) {
                DB::table('perfil_usuario')->insert($perfilUsuario);
                $inseridos++;
            }
        }
        
        // Ajustar a sequência para o próximo ID disponível (29)
        DB::statement("SELECT setval('perfil_usuario_id_seq', 29, true)");

        $this->command->info("✓ {$inseridos} associações perfil_usuario criadas (outras já existiam)!");
    }
}
