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
use Illuminate\Support\Facades\Log;
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
            'login' => 'required|string',
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
        \Log::info('=== INICIANDO RECUPERAÇÃO DE SENHA ===', [
            'email' => $request->email,
            'timestamp' => now()->toDateTimeString()
        ]);

        $request->validate([
            'email' => 'required|email'
        ]);

        $usuario = Usuario::where('email', $request->email)->first();

        if (!$usuario) {
            \Log::warning('Email não encontrado na tabela usuarios', [
                'email' => $request->email
            ]);
            // Por segurança, sempre retorna sucesso mesmo se o email não existir
            return response()->json([
                'message' => 'Se o e-mail existir, você receberá instruções.'
            ], 200);
        }

        \Log::info('Usuário encontrado', [
            'usuario_id' => $usuario->id,
            'email' => $usuario->email
        ]);

        $token = Str::random(60);

        \Log::info('Token gerado', [
            'token_preview' => substr($token, 0, 10) . '...'
        ]);

        // Salvar token no banco
        try {
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                [
                    'token' => $token,
                    'created_at' => now()
                ]
            );
            \Log::info('Token salvo no banco de dados');
        } catch (\Exception $e) {
            \Log::error('Erro ao salvar token no banco', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'detail' => 'Erro ao processar solicitação. Tente novamente.',
                'error' => $e->getMessage()
            ], 500);
        }

        // Buscar nome do usuário (pode estar em alunos, responsaveis ou instituicoes)
        $nome = $usuario->email; // Fallback para email se não encontrar nome
        $aluno = Aluno::where('email', $request->email)->first();
        if ($aluno) {
            $nome = $aluno->nome;
            \Log::info('Nome encontrado na tabela alunos', ['nome' => $nome]);
        } else {
            $responsavel = Responsavel::where('email', $request->email)->first();
            if ($responsavel) {
                $nome = $responsavel->nome;
                \Log::info('Nome encontrado na tabela responsaveis', ['nome' => $nome]);
            } else {
                $instituicao = Instituicao::where('email', $request->email)->first();
                if ($instituicao) {
                    $nome = $instituicao->nome;
                    \Log::info('Nome encontrado na tabela instituicoes', ['nome' => $nome]);
                }
            }
        }

        // Verificar configurações de email antes de tentar enviar
        $mailHost = env('MAIL_HOST');
        $mailUsername = env('MAIL_USERNAME');
        $mailPassword = env('MAIL_PASSWORD');
        
        \Log::info('Configurações de email', [
            'MAIL_MAILER' => env('MAIL_MAILER'),
            'MAIL_HOST' => $mailHost ? 'configurado' : 'NÃO CONFIGURADO',
            'MAIL_PORT' => env('MAIL_PORT'),
            'MAIL_USERNAME' => $mailUsername ? 'configurado' : 'NÃO CONFIGURADO',
            'MAIL_PASSWORD' => $mailPassword ? 'configurado' : 'NÃO CONFIGURADO',
            'MAIL_ENCRYPTION' => env('MAIL_ENCRYPTION'),
            'MAIL_FROM_ADDRESS' => env('MAIL_FROM_ADDRESS'),
        ]);

        if (empty($mailHost) || empty($mailUsername) || empty($mailPassword)) {
            \Log::error('Configurações de email incompletas', [
                'MAIL_HOST' => $mailHost,
                'MAIL_USERNAME' => $mailUsername ? 'preenchido' : 'vazio',
                'MAIL_PASSWORD' => $mailPassword ? 'preenchido' : 'vazio'
            ]);
            return response()->json([
                'detail' => 'Configurações de email não estão completas. Contate o administrador.',
            ], 500);
        }

        // Tentar enviar email
        try {
            \Log::info('Tentando enviar email...', [
                'to' => $request->email,
                'from' => env('MAIL_FROM_ADDRESS')
            ]);

            $mailResult = Mail::to($request->email)->send(new ResetSenhaMail($request->email, $nome, $token));
            
            \Log::info('Email enviado com sucesso!', [
                'email' => $request->email,
                'result' => $mailResult ? 'sucesso' : 'falha'
            ]);

        } catch (\Swift_TransportException $e) {
            \Log::error('Erro de transporte ao enviar email (Swift_TransportException)', [
                'error' => $e->getMessage(),
                'email' => $request->email,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'detail' => 'Erro ao conectar ao servidor de email. Verifique as configurações.',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Erro ao enviar email de recuperação de senha', [
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'email' => $request->email,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'detail' => 'Erro ao enviar email. Verifique as configurações de email no servidor.',
                'error' => $e->getMessage()
            ], 500);
        }

        \Log::info('=== RECUPERAÇÃO DE SENHA CONCLUÍDA COM SUCESSO ===');

        // Por segurança, sempre retorna a mesma mensagem
        return response()->json([
            'message' => 'Se o e-mail existir, você receberá instruções.'
        ], 200);
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
