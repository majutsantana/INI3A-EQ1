<?php

namespace App\Http\Controllers;

use App\Models\Instituicao;
use App\Models\Perfil;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class InstituicaoController extends Controller
{
    public function cadastrarInst(Request $req)
    {
        $dados = $req->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|string|email|unique:usuarios,email', // Garante que o email seja único na tabela de usuários
            'endereco' => 'required|string',
            'cnpj' => 'required|string|unique:instituicoes,cnpj', // Garante que o CNPJ seja único
            'telefone' => 'required|string',
            'plano' => 'required|in:S,A',
            'senha' => 'required|string|min:8' // Senha é obrigatória e com no mínimo 8 caracteres
        ]);

        try {
            // **MELHORIA: Usando uma transação no banco de dados.**
            // Isso garante que todas as operações abaixo sejam executadas com sucesso.
            // Se qualquer uma falhar, todas as anteriores são desfeitas (rollback).
            $instituicao = DB::transaction(function () use ($dados) {
                // 1. Cria a Instituição
                $instituicao = Instituicao::create([
                    "nome" => $dados["nome"],
                    "endereco" => $dados["endereco"],
                    "cnpj" => $dados["cnpj"],
                    "telefone" => $dados["telefone"],
                    "email" => $dados["email"],
                    "plano" => $dados["plano"],
                ]);

                // 2. Cria o Usuário associado
                $usuario = new Usuario();
                $usuario->email = $dados["email"];
                $usuario->login = $dados["email"];
                // **CORREÇÃO DE SEGURANÇA: Criptografando a senha.**
                // Nunca salve senhas em texto puro no banco de dados.
                $usuario->senha = Hash::make($dados["senha"]);
                $usuario->save();

                // 3. Associa o perfil "inst" ao usuário recém-criado
                $perfil = Perfil::where("rotulo", "inst")->firstOrFail();

                // **MELHORIA: Usando o método attach() do Eloquent.**
                // Esta é a forma padrão do Laravel para associar registros em tabelas pivô.
                // Requer que o model Usuario tenha a relação `belongsToMany(Perfil::class)`.
                $usuario->perfis()->attach($perfil->id);
                
                // **IMPORTANTE**: Aqui você poderia associar o usuário à instituição, se houver essa relação no banco.
                // Ex: $instituicao->usuarios()->save($usuario); ou $usuario->instituicao_id = $instituicao->id;

                return $instituicao;
            });

            // Se tudo correu bem, retorna a instituição criada com status 201 (Created)
            return response()->json($instituicao, 201);

        } catch (Throwable $e) {
            // Se qualquer erro ocorreu dentro da transação, captura aqui.
            // Isso é útil para debugar.
            report($e);
            return response()->json(["error" => "Ocorreu um erro ao cadastrar a instituição."], 500);
        }
    }

    /**
     * CREATE - Adiciona uma nova instituição (método genérico).
     */
    public function store(Request $req)
    {
        $dados = $req->validate([
            'nome' => 'required|string|max:255',
            'endereco' => 'required|string',
            'horario_funcionamento' => 'sometimes|string', // 'sometimes' torna o campo opcional
            'telefone' => 'required|string',
        ]);

        $instituicao = Instituicao::create($dados);

        return response()->json($instituicao, 201);
    }

    /**
     * READ - Lista todas as instituições.
     */
    public function index()
    {
        return response()->json(Instituicao::all(), 200);
    }

    /**
     * READ - Mostra uma instituição específica.
     */
    public function show($id)
    {
        // findOrFail já retorna 404 automaticamente se não encontrar
        $instituicao = Instituicao::findOrFail($id);
        return response()->json($instituicao, 200);
    }

    /**
     * UPDATE - Atualiza dados da instituição.
     */
    public function update(Request $req, $id)
    {
        $dados = $req->validate([
            // 'sometimes' garante que a validação só ocorra se o campo for enviado
            'nome' => 'sometimes|string|max:255',
            'endereco' => 'sometimes|string',
            'horario_funcionamento' => 'sometimes|string',
            'telefone' => 'sometimes|string',
        ]);

        $instituicao = Instituicao::findOrFail($id);
        $instituicao->update($dados);

        return response()->json($instituicao, 200);
    }

    /**
     * DELETE - Exclui uma instituição.
     */
    public function destroy($id)
    {
        $instituicao = Instituicao::findOrFail($id);
        $instituicao->delete();

        // Retorna uma resposta vazia com status 204 (No Content), comum para deletes bem-sucedidos.
        return response()->json(null, 204);
    }
}

