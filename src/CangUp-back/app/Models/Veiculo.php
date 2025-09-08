<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Veiculo extends Model
{
    use HasFactory;

    protected $table = 'veiculos';

    protected $fillable = [
        'modelo', 'placa', 'cor', 'qtde_assentos', 'id_resp'     
    ];

    public function responsavel()
    {
        return $this->belongsTo(Responsavel::class, 'id_resp');
    }
}
