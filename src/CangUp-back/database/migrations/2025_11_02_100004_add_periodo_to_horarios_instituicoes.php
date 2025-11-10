<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('horarios_instituicoes', function (Blueprint $table) {
            $table->string('periodo', 50)->nullable()->after('dia_semana');
        });
        
        // Adiciona índice para melhor performance (permite múltiplos períodos por dia)
        Schema::table('horarios_instituicoes', function (Blueprint $table) {
            $table->index(['id_inst', 'dia_semana']);
        });
    }

    public function down(): void
    {
        // Remove índice se existir
        $indexName = 'horarios_instituicoes_id_inst_dia_semana_index';
        $indexExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM pg_indexes 
            WHERE tablename = 'horarios_instituicoes' 
            AND indexname = ?
        ", [$indexName]);
        
        if ($indexExists && $indexExists->count > 0) {
            DB::statement("DROP INDEX IF EXISTS {$indexName}");
        }
        
        Schema::table('horarios_instituicoes', function (Blueprint $table) {
            $table->dropColumn('periodo');
        });
    }
};

