<?php

namespace App\Http\Controllers;

use App\Models\Instituicao;
use Illuminate\Http\Request;

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
            'email' => 'required|string',
            'plano' => 'required|in:S,A',
        ]);

        $instituicao=Instituicao::create($dados);
        return response()->json($instituicao, 201);
    }
}
