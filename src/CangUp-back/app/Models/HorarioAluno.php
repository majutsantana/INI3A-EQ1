<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HorarioAluno extends Model
{
    use HasFactory;

    protected $table = 'horarios_alunos';

    protected $fillable = [
        'id_aluno', 'dia_semana', 'tipo', 'hora', 'habilitado'
    ];

    protected $casts = [
        'hora' => 'datetime:H:i',
        'habilitado' => 'boolean',
    ];

    public function aluno()
    {
        return $this->belongsTo(Aluno::class, 'id_aluno');
    }
}

