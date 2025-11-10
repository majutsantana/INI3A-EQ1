<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\Perfil;
use App\Models\Usuario;
use App\Models\Instituicao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AlunoController extends Controller
{
    public function preCadastrarAlun(Request $req)
    {

        $user = Auth::user();
        $inst = Instituicao::where('email', $user->email)->first();
        
        $dados = $req->validate([
            'nome' => 'required|string',
            'cpf' => 'required|string',
            'ra' => 'required|string',
            'id_inst' => 'required|exists:instituicoes,id',
        ]);

        $aluno = new Aluno();
        $aluno->nome = $dados["nome"];
        $aluno->cpf = $dados["cpf"];
        $aluno->ra = $dados["ra"];
        $aluno->id_inst = $dados["id_inst"];
        $aluno->save();

        return response()->json($aluno, 201);
    }

    public function efetivarAluno(Request $req)
    {
        $dados = $req->validate([
            'cpf' => 'required|string',
            'nome' => 'required|string',
            'ra' => 'required|string',
            'id_inst' => 'required|integer',
        ]);


        $aluno = Aluno::where('cpf', $dados['cpf'])
            ->where('nome', $dados['nome'])
            ->where('ra', $dados['ra'])
            ->where('id_inst', $dados['id_inst'])
            ->first();

        if (!$aluno) {
            return response()->json(['message' => 'Aluno não encontrado.'], 404);
        }


        return response()->json([
            'message' => 'Aluno Efetivado',
            'aluno' => $aluno
        ], 200);
    }

    public function cadastrarAluno(Request $req)
    {
    $dados = $req->validate([
        'cpf' => 'required|string|exists:alunos,cpf',
        'email' => 'required|string|email|max:255|unique:usuarios,email',
        'genero' => 'nullable|in:Masculino,Feminino,Neutro,Prefiro não informar',
        'endereco' => 'nullable|string',
        'telefone' => 'nullable|string',
        'senha' => 'required|string|min:6'
    ]);

    $aluno = Aluno::where('cpf', $dados['cpf'])->first();

    if (!$aluno) {
        return response()->json([
            'error' => 'Aluno não encontrado para o CPF informado',
            'cpf' => $dados['cpf']
        ], 404);
    }

    try {
        // Verificar se já existe usuário com este email
        $usuarioExistente = Usuario::where('email', $dados['email'])->first();
        if ($usuarioExistente) {
            return response()->json([
                'error' => 'Este email já está cadastrado',
                'email' => $dados['email']
            ], 400);
        }

        $usuario = new Usuario();
        $usuario->email = $dados['email'];
        $usuario->login = $dados['email'];
        $usuario->senha = $dados['senha']; 
        $usuario->save();

        if (!$usuario->id) {
            return response()->json(['error' => 'Erro ao criar usuário'], 500);
        }
    } catch (\Illuminate\Database\QueryException $e) {
        // Se for erro de sequência, tentar corrigir e retentar
        if (strpos($e->getMessage(), 'duplicate key value violates unique constraint') !== false && 
            strpos($e->getMessage(), 'usuarios_pkey') !== false) {
            
            \Log::warning('Sequência de usuarios dessincronizada, tentando corrigir...', [
                'error' => $e->getMessage()
            ]);
            
            // Tentar corrigir a sequência
            try {
                DB::statement("SELECT setval('usuarios_id_seq', COALESCE((SELECT MAX(id) FROM usuarios), 0) + 1, false)");
                
                // Tentar criar novamente
                $usuario = new Usuario();
                $usuario->email = $dados['email'];
                $usuario->login = $dados['email'];
                $usuario->senha = $dados['senha']; 
                $usuario->save();
            } catch (\Exception $e2) {
                \Log::error('Erro ao corrigir sequência e criar usuário', [
                    'error' => $e2->getMessage()
                ]);
                return response()->json([
                    'error' => 'Erro ao criar usuário. A sequência do banco de dados precisa ser corrigida manualmente.',
                    'message' => 'Execute o script SQL: SELECT setval(\'usuarios_id_seq\', COALESCE((SELECT MAX(id) FROM usuarios), 0) + 1, false)'
                ], 500);
            }
        } else {
            throw $e; // Re-lançar se não for erro de sequência
        }
    }

    $perfil = Perfil::where('rotulo', 'alun')->first();

    if (!$perfil) {
        return response()->json(['error' => 'Perfil "aluno" não encontrado'], 500);
    }

    // Criar perfil_usuario com tratamento de erro de sequência
    try {
        // Verificar se já existe antes de inserir
        $perfilUsuarioExistente = DB::table('perfil_usuario')
            ->where('usuario_id', $usuario->id)
            ->where('perfil_id', $perfil->id)
            ->first();
        
        if (!$perfilUsuarioExistente) {
            // Se for erro de sequência, corrigir e tentar novamente
            try {
                DB::table('perfil_usuario')->insert([
                    'usuario_id' => $usuario->id,
                    'perfil_id' => $perfil->id
                ]);
            } catch (\Illuminate\Database\QueryException $e) {
                if (strpos($e->getMessage(), 'perfil_usuario_pkey') !== false && 
                    strpos($e->getMessage(), 'duplicate key') !== false) {
                    
                    \Log::warning('Sequência de perfil_usuario dessincronizada, tentando corrigir...', [
                        'error' => $e->getMessage()
                    ]);
                    
                    // Corrigir a sequência
                    DB::statement("SELECT setval('perfil_usuario_id_seq', COALESCE((SELECT MAX(id) FROM perfil_usuario), 0) + 1, false)");
                    
                    // Tentar inserir novamente
                    DB::table('perfil_usuario')->insert([
                        'usuario_id' => $usuario->id,
                        'perfil_id' => $perfil->id
                    ]);
                } else {
                    throw $e; // Re-lançar se não for erro de sequência
                }
            }
        }
    } catch (\Exception $e) {
        \Log::error('Erro ao criar perfil_usuario', [
            'error' => $e->getMessage(),
            'usuario_id' => $usuario->id,
            'perfil_id' => $perfil->id
        ]);
        // Se falhar, retornar erro crítico pois o usuário não poderá fazer login sem perfil
        return response()->json([
            'error' => 'Erro ao associar perfil ao usuário. O usuário foi criado, mas não poderá fazer login até que o perfil seja associado manualmente.',
            'message' => $e->getMessage()
        ], 500);
    }

    // Atualizar dados do aluno
    try {
        $aluno->email = $dados['email'];
        $aluno->genero = $dados['genero'] ?? null;
        $aluno->endereco = $dados['endereco'] ?? null;
        $aluno->telefone = $dados['telefone'] ?? null;
        $aluno->save(); // Usar save() em vez de update() para melhor tratamento de erros
        
        // Recarregar o aluno para garantir que os dados estão atualizados
        $aluno->refresh();
    } catch (\Exception $e) {
        \Log::error('Erro ao atualizar dados do aluno', [
            'error' => $e->getMessage(),
            'aluno_id' => $aluno->id,
            'dados' => $dados
        ]);
        // Mesmo se falhar, o usuário já foi criado, então retornamos sucesso parcial
        return response()->json([
            'message' => 'Usuário criado com sucesso, mas houve erro ao atualizar dados do aluno',
            'warning' => 'Alguns dados podem não ter sido salvos. Tente fazer login e atualizar seu perfil.',
            'usuario' => $usuario,
            'aluno' => $aluno,
            'error_details' => $e->getMessage()
        ], 201);
    }

    return response()->json([
        'message' => 'Aluno cadastrado com sucesso',
        'aluno' => $aluno,
        'usuario' => $usuario
    ], 201, [], JSON_UNESCAPED_UNICODE);
    }

    public function index()
    {
        return response()->json(Aluno::all());
    }


    public function show($id)
    {
        $aluno = Aluno::findOrFail($id);
        return response()->json($aluno);
    }

    public function update(Request $request, $id)
    {
        $dados = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'endereco' => 'sometimes|string',
            'telefone' => 'sometimes|string',
            'imagem' => 'sometimes|nullable|string',
    ]);

    $aluno = Aluno::findOrFail($id);
    $aluno->update($dados);
    return response()->json($aluno);
    }

    public function destroy($id)
    {
    $aluno = Aluno::findOrFail($id);
    $aluno->delete();
    return response()->json(null, 204);
    }

}

