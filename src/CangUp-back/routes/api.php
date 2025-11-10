<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AlunoController;
use App\Http\Controllers\InstituicaoController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ResponsavelController;
use App\Http\Controllers\VeiculoController;
use App\Http\Controllers\HorarioController;
use App\Http\Controllers\CaronaController;

Route::post('/login', [LoginController::class, 'login']);
Route::post('/recuperar-senha', [LoginController::class, 'recuperarSenha']);


// --- Cadastros Públicos ---
Route::post('/cadastrarInst', [InstituicaoController::class, 'cadastrarInst']);
Route::post('/cadastrarResponsavel', [ResponsavelController::class, 'cadastrarResponsavel']);
Route::post('/cadastrarAluno', [AlunoController::class, 'cadastrarAluno']);
Route::post('/efetivarAluno', [AlunoController::class, 'efetivarAluno']);
Route::post('/efetivarResponsavel', [ResponsavelController::class, 'efetivarResponsavel']);


// --- Consultas Públicas ---
Route::get('/perfis', [PerfilController::class, 'getAll']);
Route::get('/instituicoes', [InstituicaoController::class, 'index']); // Listar todas as instituições

//======================================================================
// ROTAS PROTEGIDAS (Precisam de autenticação via JWT)
//======================================================================
Route::middleware(['jwt.auth'])->group(function () {


    // --- Autenticação (dentro da área protegida) ---
    Route::post('/logout', [LoginController::class, 'logout']);


    // --- Usuário Autenticado ---
    Route::get('/usuario', [UserController::class, 'me']); 


    Route::get('/instituicoes/{id}', [InstituicaoController::class, 'show']);      // Listar uma instituição
    Route::post('/instituicoes', [InstituicaoController::class, 'store']);       // Criar instituição (protegido)
    Route::put('/instituicoes/{id}', [InstituicaoController::class, 'update']);    // Atualizar instituição
    Route::delete('/instituicoes/{id}', [InstituicaoController::class, 'destroy']);  // Deletar instituição

    Route::get('/alunos/{id}', [AlunoController::class, 'show']);      
    Route::post('/alunos', [AlunoController::class, 'store']);       
    Route::put('/alunos/{id}', [AlunoController::class, 'update']);    
    Route::delete('/alunos/{id}', [AlunoController::class, 'destroy']); 
    Route::get('/alunos', [AlunoController::class, 'index']); // Listar todas as instituições


    Route::get('/responsaveis/{id}', [ResponsavelController::class, 'show']);     
    Route::post('/responsaveis', [ResponsavelController::class, 'store']);       
    Route::put('/responsaveis/{id}', [ResponsavelController::class, 'update']);    
    Route::delete('/responsaveis/{id}', [ResponsavelController::class, 'destroy']);
    Route::get('/responsaveis', [ResponsavelController::class, 'index']); // Listar todas as instituições 

    // --- Cadastros Protegidos ---
    Route::post('/cadastrarAdmin', [AdminController::class, 'store']);
    Route::post('/preCadastrarAluno', [AlunoController::class, 'preCadastrarAlun']);
    Route::post('/preCadastrarResponsavel', [ResponsavelController::class, 'preCadastrarResp']);

    Route::post('/cadastrarVeiculo', [VeiculoController::class, 'cadastrarVeiculo']);

    // --- Horários ---
    Route::get('/instituicoes/{id}/horarios', [HorarioController::class, 'getHorariosInstituicao']);
    Route::post('/instituicoes/{id}/horarios', [HorarioController::class, 'salvarHorariosInstituicao']);
    
    Route::get('/alunos/{id}/horarios', [HorarioController::class, 'getHorariosAluno']);
    Route::post('/alunos/{id}/horarios', [HorarioController::class, 'salvarHorariosAluno']);
    
    Route::get('/responsaveis/{id}/horarios', [HorarioController::class, 'getHorariosResponsavel']);
    Route::post('/responsaveis/{id}/horarios', [HorarioController::class, 'salvarHorariosResponsavel']);

    // --- Caronas ---
    Route::get('/alunos/{id}/responsaveis-disponiveis', [CaronaController::class, 'getResponsaveisDisponiveis']);
    Route::post('/caronas/solicitar', [CaronaController::class, 'solicitarCarona']);
    
    Route::get('/responsaveis/{id}/solicitacoes-pendentes', [CaronaController::class, 'getSolicitacoesPendentes']);
    Route::post('/caronas/{id}/aceitar', [CaronaController::class, 'aceitarCarona']);
    Route::post('/caronas/{id}/recusar', [CaronaController::class, 'recusarCarona']);
    Route::post('/caronas/{id}/cancelar', [CaronaController::class, 'cancelarCarona']);
    
    Route::get('/alunos/{id}/caronas-aceitas', [CaronaController::class, 'getCaronasAceitasAluno']);
    Route::get('/responsaveis/{id}/caronas-aceitas', [CaronaController::class, 'getCaronasAceitasResponsavel']);
    Route::get('/responsaveis/{id}/rota-alunos', [CaronaController::class, 'getRotaAlunosAceitos']);

   
});
