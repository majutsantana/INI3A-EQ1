<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use Tymon\JWTAuth\Facades\JWTAuth; 

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'login' => 'required|string',
            'senha' => 'required|string',
            'perfil' => 'required|string'
        ]);

        $usuario = Usuario::where('login', $credentials['login'])->first();
        if (!$usuario) {
            return response()->json(['erro' => 'Usuário não encontrado'], 404);
        }

        if (!$usuario->checkSenha($credentials['senha'])) {
            return response()->json(['erro' => 'Senha incorreta'], 401);
        }

        if (!$usuario->checkPerfil($credentials['perfil'])) {
            return response()->json(['erro' => 'Perfil inválido'], 403);
        }

        // Gera o token JWT
        $token = JWTAuth::fromUser($usuario);

        return response()->json([
            'mensagem' => 'Login realizado com sucesso',
            'token' => $token,
            'usuario' => [
                'id' => $usuario->id,
                'login' => $usuario->login,
                'email' => $usuario->email,
            ],
            'perfis' => $usuario->perfis()->pluck('rotulo')
        ]);
    }
}
