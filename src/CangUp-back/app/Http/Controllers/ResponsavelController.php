<?php

namespace App\Http\Controllers;

use App\Models\Responsavel;
use App\Models\Perfil;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ResponsavelController extends Controller
{
    public function cadastrarResp(Request $req){
        $dados = $req->validate([
            'nome' => 'required|string',
            'cpf' => 'required|string',
            'email' => 'required|email',
            'telefone' => 'required|string',
            'senha' => 'string'
        ]);

        $responsavel=new Responsavel();
        $responsavel->nome = $dados["nome"];
        $responsavel->cpf = $dados["cpf"];
        $responsavel->email = $dados["email"];
        $responsavel->telefone = $dados["telefone"];
        $responsavel->save();

        $usuario = new Usuario();
        $usuario->email = $dados["email"];
        $usuario->login = $dados["email"];
        $usuario->senha = $dados["senha"];
        $usuario->save();

        $perfil = Perfil::where("rotulo", "resp")->first();

        DB::table("perfil_usuario")->insert([
            "usuario_id" => $usuario->id,
            "perfil_id" => $perfil->id
        ]);

        return response()->json($responsavel, 201);
    }

}
