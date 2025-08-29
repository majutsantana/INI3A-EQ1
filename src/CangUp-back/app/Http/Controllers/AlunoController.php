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
    public function preCadastrarAlun(Request $req){

        $user = Auth::user();
        $inst = Instituicao::where('email', $user->email)->first();
       // dd($inst);
        $dados = $req->validate([
            'nome' => 'required|string',
            'cpf' => 'required|string',
            'ra' => 'required|string',
           // 'email' => 'email',
           // 'sexo' => 'in:Masculino,Feminino,Neutro,Prefiro não informar',
           // 'endereco' => 'string',
           'id_inst' => 'required|exists:instituicoes,id',
           // 'senha' => 'string'
        ]);
        
        $aluno=new Aluno();
        $aluno->nome = $dados["nome"];
        $aluno->cpf = $dados["cpf"];
        $aluno->ra = $dados["ra"];
        //
        // ID INSTITUICAO = $inst->id
        //

        // $aluno->email = $dados["email"];
        // $aluno->endereco = $dados["endereco"];
        // $aluno->sexo = $dados["sexo"];
        $aluno->id_inst = $dados["id_inst"];
        $aluno->save();

        // $usuario = new Usuario();
        // $usuario->email = $dados["email"];
        // $usuario->login = $dados["email"];
        // $usuario->senha = $dados["senha"];
        // $usuario->save();

        // $perfil = Perfil::where("rotulo", "alun")->first();

        // DB::table("perfil_usuario")->insert([
        //     "usuario_id" => $usuario->id,
        //     "perfil_id" => $perfil->id
        // ]);

        return response()->json($aluno, 201);
    }

    public function efetivarAluno(Request $req){
        $dados = $req->validate([
            'cpf' => 'required|string',
            'nome'=>'required|string',
            'id_inst'=>'required|int'
        ]);

        $aluno = Aluno::where('cpf', $dados['cpf'])
                ->where('nome', $dados['nome'])
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

    public function cadastrarAluno(Request $req){
        $dados = $req->validate([
            'cpf' => 'required|string|exists:alunos,cpf', 
            'email' => 'required|string|email|max:255|unique:usuarios,email',
            'sexo' => 'in:Masculino,Feminino,Neutro,Prefiro não informar',
            'endereco' => 'string',
            'senha' => 'required|string|min:6'
        ]);
        
        $aluno = Aluno::where('cpf', $dados['cpf'])->first();

        
        
        if (!$aluno) {
            return response()->json(['message' => 'Aluno não encontrado para cadastro.'], 404);
        }

        $usuario = new Usuario();
        $usuario->email = $dados['email'];
        $usuario->login = $dados['email'];
        $usuario->senha = $dados['senha'];
        $usuario->save();

        $perfil = Perfil::where("rotulo", "aluno")->first();
        DB::table("perfil_usuario")->insert([
            "usuario_id" => $usuario->id,
            "perfil_id" => $perfil->id
        ]);

        $aluno->email = $dados['email'];
        $aluno->sexo = $dados['sexo'];
        $aluno->endereco = $dados['endereco'];

        $aluno->update();

        return response()->json([
            'message' => 'Aluno cadastrado com sucesso',
            'aluno' => $aluno,
            'usuario' => $usuario
        ], 201);
    }


}

