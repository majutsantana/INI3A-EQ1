<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Responsavel extends Model
{
    use HasFactory;
    
    protected $table = 'responsaveis';

    protected $fillable = [
        'nome', 'cpf', 'email', 'telefone', 'id_inst'
    ];


    public function instituicao()
    {
        return $this->belongsTo(Instituicao::class, 'id_inst');
    }
}


