<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserController extends Controller
{
    public function me(Request $request)
    {
        $usuario = JWTAuth::parseToken()->authenticate();
        return response()->json($usuario);
    }

    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate(JWTAuth::parseToken());
            return response()->json(['mensagem' => 'Logout realizado com sucesso']);
        } catch (\Exception $e) {
            return response()->json(['erro' => 'Erro ao fazer logout'], 500);
        }
    }

}
