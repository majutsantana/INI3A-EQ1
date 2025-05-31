<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use Illuminate\Http\Request;

class AlunoController extends Controller
{
    public function cadastrar(Request $req){
        $req->validate([
            'nome' => 'required|string',
            'cpf' => 'required|string',
            'ra' => 'required|string',
            'email' => 'required|email',
            'endereco' => 'required|string',
            'sexo' => 'required|in:Masculino,Feminino,Neutro,Prefiro não informar',
            'instituicao' => 'required|in:IF,UE,UF',
        ]);

        $dados = $req->all();

        Aluno::create($dados);
        return redirect()->route('admin.cadastrar');
    }
}
