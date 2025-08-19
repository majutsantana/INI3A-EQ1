<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Instituicao extends Model
{
    use HasFactory;

    protected $table = 'instituicoes';

    protected $fillable = [
        'nome', 'email', 'endereco', 'cnpj', 'telefone', 'plano'
    ];

    public function alunos()
    {
        return $this->hasMany(Aluno::class, 'id_inst');
    }
}
