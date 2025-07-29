<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Instituicao extends Model
{
    protected $fillable = [
        'nome', 'email', 'endereco', 'cnpj', 'telefone', 'senha', 'plano'
    ];
}
