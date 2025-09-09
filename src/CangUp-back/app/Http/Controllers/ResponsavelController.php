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
        'sexo' => 'nullable|in:Masculino,Feminino,Neutro,Prefiro não informar',
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


    DB::table('perfil_usuario')->insert([
        'usuario_id' => $usuario->id,
        'perfil_id' => $perfil->id
    ]);


    $responsavel->email = $dados['email'];
    $responsavel->sexo = $dados['sexo'];
    $responsavel->endereco = $dados['endereco'];
    $responsavel->telefone = $dados['telefone'];
    $responsavel->update();


    return response()->json([
        'message' => 'Responsavel cadastrado com sucesso',
        'responsavel' => $responsavel,
        'usuario' => $usuario
    ], 201);
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
