<?php

namespace App\Http\Controllers;

use App\Models\Veiculo;
use App\Models\Responsavel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class VeiculoController extends Controller
{
    public function cadastrarVeiculo(Request $req)
    {
        $resp = Responsavel::where('email', $user->email)->first();
        $dados = $req->validate([
            'modelo' => 'required|string',
            'placa' => 'required|string|unique:veiculos,placa',
            'cor' => 'required|string',
            'qtde_assentos' => 'required|integer',
            'id_resp' => 'required|exists:responsaveis,id',  
        ]);

        $veiculo = new Veiculo();
        $veiculo->modelo = $dados["modelo"];
        $veiculo->placa = $dados["placa"];
        $veiculo->cor = $dados["cor"];
        $veiculo->qtde_assentos = $dados["qtde_assentos"];
        $veiculo->id_resp = $dados["id_resp"];
        $veiculo->save();

        return response()->json($veiculo, 201);
    }
}
