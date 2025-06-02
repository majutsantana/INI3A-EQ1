<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use Illuminate\Http\Request;

class AlunoController extends Controller
{
    public function cadastrar(Request $req){
        $dados = $req->validate([
            'nome' => 'required|string',
            'cpf' => 'required|string',
            'ra' => 'required|string',
            'email' => 'required|email',
            'endereco' => 'required|string',
            'sexo' => 'required|in:Masculino,Feminino,Neutro,Prefiro não informar',
            'instituicao' => 'required|in:IF,UE,UF',
        ]);

        $aluno=  Aluno::create($dados);
        return response()->json($aluno, 201);
    }
}
