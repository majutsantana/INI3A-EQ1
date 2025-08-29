<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AlunoController;
use App\Http\Controllers\InstituicaoController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ResponsavelController; // Importação adicionada

// A linha abaixo foi comentada pois é um exemplo padrão e não faz parte das suas rotas de aplicação.
// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });


//======================================================================
// ROTAS PÚBLICAS (Não precisam de autenticação)
//======================================================================

// --- Autenticação e Recuperação de Senha ---
Route::post('/login', [LoginController::class, 'login']);
Route::post('/recuperar-senha', [LoginController::class, 'recuperarSenha']);

// --- Cadastros Públicos ---
Route::post('/cadastrarInst', [InstituicaoController::class, 'cadastrarInst']);
Route::post('/cadastrarResp', [ResponsavelController::class, 'cadastrarResp']);
Route::post('/efetivarAluno', [AlunoController::class, 'efetivarAluno']);
Route::post('/cadastrarAluno', [AlunoController::class, 'cadastrarAluno']);


// --- Consultas Públicas ---
Route::get('/instituicoes', [InstituicaoController::class, 'index']); // Listar todas as instituições
Route::get('/perfis', [PerfilController::class, 'getAll']);


//======================================================================
// ROTAS PROTEGIDAS (Precisam de autenticação via JWT)
//======================================================================
Route::middleware(['jwt.auth'])->group(function () {

    // --- Autenticação (dentro da área protegida) ---
    Route::post('/logout', [LoginController::class, 'logout']);

    // --- Usuário Autenticado ---
    Route::get('/usuario', [UserController::class, 'me']); // Pega dados do usuário logado

    // --- Gerenciamento de Instituições (CRUD completo) ---
    Route::get('/instituicoes/{id}', [InstituicaoController::class, 'show']);       // Listar uma instituição
    Route::post('/instituicoes', [InstituicaoController::class, 'store']);         // Criar instituição
    Route::put('/instituicoes/{id}', [InstituicaoController::class, 'update']);      // Atualizar instituição
    Route::delete('/instituicoes/{id}', [InstituicaoController::class, 'destroy']);    // Deletar instituição

    // --- Cadastros Protegidos ---
    Route::post('/cadastrarAdmin', [AdminController::class, 'store']);
    Route::post('/preCadastrarAluno', [AlunoController::class, 'preCadastrarAlun']);
    
});
