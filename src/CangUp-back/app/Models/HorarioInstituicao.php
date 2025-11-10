<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HorarioInstituicao extends Model
{
    use HasFactory;

    protected $table = 'horarios_instituicoes';

    protected $fillable = [
        'id_inst', 'dia_semana', 'periodo', 'hora_inicio', 'hora_fim'
    ];

    protected $casts = [
        'hora_inicio' => 'datetime:H:i',
        'hora_fim' => 'datetime:H:i',
    ];

    public function instituicao()
    {
        return $this->belongsTo(Instituicao::class, 'id_inst');
    }
}

