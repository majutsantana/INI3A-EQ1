<?php
namespace App\Http\Controllers;

use App\Models\Instituicao;
use Illuminate\Http\Request;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth; 

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'login' => 'required|string|email',
            'senha' => 'required|string',
            'perfil' => 'required|string'
        ]);

        $usuario = Usuario::where('login', $credentials['login'])->first();
        if (!$usuario || !Hash::check($credentials['senha'], $usuario->senha)) {
            return response()->json(['detail' => 'Credenciais inválidas.'], 401);
        }

        if (!$usuario->checkPerfil($credentials['perfil'])) {
            return response()->json(['detail' => 'Acesso não autorizado para este perfil.'], 403);
        }

        $token = JWTAuth::fromUser($usuario);
        $responsePayload = [
            'mensagem' => 'Login realizado com sucesso',
            'token' => $token,
            'user_id' => $usuario->id,
            'usuario' => [
                'id' => $usuario->id,
                'login' => $usuario->login,
                'email' => $usuario->email,
            ],
            'perfis' => $usuario->perfis()->pluck('rotulo')
        ];
        
        if ($credentials['perfil'] === 'inst') {
            $instituicao = Instituicao::where('email', $usuario->email)->first();
            if ($instituicao) {
                $responsePayload['id_instituicao'] = $instituicao->id;
            }
        }

        return response()->json($responsePayload, 200);
    }
}
