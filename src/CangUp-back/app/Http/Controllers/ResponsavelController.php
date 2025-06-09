<?php

namespace App\Http\Controllers;

use App\Models\Responsavel;
use Illuminate\Http\Request;

class ResponsavelController extends Controller
{
    public function cadastrar(Request $req){
        $dados = $req->validate([
            'nome' => 'required|string',
            'cpf' => 'required|string',
            'email' => 'required|email',
            'telefone' => 'required|string',
            'senha' => 'required|string',
        ]);

        $responsavel=  Responsavel::create($dados);
        return response()->json($responsavel, 201);
    }
}

/*use App\Helpers\UsuarioHelper;

if (UsuarioHelper::hasPerfil('administrador')) {
    // acesso permitido
} */ //É a validação de acesso que deverá ser implementada nos controllers que necessitam de validação do usuário, inicialmente feitos pela instituição  