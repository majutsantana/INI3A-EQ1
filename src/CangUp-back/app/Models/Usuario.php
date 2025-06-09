<?php
namespace App\Models; //modificado para fazer a parte de Login

use Illuminate\Database\Eloquent\HasFactory;
use Illuminate\Support\Facades\Model;

class Usuario extends Model
{
    protected $table = 'usuarios';

    protected $fillable = ['login', 'email', 'senha'];

    protected $hidden = ['senha'];

    // Criptografa automaticamente a senha com bcrypt ao salvar
    public function setSenhaAttribute($value)
    {
        $this->attributes['senha'] = bcrypt($value);
    }

    public function perfis()
    {
        return $this->belongsToMany(Perfil::class, 'perfil_usuario');
    }

    public function checkSenha($senha)
    {
        return Hash::check($senha, $this->senha);
    }

    public function checkPerfil($rotulo)
    {
        return $this->perfis()->where('rotulo', $rotulo)->exists();
    }
}