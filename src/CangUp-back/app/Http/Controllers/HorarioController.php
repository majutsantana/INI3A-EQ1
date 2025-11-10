<?php

namespace App\Http\Controllers;

use App\Models\HorarioInstituicao;
use App\Models\HorarioAluno;
use App\Models\HorarioResponsavel;
use App\Models\Instituicao;
use App\Models\Aluno;
use App\Models\Responsavel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class HorarioController extends Controller
{
    // ===== HORÁRIOS DA INSTITUIÇÃO =====
    
    public function getHorariosInstituicao($idInst)
    {
        $horarios = HorarioInstituicao::where('id_inst', $idInst)
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();
        
        // Agrupa por dia da semana
        $resultado = [];
        for ($dia = 1; $dia <= 6; $dia++) {
            $periodosDoDia = $horarios->where('dia_semana', $dia)->values();
            $periodos = [];
            foreach ($periodosDoDia as $horario) {
                // Garante que retorna apenas HH:mm (sem segundos)
                $horaInicio = $horario->hora_inicio;
                $horaFim = $horario->hora_fim;
                
                // Se for um objeto Carbon/DateTime, converte para string HH:mm
                if (is_object($horaInicio)) {
                    $horaInicio = $horaInicio->format('H:i');
                } elseif (is_string($horaInicio) && strlen($horaInicio) > 5) {
                    // Se tem mais de 5 caracteres (HH:mm:ss), remove os segundos
                    $horaInicio = substr($horaInicio, 0, 5);
                }
                
                if (is_object($horaFim)) {
                    $horaFim = $horaFim->format('H:i');
                } elseif (is_string($horaFim) && strlen($horaFim) > 5) {
                    $horaFim = substr($horaFim, 0, 5);
                }
                
                $periodos[] = [
                    'id' => $horario->id,
                    'periodo' => $horario->periodo,
                    'inicio' => $horaInicio,
                    'fim' => $horaFim,
                ];
            }
            $resultado[] = [
                'dia_semana' => $dia,
                'periodos' => $periodos,
            ];
        }
        
        return response()->json($resultado);
    }

    public function salvarHorariosInstituicao(Request $request, $idInst)
    {
        $request->validate([
            'horarios' => 'required|array',
            'horarios.*.dia_semana' => 'required|integer|min:1|max:6',
            'horarios.*.periodos' => 'required|array',
        ]);

        // Validação manual dos períodos
        foreach ($request->horarios as $diaData) {
            if (!isset($diaData['dia_semana']) || !is_numeric($diaData['dia_semana']) || $diaData['dia_semana'] < 1 || $diaData['dia_semana'] > 6) {
                return response()->json(['error' => 'Dia da semana inválido'], 422);
            }
            
            if (!isset($diaData['periodos']) || !is_array($diaData['periodos'])) {
                return response()->json(['error' => 'Períodos devem ser um array'], 422);
            }
            
            foreach ($diaData['periodos'] as $periodoData) {
                if (isset($periodoData['inicio']) || isset($periodoData['fim'])) {
                    // Se tem início ou fim, ambos devem estar presentes
                    if (!isset($periodoData['inicio']) || !isset($periodoData['fim'])) {
                        return response()->json(['error' => 'Período deve ter início e fim preenchidos'], 422);
                    }
                    
                    // Validar formato de hora
                    if (!preg_match('/^\d{2}:\d{2}$/', $periodoData['inicio'])) {
                        return response()->json(['error' => 'Formato de horário de início inválido. Use HH:mm'], 422);
                    }
                    if (!preg_match('/^\d{2}:\d{2}$/', $periodoData['fim'])) {
                        return response()->json(['error' => 'Formato de horário de fim inválido. Use HH:mm'], 422);
                    }
                    
                    // Validar período (string)
                    if (isset($periodoData['periodo']) && strlen($periodoData['periodo']) > 50) {
                        return response()->json(['error' => 'Nome do período deve ter no máximo 50 caracteres'], 422);
                    }
                }
            }
        }

        try {
            DB::beginTransaction();

            // Remove todos os horários existentes da instituição
            HorarioInstituicao::where('id_inst', $idInst)->delete();

            foreach ($request->horarios as $diaData) {
                $diaSemana = $diaData['dia_semana'];
                
                foreach ($diaData['periodos'] as $periodoData) {
                    if (isset($periodoData['inicio']) && isset($periodoData['fim']) && 
                        !empty($periodoData['inicio']) && !empty($periodoData['fim'])) {
                        
                        // Validar que início é antes do fim
                        if (strtotime($periodoData['inicio']) >= strtotime($periodoData['fim'])) {
                            DB::rollBack();
                            return response()->json(['error' => 'Horário de início deve ser anterior ao horário de fim'], 422);
                        }

                        // Criar novo período
                        HorarioInstituicao::create([
                            'id_inst' => $idInst,
                            'dia_semana' => $diaSemana,
                            'periodo' => $periodoData['periodo'] ?? null,
                            'hora_inicio' => $periodoData['inicio'],
                            'hora_fim' => $periodoData['fim'],
                        ]);
                    }
                }
            }

            DB::commit();
            return response()->json(['message' => 'Horários salvos com sucesso']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Dados inválidos',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erro ao salvar horários da instituição', [
                'id_inst' => $idInst,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Erro ao salvar horários: ' . $e->getMessage()], 500);
        }
    }

    // ===== HORÁRIOS DO ALUNO =====

    public function getHorariosAluno($idAluno)
    {
        $horarios = HorarioAluno::where('id_aluno', $idAluno)->get();
        
        $resultado = [];
        for ($dia = 1; $dia <= 6; $dia++) {
            $entrada = $horarios->where('dia_semana', $dia)->where('tipo', 'entrada')->first();
            $saida = $horarios->where('dia_semana', $dia)->where('tipo', 'saida')->first();
            
            $resultado[] = [
                'dia_semana' => $dia,
                'entrada' => $entrada ? $entrada->hora : null,
                'entradaHabilitada' => $entrada ? $entrada->habilitado : true,
                'saida' => $saida ? $saida->hora : null,
                'saidaHabilitada' => $saida ? $saida->habilitado : true,
            ];
        }
        
        return response()->json($resultado);
    }

    public function salvarHorariosAluno(Request $request, $idAluno)
    {
        $request->validate([
            'horarios' => 'required|array',
            'horarios.*.dia_semana' => 'required|integer|min:1|max:6',
            'horarios.*.entrada' => 'nullable|string',
            'horarios.*.saida' => 'nullable|string',
            'horarios.*.entradaHabilitada' => 'boolean',
            'horarios.*.saidaHabilitada' => 'boolean',
        ]);

        // Validação manual de formato de hora para campos não nulos
        foreach ($request->horarios as $horarioData) {
            if (!empty($horarioData['entrada']) && $horarioData['entrada'] !== null && $horarioData['entrada'] !== '--:--' && !preg_match('/^\d{2}:\d{2}$/', $horarioData['entrada'])) {
                return response()->json(['error' => 'Formato de horário de entrada inválido. Use HH:mm'], 422);
            }
            if (!empty($horarioData['saida']) && $horarioData['saida'] !== null && $horarioData['saida'] !== '--:--' && !preg_match('/^\d{2}:\d{2}$/', $horarioData['saida'])) {
                return response()->json(['error' => 'Formato de horário de saída inválido. Use HH:mm'], 422);
            }
        }

        // Buscar instituição do aluno para validar horários
        $aluno = Aluno::findOrFail($idAluno);
        $instituicao = Instituicao::findOrFail($aluno->id_inst);
        $horariosInstituicao = HorarioInstituicao::where('id_inst', $instituicao->id)->get();

        try {
            DB::beginTransaction();

            foreach ($request->horarios as $horarioData) {
                // Validar entrada (só valida se estiver habilitado E tiver valor válido)
                if ($horarioData['entradaHabilitada'] && !empty($horarioData['entrada']) && $horarioData['entrada'] !== null && $horarioData['entrada'] !== '--:--') {
                    $this->validarHorarioDentroPeriodoInstituicao(
                        $horarioData['dia_semana'],
                        $horarioData['entrada'],
                        $horariosInstituicao
                    );

                    HorarioAluno::updateOrCreate(
                        [
                            'id_aluno' => $idAluno,
                            'dia_semana' => $horarioData['dia_semana'],
                            'tipo' => 'entrada',
                        ],
                        [
                            'hora' => $horarioData['entrada'],
                            'habilitado' => true,
                        ]
                    );
                } else {
                    HorarioAluno::where('id_aluno', $idAluno)
                        ->where('dia_semana', $horarioData['dia_semana'])
                        ->where('tipo', 'entrada')
                        ->delete();
                }

                // Validar saída (só valida se estiver habilitado E tiver valor válido)
                if ($horarioData['saidaHabilitada'] && !empty($horarioData['saida']) && $horarioData['saida'] !== null && $horarioData['saida'] !== '--:--') {
                    $this->validarHorarioDentroPeriodoInstituicao(
                        $horarioData['dia_semana'],
                        $horarioData['saida'],
                        $horariosInstituicao
                    );

                    HorarioAluno::updateOrCreate(
                        [
                            'id_aluno' => $idAluno,
                            'dia_semana' => $horarioData['dia_semana'],
                            'tipo' => 'saida',
                        ],
                        [
                            'hora' => $horarioData['saida'],
                            'habilitado' => true,
                        ]
                    );
                } else {
                    HorarioAluno::where('id_aluno', $idAluno)
                        ->where('dia_semana', $horarioData['dia_semana'])
                        ->where('tipo', 'saida')
                        ->delete();
                }
            }

            DB::commit();
            return response()->json(['message' => 'Horários salvos com sucesso']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ===== HORÁRIOS DO RESPONSÁVEL =====

    public function getHorariosResponsavel($idResponsavel)
    {
        $horarios = HorarioResponsavel::where('id_responsavel', $idResponsavel)->get();
        
        $resultado = [];
        for ($dia = 1; $dia <= 6; $dia++) {
            $entrada = $horarios->where('dia_semana', $dia)->where('tipo', 'entrada')->first();
            $saida = $horarios->where('dia_semana', $dia)->where('tipo', 'saida')->first();
            
            $resultado[] = [
                'dia_semana' => $dia,
                'entrada' => $entrada ? $entrada->hora : null,
                'entradaHabilitada' => $entrada ? $entrada->habilitado : true,
                'saida' => $saida ? $saida->hora : null,
                'saidaHabilitada' => $saida ? $saida->habilitado : true,
            ];
        }
        
        return response()->json($resultado);
    }

    public function salvarHorariosResponsavel(Request $request, $idResponsavel)
    {
        $request->validate([
            'horarios' => 'required|array',
            'horarios.*.dia_semana' => 'required|integer|min:1|max:6',
            'horarios.*.entrada' => 'nullable|string',
            'horarios.*.saida' => 'nullable|string',
            'horarios.*.entradaHabilitada' => 'boolean',
            'horarios.*.saidaHabilitada' => 'boolean',
        ]);

        // Validação manual de formato de hora para campos não nulos
        foreach ($request->horarios as $horarioData) {
            if (!empty($horarioData['entrada']) && $horarioData['entrada'] !== null && $horarioData['entrada'] !== '--:--' && !preg_match('/^\d{2}:\d{2}$/', $horarioData['entrada'])) {
                return response()->json(['error' => 'Formato de horário de entrada inválido. Use HH:mm'], 422);
            }
            if (!empty($horarioData['saida']) && $horarioData['saida'] !== null && $horarioData['saida'] !== '--:--' && !preg_match('/^\d{2}:\d{2}$/', $horarioData['saida'])) {
                return response()->json(['error' => 'Formato de horário de saída inválido. Use HH:mm'], 422);
            }
        }

        // Buscar instituição do responsável para validar horários
        $responsavel = Responsavel::findOrFail($idResponsavel);
        $instituicao = Instituicao::findOrFail($responsavel->id_inst);
        $horariosInstituicao = HorarioInstituicao::where('id_inst', $instituicao->id)->get();

        try {
            DB::beginTransaction();

            foreach ($request->horarios as $horarioData) {
                // Validar entrada (só valida se estiver habilitado E tiver valor válido)
                if ($horarioData['entradaHabilitada'] && !empty($horarioData['entrada']) && $horarioData['entrada'] !== null && $horarioData['entrada'] !== '--:--') {
                    $this->validarHorarioDentroPeriodoInstituicao(
                        $horarioData['dia_semana'],
                        $horarioData['entrada'],
                        $horariosInstituicao
                    );

                    HorarioResponsavel::updateOrCreate(
                        [
                            'id_responsavel' => $idResponsavel,
                            'dia_semana' => $horarioData['dia_semana'],
                            'tipo' => 'entrada',
                        ],
                        [
                            'hora' => $horarioData['entrada'],
                            'habilitado' => true,
                        ]
                    );
                } else {
                    HorarioResponsavel::where('id_responsavel', $idResponsavel)
                        ->where('dia_semana', $horarioData['dia_semana'])
                        ->where('tipo', 'entrada')
                        ->delete();
                }

                // Validar saída (só valida se estiver habilitado E tiver valor válido)
                if ($horarioData['saidaHabilitada'] && !empty($horarioData['saida']) && $horarioData['saida'] !== null && $horarioData['saida'] !== '--:--') {
                    $this->validarHorarioDentroPeriodoInstituicao(
                        $horarioData['dia_semana'],
                        $horarioData['saida'],
                        $horariosInstituicao
                    );

                    HorarioResponsavel::updateOrCreate(
                        [
                            'id_responsavel' => $idResponsavel,
                            'dia_semana' => $horarioData['dia_semana'],
                            'tipo' => 'saida',
                        ],
                        [
                            'hora' => $horarioData['saida'],
                            'habilitado' => true,
                        ]
                    );
                } else {
                    HorarioResponsavel::where('id_responsavel', $idResponsavel)
                        ->where('dia_semana', $horarioData['dia_semana'])
                        ->where('tipo', 'saida')
                        ->delete();
                }
            }

            DB::commit();
            return response()->json(['message' => 'Horários salvos com sucesso']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ===== VALIDAÇÃO =====

    private function validarHorarioDentroPeriodoInstituicao($diaSemana, $hora, $horariosInstituicao)
    {
        $periodosDoDia = $horariosInstituicao->where('dia_semana', $diaSemana);
        
        if ($periodosDoDia->isEmpty()) {
            throw new \Exception("A instituição não definiu horário para este dia da semana.");
        }

        $horaFormatada = strtotime($hora);
        $valido = false;
        $periodosDisponiveis = [];

        foreach ($periodosDoDia as $periodo) {
            $inicioFormatado = strtotime($periodo->hora_inicio);
            $fimFormatado = strtotime($periodo->hora_fim);
            
            if ($horaFormatada >= $inicioFormatado && $horaFormatada <= $fimFormatado) {
                $valido = true;
                break;
            }
            
            $periodosDisponiveis[] = "{$periodo->hora_inicio} às {$periodo->hora_fim}";
        }

        if (!$valido) {
            $periodosStr = implode(', ', $periodosDisponiveis);
            throw new \Exception("O horário deve estar dentro de um dos períodos de funcionamento da instituição neste dia: {$periodosStr}.");
        }
    }
}

