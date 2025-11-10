<?php


namespace App\Http\Controllers;


use App\Models\Responsavel;
use App\Models\Perfil;
use App\Models\Usuario;
use App\Models\Instituicao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;


class ResponsavelController extends Controller
{
    public function preCadastrarResp(Request $req)
    {
        $user = Auth::user();
        $inst = Instituicao::where('email', $user->email)->first();

        $dados = $req->validate([
            'nome' => 'required|string',
            'cpf' => 'required|string',
            'id_inst' => 'required|exists:instituicoes,id',
        ]);


        $responsavel=new Responsavel();
        $responsavel->nome = $dados["nome"];
        $responsavel->cpf = $dados["cpf"];
        $responsavel->id_inst = $dados["id_inst"];
        $responsavel->save();


        return response()->json($responsavel, 201);
    }


    public function efetivarResponsavel(Request $req)
    {
        $dados = $req->validate([
            'cpf' => 'required|string',
            'nome' => 'required|string',
            'id_inst' => 'required|integer',
        ]);


        $responsavel = Responsavel::where('cpf', $dados['cpf'])
            ->where('nome', $dados['nome'])
            ->where('id_inst', $dados['id_inst'])
            ->first();

        if (!$responsavel) {
            return response()->json(['message' => 'Responsavel não encontrado.'], 404);
        }


        return response()->json([
            'message' => 'Responsavel Efetivado',
            'responsavel' => $responsavel
        ], 200);
    }


    public function cadastrarResponsavel(Request $req)
    {
    $dados = $req->validate([
        'cpf' => 'required|string|exists:responsaveis,cpf',
        'email' => 'required|string|email|max:255|unique:usuarios,email',
        'telefone' => 'nullable|string',
        'genero' => 'nullable|in:Masculino,Feminino,Neutro,Prefiro não informar',
        'endereco' => 'nullable|string',
        'senha' => 'required|string|min:6'
    ]);

    $responsavel = Responsavel::where('cpf', $dados['cpf'])->first();

    if (!$responsavel) {
        return response()->json([
            'error' => 'Responsavel não encontrado para o CPF informado',
            'cpf' => $dados['cpf']
        ], 404);
    }

    $usuario = new Usuario();
    $usuario->email = $dados['email'];
    $usuario->login = $dados['email'];
    $usuario->senha =  $dados['senha'];
    $usuario->save();


    if (!$usuario->id) {
        return response()->json(['error' => 'Erro ao criar usuário'], 500);
    }


    $perfil = Perfil::where('rotulo', 'resp')->first();


    if (!$perfil) {
        return response()->json(['error' => 'Perfil "responsavel" não encontrado'], 500);
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

    // Atualizar dados do responsável
    try {
        $responsavel->email = $dados['email'];
        $responsavel->genero = $dados['genero'] ?? null;
        $responsavel->endereco = $dados['endereco'] ?? null;
        $responsavel->telefone = $dados['telefone'] ?? null;
        $responsavel->save(); // Usar save() em vez de update() para melhor tratamento de erros
        
        // Recarregar o responsável para garantir que os dados estão atualizados
        $responsavel->refresh();
    } catch (\Exception $e) {
        \Log::error('Erro ao atualizar dados do responsável', [
            'error' => $e->getMessage(),
            'responsavel_id' => $responsavel->id,
            'dados' => $dados
        ]);
        // Mesmo se falhar, o usuário já foi criado, então retornamos sucesso parcial
        return response()->json([
            'message' => 'Usuário criado com sucesso, mas houve erro ao atualizar dados do responsável',
            'warning' => 'Alguns dados podem não ter sido salvos. Tente fazer login e atualizar seu perfil.',
            'usuario' => $usuario,
            'responsavel' => $responsavel,
            'error_details' => $e->getMessage()
        ], 201);
    }

    return response()->json([
        'message' => 'Responsavel cadastrado com sucesso',
        'responsavel' => $responsavel,
        'usuario' => $usuario
    ], 201, [], JSON_UNESCAPED_UNICODE);
    }

    public function index()
    {
        return response()->json(Responsavel::all());
    }


    public function show($id)
    {
        $responsavel = Responsavel::findOrFail($id);
        return response()->json($responsavel);
    }

    public function update(Request $request, $id)
    {
        $dados = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'endereco' => 'sometimes|string',
            'telefone' => 'sometimes|string',
            'imagem' => 'sometimes|nullable|string',
        ]);

        $responsavel = Responsavel::findOrFail($id);
        $responsavel->update($dados);
        return response()->json($responsavel);
    }

    public function destroy($id)
    {
        $responsavel = Responsavel::findOrFail($id);
        $responsavel->delete();
        return response()->json(null, 204);
    }

}
