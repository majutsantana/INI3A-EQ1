<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use Illuminate\Http\Request;

class AlunoController extends Controller
{
    public function cadastrar(Request $req){
        $dados = $req->all();

        Aluno::create($dados);
        return redirect()->route('admin.cadastrar');
    }
}
