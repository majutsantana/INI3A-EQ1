<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "========================================\n";
echo "VERIFICANDO CONEXÃO E DADOS NO BANCO\n";
echo "========================================\n\n";

try {
    // Testar conexão
    $pdo = DB::connection()->getPdo();
    echo "✓ Conexão OK!\n";
    echo "Database: " . DB::connection()->getDatabaseName() . "\n\n";
    
    // Verificar tabelas
    echo "--- VERIFICANDO DADOS ---\n\n";
    
    // Alunos
    $totalAlunos = DB::table('alunos')->where('id_inst', 3)->count();
    echo "Total de alunos (CTI): {$totalAlunos}\n";
    
    // Responsáveis
    $totalResponsaveis = DB::table('responsaveis')->where('id_inst', 3)->count();
    echo "Total de responsáveis (CTI): {$totalResponsaveis}\n";
    
    // Horários dos alunos
    $totalHorariosAlunos = DB::table('horarios_alunos')
        ->join('alunos', 'horarios_alunos.id_aluno', '=', 'alunos.id')
        ->where('alunos.id_inst', 3)
        ->count();
    echo "Total de horários de alunos (CTI): {$totalHorariosAlunos}\n";
    
    // Horários dos responsáveis
    $totalHorariosResponsaveis = DB::table('horarios_responsaveis')
        ->join('responsaveis', 'horarios_responsaveis.id_responsavel', '=', 'responsaveis.id')
        ->where('responsaveis.id_inst', 3)
        ->count();
    echo "Total de horários de responsáveis (CTI): {$totalHorariosResponsaveis}\n";
    
    // Horários da instituição
    $totalHorariosInst = DB::table('horarios_instituicoes')->where('id_inst', 3)->count();
    echo "Total de horários da instituição (CTI): {$totalHorariosInst}\n";
    
    // Veículos
    $totalVeiculos = DB::table('veiculos')
        ->join('responsaveis', 'veiculos.id_resp', '=', 'responsaveis.id')
        ->where('responsaveis.id_inst', 3)
        ->count();
    echo "Total de veículos (CTI): {$totalVeiculos}\n";
    
    // Caronas
    $totalCaronas = DB::table('caronas')
        ->join('alunos', 'caronas.id_aluno', '=', 'alunos.id')
        ->where('alunos.id_inst', 3)
        ->count();
    echo "Total de caronas (CTI): {$totalCaronas}\n\n";
    
    // Mostrar alguns exemplos
    echo "--- EXEMPLOS DE DADOS ---\n\n";
    
    // Primeiros 3 alunos
    $alunos = DB::table('alunos')->where('id_inst', 3)->limit(3)->get();
    echo "Primeiros 3 alunos:\n";
    foreach ($alunos as $aluno) {
        $horarios = DB::table('horarios_alunos')->where('id_aluno', $aluno->id)->count();
        echo "  - {$aluno->nome} (ID: {$aluno->id}, Email: {$aluno->email}, Horários: {$horarios})\n";
    }
    
    echo "\n";
    
    // Primeiros 3 responsáveis
    $responsaveis = DB::table('responsaveis')->where('id_inst', 3)->limit(3)->get();
    echo "Primeiros 3 responsáveis:\n";
    foreach ($responsaveis as $resp) {
        $horarios = DB::table('horarios_responsaveis')->where('id_responsavel', $resp->id)->count();
        $veiculo = DB::table('veiculos')->where('id_resp', $resp->id)->first();
        echo "  - {$resp->nome} (ID: {$resp->id}, Email: {$resp->email}, Horários: {$horarios}, Veículo: " . ($veiculo ? "Sim" : "Não") . ")\n";
    }
    
    echo "\n";
    
    // Horários da instituição
    $horariosInst = DB::table('horarios_instituicoes')->where('id_inst', 3)->get();
    echo "Horários da instituição:\n";
    $dias = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    foreach ($horariosInst as $h) {
        echo "  - {$dias[$h->dia_semana]}: {$h->hora_inicio} - {$h->hora_fim} ({$h->periodo})\n";
    }
    
    echo "\n========================================\n";
    echo "VERIFICAÇÃO CONCLUÍDA!\n";
    echo "========================================\n";
    
} catch (Exception $e) {
    echo "✗ ERRO: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

