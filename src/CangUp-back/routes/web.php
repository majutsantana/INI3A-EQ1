<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AlunoController;

Route::get('/', [AlunoController::class, 'index']);

Route::get('/abcd', [AlunoController::class, 'index']);


Route::post('/cadastrar',
['as' => 'cadastrar',
'uses'=>'App\Http\Controllers\AlunoController@cadastrar']);
