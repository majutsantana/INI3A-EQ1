<?php

namespace App\Http\Controllers;

// Imports necessários
use App\Models\Instituicao;
use App\Models\Perfil;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator; // Importar o Validator
use Throwable; // Importar Throwable para o catch

class InstituicaoController extends Controller
{
    /**
     * Registra uma nova instituição e um usuário associado.
     */
    public function cadastrarInst(Request $request)
    {
        // 1. VALIDAÇÃO EXPLÍCITA DOS DADOS
        // Usar Validator::make() nos dá mais controle e garante que a resposta de erro
        // seja sempre um JSON, evitando os redirecionamentos que causam o erro de CORS.
        $validator = Validator::make($request->all(), [
            'nome' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios,email',
            'endereco' => 'required|string',
            'cnpj' => 'required|string|max:18|unique:instituicoes,cnpj',
            'telefone' => 'required|string|max:20',
            'plano' => 'required|in:S,A',
            'senha' => 'required|string|min:6',
        ]);

        // 2. RETORNO DE ERRO EM JSON (ISTO RESOLVE O CORS)
        // Se a validação falhar, retorna os erros e para a execução.
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 3. TRANSAÇÃO SEGURA NO BANCO DE DADOS
        // DB::transaction garante que ou TUDO funciona, ou NADA é salvo no banco.
        try {
            $instituicao = DB::transaction(function () use ($request) {
                // Passo A: Cria a Instituição
                $instituicao = Instituicao::create([
                    "nome" => $request->nome,
                    "endereco" => $request->endereco,
                    "cnpj" => $request->cnpj,
                    "telefone" => $request->telefone,
                    "email" => $request->email,
                    "plano" => $request->plano,
                ]);

                // Passo B: Cria o Usuário associado
                $usuario = Usuario::create([
                    'email' => $request->email,
                    'login' => $request->email, // Usando email como login inicial
                    'senha' => Hash::make($request->senha), // Criptografa a senha
                ]);

                // Passo C: Associa o perfil "inst" ao usuário
                $perfil = Perfil::where("rotulo", "inst")->first();
                if (!$perfil) {
                    // Se o perfil 'inst' não existir no banco, a transação falha.
                    throw new \Exception("Perfil 'inst' não encontrado no banco de dados.");
                }
                $usuario->perfis()->attach($perfil->id);

                return $instituicao;
            });

            // 4. RESPOSTA DE SUCESSO
            // Se a transação foi concluída com sucesso.
            return response()->json($instituicao, 201);

        } catch (Throwable $e) {
            // 5. RESPOSTA DE ERRO DO SERVIDOR
            // Se qualquer erro ocorreu dentro da transação.
            report($e); // Loga o erro para o desenvolvedor
            return response()->json([
                "error" => "Ocorreu um erro interno ao cadastrar a instituição.",
                "message" => $e->getMessage() // Envia a mensagem de erro para debug
            ], 500);
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
            'horario_funcionamento' => 'sometimes|string',
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
        $instituicao = Instituicao::findOrFail($id);
        return response()->json($instituicao, 200);
    }

    /**
     * UPDATE - Atualiza dados da instituição.
     */
    public function update(Request $req, $id)
    {
        $dados = $req->validate([
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
        return response()->json(null, 204);
    }
}
