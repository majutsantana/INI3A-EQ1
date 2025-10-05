<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aluno extends Model
{
    use HasFactory;

    protected $table = 'alunos';

    protected $fillable = [
        'nome', 'cpf', 'ra', 'email', 'genero', 'endereco', 'telefone', 'imagem', 'id_inst'     
    ];

    public function instituicao()
    {
        return $this->belongsTo(Instituicao::class, 'id_inst');
    }
}