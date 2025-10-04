<?php

namespace App\Http\Controllers;

// Imports necessários
use App\Models\Instituicao;
use App\Models\Perfil;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage; 
use Illuminate\Support\Facades\Validator; 
use Throwable;

class InstituicaoController extends Controller
{
    public function cadastrarInst(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nome' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios,email',
            'endereco' => 'required|string',
            'cnpj' => 'required|string|max:18|unique:instituicoes,cnpj',
            'telefone' => 'required|string|max:20',
            'plano' => 'required|in:S,A',
            'senha' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $instituicao = DB::transaction(function () use ($request) {
                $instituicao = Instituicao::create([
                    "nome" => $request->nome,
                    "endereco" => $request->endereco,
                    "cnpj" => $request->cnpj,
                    "telefone" => $request->telefone,
                    "email" => $request->email,
                    "plano" => $request->plano,
                ]);

                $usuario = Usuario::create([
                    'email' => $request->email,
                    'login' => $request->email, 
                    'senha' => $request->senha,
                ]);

                $perfil = Perfil::where("rotulo", "inst")->first();
                if (!$perfil) {
                    throw new \Exception("Perfil 'inst' não encontrado no banco de dados.");
                }
                $usuario->perfis()->attach($perfil->id);

                return $instituicao;
            });

            return response()->json($instituicao, 201);

        } catch (Throwable $e) {
            report($e); 
            return response()->json([
                "error" => "Ocorreu um erro interno ao cadastrar a instituição.",
                "message" => $e->getMessage() 
            ], 500);
        }
    }
    public function index()
    {
        return response()->json(Instituicao::all());
    }

    public function show($id)
    {
        $instituicao = Instituicao::findOrFail($id);
        return response()->json($instituicao);
    }

    public function update(Request $request, $id)
    {
        $dados = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'endereco' => 'sometimes|string',
            'telefone' => 'sometimes|string',
            'imagem' => 'sometimes|nullable|string',
        ]);

        $instituicao = Instituicao::where('id', $id)->first();
        if (!$instituicao) {
            return response()->json(['error' => 'Instituição não encontrada.'], 404);
        }

        // Atualize os campos diretamente, incluindo a URL da imagem
        $instituicao->update($dados);

        return response()->json($instituicao);
    }

    public function destroy($id)
    {
        $instituicao = Instituicao::findOrFail($id);
        $instituicao->delete();
        return response()->json(null, 204);
    }
}