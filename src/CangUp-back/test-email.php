<?php
/**
 * Script de teste para verificar envio de email
 * Execute: php test-email.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

echo "=== TESTE DE ENVIO DE EMAIL ===\n\n";

// Verificar configurações
echo "1. Verificando configurações...\n";
echo "   MAIL_MAILER: " . env('MAIL_MAILER') . "\n";
echo "   MAIL_HOST: " . env('MAIL_HOST') . "\n";
echo "   MAIL_PORT: " . env('MAIL_PORT') . "\n";
echo "   MAIL_USERNAME: " . (env('MAIL_USERNAME') ? 'configurado' : 'NÃO CONFIGURADO') . "\n";
echo "   MAIL_PASSWORD: " . (env('MAIL_PASSWORD') ? 'configurado' : 'NÃO CONFIGURADO') . "\n";
echo "   MAIL_ENCRYPTION: " . env('MAIL_ENCRYPTION') . "\n";
echo "   MAIL_FROM_ADDRESS: " . env('MAIL_FROM_ADDRESS') . "\n";
echo "   MAIL_FROM_NAME: " . env('MAIL_FROM_NAME') . "\n\n";

// Testar envio
$emailTeste = 'jhou1607@gmail.com'; // Altere para seu email de teste

echo "2. Tentando enviar email para: $emailTeste\n";

try {
    Mail::raw('Teste de email do CangUp! Se você recebeu isso, o email está funcionando.', function($message) use ($emailTeste) {
        $message->to($emailTeste)
                ->subject('Teste de Email - CangUp');
    });
    
    echo "   ✓ Email enviado com sucesso!\n";
    echo "   Verifique sua caixa de entrada (e spam) em: $emailTeste\n\n";
    
} catch (\Swift_TransportException $e) {
    echo "   ✗ Erro de transporte: " . $e->getMessage() . "\n";
    echo "   Verifique as configurações de SMTP no .env\n\n";
} catch (\Exception $e) {
    echo "   ✗ Erro: " . $e->getMessage() . "\n";
    echo "   Classe: " . get_class($e) . "\n\n";
}

echo "=== FIM DO TESTE ===\n";

