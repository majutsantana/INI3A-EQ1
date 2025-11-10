<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HorarioResponsavel extends Model
{
    use HasFactory;

    protected $table = 'horarios_responsaveis';

    protected $fillable = [
        'id_responsavel', 'dia_semana', 'tipo', 'hora', 'habilitado'
    ];

    protected $casts = [
        'hora' => 'datetime:H:i',
        'habilitado' => 'boolean',
    ];

    public function responsavel()
    {
        return $this->belongsTo(Responsavel::class, 'id_responsavel');
    }
}

