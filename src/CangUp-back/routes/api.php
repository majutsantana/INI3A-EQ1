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


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


// A rota padrão do Sanctum foi comentada pois não está em uso no projeto.
// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });




//======================================================================
// ROTAS PÚBLICAS (Não precisam de autenticação)
//======================================================================




// Rota pública de login
// --- Autenticação e Recuperação de Senha ---
Route::post('/login', [LoginController::class, 'login']);
Route::post('/recuperar-senha', [LoginController::class, 'recuperarSenha']);


// --- Cadastros Públicos ---
Route::post('/cadastrarInst', [InstituicaoController::class, 'cadastrarInst']);
Route::post('/cadastrarResponsavel', [ResponsavelController::class, 'cadastrarResponsavel']);
Route::post('/cadastrarAluno', [AlunoController::class, 'cadastrarAluno']);
Route::post('/efetivarAluno', [AlunoController::class, 'efetivarAluno']);
Route::post('/efetivarResponsavel', [ResponsavelController::class, 'efetivarResponsavel']);


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


    // --- Gerenciamento de Instituições (CRUD completo para usuários autenticados) ---
    Route::get('/instituicoes/{id}', [InstituicaoController::class, 'show']);      // Listar uma instituição
    Route::post('/instituicoes', [InstituicaoController::class, 'store']);       // Criar instituição (protegido)
    Route::put('/instituicoes/{id}', [InstituicaoController::class, 'update']);    // Atualizar instituição
    Route::delete('/instituicoes/{id}', [InstituicaoController::class, 'destroy']);  // Deletar instituição

    Route::get('/alunos/{id}', [AlunoController::class, 'show']);      // Listar uma instituição
    Route::post('/alunos', [AlunoController::class, 'store']);       // Criar instituição (protegido)
    Route::put('/alunos/{id}', [AlunoController::class, 'update']);    // Atualizar instituição
    Route::delete('/alunos/{id}', [AlunoController::class, 'destroy']);  // Deletar instituição

    Route::get('/responsaveis/{id}', [ResponsavelController::class, 'show']);      // Listar uma instituição
    Route::post('/responsaveis', [ResponsavelController::class, 'store']);       // Criar instituição (protegido)
    Route::put('/responsaveis/{id}', [ResponsavelController::class, 'update']);    // Atualizar instituição
    Route::delete('/responsaveis/{id}', [ResponsavelController::class, 'destroy']);  // Deletar instituição*/

    // --- Cadastros Protegidos ---
    Route::post('/cadastrarAdmin', [AdminController::class, 'store']);
    Route::post('/preCadastrarAluno', [AlunoController::class, 'preCadastrarAlun']);
    Route::post('/preCadastrarResponsavel', [ResponsavelController::class, 'preCadastrarResp']);

    Route::post('/cadastrarVeiculo', [VeiculoController::class, 'cadastrarVeiculo']);

   
});
