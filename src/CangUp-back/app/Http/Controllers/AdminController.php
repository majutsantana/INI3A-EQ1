<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\Perfil;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function store(Request $r){
        $dados =  $r->validate([
            'login' => 'required|string',
            'email' => 'required|email',
            'senha' => 'string'
        ]);

        $u = new Usuario();
        $u->login = $dados['login'];
        $u->email = $dados['email'];
        $u->senha = $dados['senha'];
        $u->save();

        $perfil = Perfil::where('rotulo', 'adm')->first();

        DB::table("perfil_usuario")->insert([
            'usuario_id' => $u->id,
            'perfil_id' => $perfil->id
        ]);

        return ['success'=> true];
    }
}
