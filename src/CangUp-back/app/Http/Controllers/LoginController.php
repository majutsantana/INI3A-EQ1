<?php

namespace App\Http\Controllers;

use App\Models\Instituicao;
use App\Models\Responsavel;
use App\Models\Aluno;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Mail\ResetSenhaMail;

class LoginController extends Controller
{
    /**
     * Login do usuário com verificação de perfil.
     */
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
        else if ($credentials['perfil'] === 'resp') {
            $responsavel = Responsavel::where('email', $usuario->email)->first();
            if ($responsavel) {
                $responsePayload['id_responsavel'] = $responsavel->id;
            }
        }
        else if ($credentials['perfil'] === 'alun') {
            $aluno = Aluno::where('email', $usuario->email)->first();
            if ($aluno) {
                $responsePayload['id_aluno'] = $aluno->id;
            }
        }

        return response()->json($responsePayload, 200);
    }

    /**
     * Envia e-mail com link/token de recuperação de senha.
     */
    public function recuperarSenha(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $usuario = Usuario::where('email', $request->email)->first();

        if (!$usuario) {
            return response()->json(['detail' => 'E-mail não encontrado.'], 404);
        }

        $token = Str::random(60);

        DB::table('password_reset_tokens')->updateOrInsert(
            [
                'email' => $request->email,
                'token' => $token,
                'created_at' => now()
            ]
        );

        Mail::to($request->email)->send(new ResetSenhaMail($request->email, $usuario->nome, $token));

        return response()->json(['message' => 'E-mail de recuperação enviado com sucesso.']);
    }

    /**
     * Redefine a senha com base no token de recuperação.
     */
    public function redefinirSenha(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'senha' => 'required|min:6|confirmed',
        ]);

        $registro = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$registro) {
            return response()->json(['detail' => 'Token inválido ou expirado.'], 400);
        }

        $usuario = Usuario::where('email', $request->email)->first();

        if (!$usuario) {
            return response()->json(['detail' => 'Usuário não encontrado.'], 404);
        }

        $usuario->senha = Hash::make($request->senha);
        $usuario->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Senha redefinida com sucesso.']);
    }
}
