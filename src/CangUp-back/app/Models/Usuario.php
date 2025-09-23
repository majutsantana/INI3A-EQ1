<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Usuario extends Authenticatable implements JWTSubject
{
    use HasFactory;

    protected $table = 'usuarios';

    protected $fillable = ['login', 'email', 'senha'];

    protected $hidden = ['senha'];


        public function getAuthPassword()
    {
        return $this->senha; // Isso informa ao Laravel para usar a coluna 'senha'
    }
    /**
     * Criptografa a senha automaticamente ao salvar.
     */
    public function setSenhaAttribute($value)
    {
        $this->attributes['senha'] = bcrypt($value);
    }

    /**
     * Relacionamento com perfis.
     */
    public function perfis()
    {
        return $this->belongsToMany(Perfil::class, 'perfil_usuario');
    }

    /**
     * Verifica a senha usando Hash do Laravel.
     */
    public function checkSenha($senha)
    {
        return Hash::check($senha, $this->senha);
    }

    /**
     * Verifica se o usuário possui um perfil com o rótulo informado.
     */
    public function checkPerfil($rotulo)
    {
        return $this->perfis()->where('rotulo', $rotulo)->exists();
    }

    /**
     * JWT identifier: o ID do usuário.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * JWT custom claims: payloads adicionais (opcional).
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}