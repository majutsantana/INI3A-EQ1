<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Instituicao extends Model
{
    protected $fillable = [
        'nome', 'endereco', 'horario', 'telefone', 'senha', 'email', 'plano'
    ];
}
