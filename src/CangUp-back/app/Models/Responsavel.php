<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Responsavel extends Model
{
    protected $fillable = [
        'nome', 'cpf', 'email', 'telefone', 'senha'
    ];
}
