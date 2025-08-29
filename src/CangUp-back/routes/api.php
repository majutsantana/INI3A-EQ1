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

<<<<<<< HEAD
Route::post('/cadastrarResp', [ResponsavelController::class, 'cadastrarResp']);



Route::get('instituicoes/', [InstituicaoController::class, 'index']);      // listar todas
Route::get('instituicoes/{id}', [InstituicaoController::class, 'show']);   // listar uma
Route::post('instituicoes/', [InstituicaoController::class, 'store']);     // criar
Route::put('instituicoes/{id}', [InstituicaoController::class, 'update']); // atualizar
Route::delete('instituicoes/{id}', [InstituicaoController::class, 'destroy']); // deletar


Route::post('/cadastrarAdmin', [AdminController::class, 'store']);


// Exemplo: pegar dados do usuário autenticado
Route::get('/usuario', [UserController::class, 'me']);

// Exemplo: logout (invalida token)
Route::post('/logout', [LoginController::class, 'logout']);



// Rota pública de login
=======
// --- Autenticação e Recuperação de Senha ---
>>>>>>> 5392999ccd141e063647a6fc1c126fd0ccf01c64
Route::post('/login', [LoginController::class, 'login']);
Route::post('/recuperar-senha', [LoginController::class, 'recuperarSenha']);

// --- Cadastros Públicos ---
Route::post('/cadastrarInst', [InstituicaoController::class, 'cadastrarInst']);
Route::post('/cadastrarResp', [ResponsavelController::class, 'cadastrarResp']);
Route::post('/efetivarAluno', [AlunoController::class, 'efetivarAluno']);
Route::post('/cadastrarAluno', [AlunoController::class, 'cadastrarAluno']);


// --- Consultas Públicas ---
<<<<<<< HEAD
Route::get('instituicoes/', [InstituicaoController::class, 'index']); // Listar todas as instituições
Route::get("/perfis", [PerfilController::class, 'getAll']);
=======
Route::get('/instituicoes', [InstituicaoController::class, 'index']); // Listar todas as instituições
Route::get('/perfis', [PerfilController::class, 'getAll']);
>>>>>>> 5392999ccd141e063647a6fc1c126fd0ccf01c64


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
