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
    public function cadastrarInst(Request $req){
        $dados = $req->validate([
            'nome' => 'required|string',
            'email' => 'required|string',
            'endereco' => 'required|string',
            'cnpj' => 'required|string', 
            'telefone' => 'required|string',
            'senha' => 'required|string',
            'plano' => 'required|in:S,A',
        ]);

        $instituicao=new Instituicao();
        $instituicao->nome = $dados["nome"];
        $instituicao->endereco = $dados["endereco"];
        $instituicao->cnpj = $dados["cnpj"];
        $instituicao->telefone = $dados["telefone"];
        $instituicao->email = $dados["email"];
        $instituicao->plano = $dados["plano"];
        $instituicao->save();

        $usuario = new Usuario();
        $usuario->email = $dados["email"];
        $usuario->login = $dados["email"];
        $usuario->senha = $dados["senha"];
        $usuario->save();

        $perfil = Perfil::where("rotulo", "inst")->get()[0];

        DB::table("perfil_usuario")->insert([
            "usuario_id" => $usuario->id,
            "perfil_id" => $perfil->id
        ]);

        return response()->json($instituicao, 201);
    }
}
