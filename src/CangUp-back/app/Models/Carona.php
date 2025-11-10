<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Carona extends Model
{
    use HasFactory;

    protected $table = 'caronas';

    protected $fillable = [
        'id_aluno', 'id_responsavel', 'dia_semana', 'tipo', 'hora',
        'status', 'distancia_km', 'data_solicitacao', 'data_aceitacao'
    ];

    protected $casts = [
        'hora' => 'string', // Mantém como string (formato HH:mm)
        'distancia_km' => 'decimal:2',
        'data_solicitacao' => 'datetime',
        'data_aceitacao' => 'datetime',
    ];

    public function aluno()
    {
        return $this->belongsTo(Aluno::class, 'id_aluno');
    }

    public function responsavel()
    {
        return $this->belongsTo(Responsavel::class, 'id_responsavel');
    }
}

