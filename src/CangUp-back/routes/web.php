<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AlunoController;

Route::get('/', [AlunoController::class, 'index']);

Route::post('/salvar',
['as' => 'salvar',
'uses'=>'App\Http\Controllers\AlunoController@salvar']);
