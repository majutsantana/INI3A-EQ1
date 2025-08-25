<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AlunoController;
use App\Http\Controllers\InstituicaoController;
use App\Http\Controllers\LoginController; //Adicionado para o Back do Login
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PerfilController;

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

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

// Grupo de rotas protegidas por JWT
Route::middleware(['jwt.auth'])->group(function () {

    Route::post('/preCadastrarAluno', [AlunoController::class, 'preCadastrarAlun']);

    Route::post('/cadastrarResp', [ResponsavelController::class, 'cadastrarResp']);

    Route::get("/perfis", [PerfilController::class, 'getAll']);


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

});


// Rota pública de login
Route::post('/login', [LoginController::class, 'login']);

Route::post('/cadastrarInst', [InstituicaoController::class, 'cadastrarInst']);




