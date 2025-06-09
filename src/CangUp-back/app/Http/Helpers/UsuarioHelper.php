<?php
namespace App\Helpers; //Helper centraliza a lógica do programa 

use App\Models\Usuario;
use Illuminate\Support\Facades\Auth;

class UsuarioHelper
{
    /**
     * Verifica se o usuário autenticado possui o perfil informado pela instituição
     *
     * @param string $rotulo
     * @return bool
     */
    public static function hasPerfil(string $rotulo): bool
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return false;
        }

        return $usuario->checkPerfil($rotulo);
    }
}