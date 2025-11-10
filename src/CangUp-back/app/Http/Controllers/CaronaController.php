<?php

namespace App\Http\Controllers;

use App\Models\Carona;
use App\Models\HorarioAluno;
use App\Models\HorarioResponsavel;
use App\Models\Aluno;
use App\Models\Responsavel;
use App\Models\Instituicao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CaronaController extends Controller
{
    // ===== MATCHING - RESPONSÁVEIS DISPONÍVEIS PARA ALUNO =====
    
    public function getResponsaveisDisponiveis($idAluno)
    {
        // Aumentar timeout (mas NÃO calcular distâncias para evitar timeout)
        set_time_limit(60);
        
        \Log::info('=== INICIANDO BUSCA DE RESPONSÁVEIS DISPONÍVEIS (SEM CALCULAR DISTÂNCIA) ===', [
            'id_aluno' => $idAluno,
            'timestamp' => now()->toDateTimeString()
        ]);
        
        $aluno = Aluno::findOrFail($idAluno);
        $horariosAluno = HorarioAluno::where('id_aluno', $idAluno)
            ->where('habilitado', true)
            ->get();

        \Log::info('Buscando responsáveis disponíveis', [
            'id_aluno' => $idAluno,
            'total_horarios_aluno' => $horariosAluno->count(),
            'horarios' => $horariosAluno->map(function($h) {
                return ['dia' => $h->dia_semana, 'tipo' => $h->tipo, 'hora' => $h->hora];
            })
        ]);

        if ($horariosAluno->isEmpty()) {
            \Log::warning('Aluno sem horários cadastrados', ['id_aluno' => $idAluno]);
            return response()->json([]);
        }

        // Buscar todos os responsáveis da mesma instituição
        $responsaveis = Responsavel::where('id_inst', $aluno->id_inst)->get();
        
        $resultado = [];
        $diasSemana = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        
        // Agrupar horários do aluno por dia e tipo
        $horariosPorDiaTipo = [];
        foreach ($horariosAluno as $horarioAluno) {
            $chave = $horarioAluno->dia_semana . '_' . $horarioAluno->tipo;
            if (!isset($horariosPorDiaTipo[$chave])) {
                $horariosPorDiaTipo[$chave] = [];
            }
            $horariosPorDiaTipo[$chave][] = $horarioAluno;
        }
        
        \Log::info('Total de responsáveis na mesma instituição', [
            'id_inst' => $aluno->id_inst,
            'total_responsaveis' => $responsaveis->count()
        ]);

        // Para cada responsável, verificar se tem horário compatível
        foreach ($responsaveis as $responsavel) {
            // Buscar TODOS os horários do responsável (habilitados)
            $horariosResponsavel = HorarioResponsavel::where('id_responsavel', $responsavel->id)
                ->where('habilitado', true)
                ->get();
            
            \Log::info('Horários do responsável', [
                'id_responsavel' => $responsavel->id,
                'nome' => $responsavel->nome,
                'total_horarios' => $horariosResponsavel->count(),
                'horarios' => $horariosResponsavel->map(function($h) {
                    return ['dia' => $h->dia_semana, 'tipo' => $h->tipo, 'hora' => $h->hora];
                })
            ]);
            
            foreach ($horariosResponsavel as $horarioResp) {
                // Verificar se o aluno tem horário no mesmo dia e tipo
                $chave = $horarioResp->dia_semana . '_' . $horarioResp->tipo;
                
                \Log::info('Verificando match', [
                    'responsavel' => $responsavel->id,
                    'chave' => $chave,
                    'chave_existe' => isset($horariosPorDiaTipo[$chave]),
                    'horarios_aluno_disponiveis' => array_keys($horariosPorDiaTipo)
                ]);
                
                if (isset($horariosPorDiaTipo[$chave])) {
                    // Aluno tem horário neste dia e tipo, pegar o primeiro horário do aluno
                    $horarioAluno = $horariosPorDiaTipo[$chave][0];
                    
                    // Verificar se já não existe carona aceita ou pendente (não cancelada)
                    $caronaExistente = Carona::where('id_aluno', $idAluno)
                        ->where('id_responsavel', $responsavel->id)
                        ->where('dia_semana', $horarioResp->dia_semana)
                        ->where('tipo', $horarioResp->tipo)
                        ->whereIn('status', ['pendente', 'aceita'])
                        ->first();

                    if (!$caronaExistente) {
                        // Garante que a hora está no formato HH:mm (sem segundos)
                        $horaFormatada = $horarioResp->hora;
                        if (is_string($horaFormatada) && strlen($horaFormatada) > 5) {
                            $horaFormatada = substr($horaFormatada, 0, 5);
                        }
                        
                        // Criar chave única para evitar duplicatas
                        $chaveUnica = $responsavel->id . '_' . $horarioResp->dia_semana . '_' . $horarioResp->tipo;
                        
                        if (!isset($resultado[$chaveUnica])) {
                            // Adicionar match SEM calcular distância (usa valor padrão 5.0)
                            // A distância pode ser calculada depois, quando necessário
                            $resultado[$chaveUnica] = [
                                'id_responsavel' => $responsavel->id,
                                'nome_responsavel' => $responsavel->nome,
                                'dia_semana' => $horarioResp->dia_semana,
                                'dia_semana_nome' => $diasSemana[$horarioResp->dia_semana],
                                'tipo' => $horarioResp->tipo,
                                'hora' => $horaFormatada,
                                'imagem' => $responsavel->imagem,
                                'distancia_km' => 5.0, // Valor padrão (não calcula para evitar timeout)
                            ];
                            
                            \Log::info('Match encontrado!', [
                                'aluno' => $aluno->id,
                                'responsavel' => $responsavel->id,
                                'dia' => $horarioResp->dia_semana,
                                'tipo' => $horarioResp->tipo,
                                'hora' => $horaFormatada
                            ]);
                        }
                    } else {
                        \Log::info('Carona já existe, pulando', [
                            'aluno' => $idAluno,
                            'responsavel' => $responsavel->id,
                            'dia' => $horarioResp->dia_semana,
                            'tipo' => $horarioResp->tipo
                        ]);
                    }
                }
            }
        }

        // Converter array associativo para array indexado
        $resultado = array_values($resultado);
        
        // NÃO calcular distâncias durante a busca inicial (causa timeout)
        // Todos os matches já têm distancia_km = 5.0 (valor padrão)
        // A distância real pode ser calculada depois, quando o aluno solicitar a carona
        
        // Ordenar por dia da semana e depois por distância
        usort($resultado, function($a, $b) {
            if ($a['dia_semana'] != $b['dia_semana']) {
                return $a['dia_semana'] - $b['dia_semana'];
            }
            return ($a['distancia_km'] ?? 999) - ($b['distancia_km'] ?? 999);
        });

        \Log::info('Responsáveis disponíveis encontrados', [
            'total' => count($resultado),
            'por_dia' => array_count_values(array_column($resultado, 'dia_semana'))
        ]);

        // Sempre retornar array JSON válido (mesmo que vazio)
        return response()->json($resultado, 200, [], JSON_UNESCAPED_UNICODE);
    }

    // ===== SOLICITAR CARONA (ALUNO) =====

    public function solicitarCarona(Request $request)
    {
        $request->validate([
            'id_aluno' => 'required|integer|exists:alunos,id',
            'id_responsavel' => 'required|integer|exists:responsaveis,id',
            'dia_semana' => 'required|integer|min:1|max:6',
            'tipo' => 'required|in:entrada,saida',
            'hora' => 'required|string',
        ]);

        // Normalizar o formato da hora para HH:mm
        $hora = $request->hora;
        
        // Se a hora vem em formato timestamp ISO, extrair apenas HH:mm
        if (preg_match('/T(\d{2}):(\d{2})/', $hora, $matches)) {
            $hora = $matches[1] . ':' . $matches[2];
        }
        
        // Se a hora tem segundos, remover
        if (preg_match('/^(\d{2}):(\d{2}):(\d{2})/', $hora, $matches)) {
            $hora = $matches[1] . ':' . $matches[2];
        }
        
        // Validar formato final HH:mm
        if (!preg_match('/^\d{2}:\d{2}$/', $hora)) {
            return response()->json(['error' => 'Formato de horário inválido. Use HH:mm'], 422);
        }

        // Verificar se já existe carona pendente ou aceita (não cancelada)
        $caronaExistente = Carona::where('id_aluno', $request->id_aluno)
            ->where('id_responsavel', $request->id_responsavel)
            ->where('dia_semana', $request->dia_semana)
            ->where('tipo', $request->tipo)
            ->where('hora', $hora)
            ->whereIn('status', ['pendente', 'aceita'])
            ->first();

        if ($caronaExistente) {
            return response()->json(['error' => 'Já existe uma carona solicitada ou aceita para este horário'], 400);
        }

        try {
            // Buscar endereços para calcular distância
            $aluno = Aluno::findOrFail($request->id_aluno);
            $responsavel = Responsavel::findOrFail($request->id_responsavel);

            // Verificar se aluno e responsável são da mesma instituição
            if ($aluno->id_inst !== $responsavel->id_inst) {
                return response()->json(['error' => 'Aluno e responsável devem ser da mesma instituição'], 400);
            }

            // NÃO calcular distância aqui (causa delay de ~10 segundos)
            // Usar valor padrão 5.0 - pode ser calculado depois em background se necessário
            $distancia = 5.0;

            $carona = Carona::create([
                'id_aluno' => $request->id_aluno,
                'id_responsavel' => $request->id_responsavel,
                'dia_semana' => $request->dia_semana,
                'tipo' => $request->tipo,
                'hora' => $hora,
                'status' => 'pendente',
                'distancia_km' => $distancia,
                'data_solicitacao' => now(),
            ]);

            return response()->json([
                'message' => 'Carona solicitada com sucesso',
                'carona' => $carona
            ], 201, [], JSON_UNESCAPED_UNICODE);
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Erro ao criar carona', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            return response()->json(['error' => 'Erro ao criar carona: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar carona', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            return response()->json(['error' => 'Erro ao criar carona: ' . $e->getMessage()], 500);
        }
    }

    // ===== SOLICITAÇÕES PENDENTES (RESPONSÁVEL) =====

    public function getSolicitacoesPendentes($idResponsavel)
    {
        $caronas = Carona::where('id_responsavel', $idResponsavel)
            ->where('status', 'pendente')
            ->with(['aluno' => function($query) {
                $query->select('id', 'nome', 'imagem', 'endereco');
            }])
            ->orderBy('data_solicitacao', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $diasSemana = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

        $resultado = $caronas->map(function ($carona) use ($diasSemana) {
            // Garante que a hora está no formato HH:mm
            $horaFormatada = $carona->hora;
            if (is_string($horaFormatada) && strlen($horaFormatada) > 5) {
                $horaFormatada = substr($horaFormatada, 0, 5);
            }
            
            // Verifica se o aluno existe
            if (!$carona->aluno) {
                return null;
            }
            
            return [
                'id' => $carona->id,
                'id_aluno' => $carona->id_aluno,
                'nome_aluno' => $carona->aluno->nome,
                'imagem_aluno' => $carona->aluno->imagem,
                'dia_semana' => $carona->dia_semana,
                'dia_semana_nome' => $diasSemana[$carona->dia_semana],
                'tipo' => $carona->tipo,
                'hora' => $horaFormatada,
                'distancia_km' => $carona->distancia_km !== null ? (float)$carona->distancia_km : null,
                'data_solicitacao' => $carona->data_solicitacao,
            ];
        })->filter(); // Remove nulls

        return response()->json($resultado);
    }

    // ===== ACEITAR CARONA (RESPONSÁVEL) =====

    public function aceitarCarona(Request $request, $idCarona)
    {
        $carona = Carona::findOrFail($idCarona);
        
        if ($carona->status !== 'pendente') {
            return response()->json(['error' => 'Apenas caronas pendentes podem ser aceitas'], 400);
        }

        $carona->update([
            'status' => 'aceita',
            'data_aceitacao' => now(),
        ]);

        return response()->json($carona);
    }

    // ===== RECUSAR CARONA (RESPONSÁVEL) =====

    public function recusarCarona(Request $request, $idCarona)
    {
        $carona = Carona::findOrFail($idCarona);
        
        if ($carona->status !== 'pendente') {
            return response()->json(['error' => 'Apenas caronas pendentes podem ser recusadas'], 400);
        }

        $carona->update([
            'status' => 'recusada',
        ]);

        return response()->json($carona);
    }

    // ===== CANCELAR/DELETAR CARONA (ALUNO OU RESPONSÁVEL) =====

    public function cancelarCarona(Request $request, $idCarona)
    {
        try {
            $carona = Carona::findOrFail($idCarona);
            
            // Verificar se a carona está em um status que pode ser cancelado
            if ($carona->status === 'cancelada') {
                return response()->json(['error' => 'Esta carona já foi cancelada'], 400);
            }

            // Atualiza o status para 'cancelada' ao invés de deletar
            // Isso mantém o histórico, mas a carona não aparece mais nas listas ativas
            $carona->update([
                'status' => 'cancelada',
            ]);

            return response()->json([
                'message' => 'Carona cancelada com sucesso',
                'carona' => $carona
            ]);
        } catch (\Exception $e) {
            \Log::error('Erro ao cancelar carona', [
                'error' => $e->getMessage(),
                'id_carona' => $idCarona
            ]);
            return response()->json(['error' => 'Erro ao cancelar carona: ' . $e->getMessage()], 500);
        }
    }

    // ===== CARONAS ACEITAS (ALUNO E RESPONSÁVEL) =====

    public function getCaronasAceitasAluno($idAluno)
    {
        // Retorna apenas caronas aceitas (não canceladas)
        $caronas = Carona::where('id_aluno', $idAluno)
            ->where('status', 'aceita')
            ->with(['responsavel' => function($query) {
                $query->select('id', 'nome', 'imagem', 'telefone');
            }])
            ->orderBy('dia_semana')
            ->orderBy('hora')
            ->get();

        $diasSemana = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        $aluno = Aluno::findOrFail($idAluno);

        $resultado = $caronas->map(function ($carona) use ($diasSemana, $aluno) {
            // Garante que a hora está no formato HH:mm
            $horaFormatada = $carona->hora;
            if (is_string($horaFormatada) && strlen($horaFormatada) > 5) {
                $horaFormatada = substr($horaFormatada, 0, 5);
            }
            
            // Verifica se o responsável existe
            if (!$carona->responsavel) {
                return null;
            }
            
            return [
                'id' => $carona->id,
                'id_responsavel' => $carona->id_responsavel,
                'nome_responsavel' => $carona->responsavel->nome,
                'imagem_responsavel' => $carona->responsavel->imagem,
                'telefone_responsavel' => $carona->responsavel->telefone,
                'endereco_aluno' => $aluno->endereco,
                'imagem_aluno' => $aluno->imagem,
                'dia_semana' => $carona->dia_semana,
                'dia_semana_nome' => $diasSemana[$carona->dia_semana],
                'tipo' => $carona->tipo,
                'hora' => $horaFormatada,
                'data_aceitacao' => $carona->data_aceitacao,
            ];
        })->filter()->values(); // Remove nulls e reindexa

        // Sempre retornar array JSON válido (mesmo que vazio)
        return response()->json($resultado->toArray(), 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function getCaronasAceitasResponsavel($idResponsavel)
    {
        // Retorna apenas caronas aceitas (não canceladas)
        $caronas = Carona::where('id_responsavel', $idResponsavel)
            ->where('status', 'aceita')
            ->with(['aluno' => function($query) {
                $query->select('id', 'nome', 'imagem', 'endereco');
            }])
            ->orderBy('dia_semana')
            ->orderBy('hora')
            ->get();

        $diasSemana = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

        $resultado = $caronas->map(function ($carona) use ($diasSemana) {
            // Garante que a hora está no formato HH:mm
            $horaFormatada = $carona->hora;
            if (is_string($horaFormatada) && strlen($horaFormatada) > 5) {
                $horaFormatada = substr($horaFormatada, 0, 5);
            }
            
            // Verifica se o aluno existe
            if (!$carona->aluno) {
                return null;
            }
            
            return [
                'id' => $carona->id,
                'id_aluno' => $carona->id_aluno,
                'nome_aluno' => $carona->aluno->nome,
                'imagem_aluno' => $carona->aluno->imagem,
                'endereco_aluno' => $carona->aluno->endereco,
                'dia_semana' => $carona->dia_semana,
                'dia_semana_nome' => $diasSemana[$carona->dia_semana],
                'tipo' => $carona->tipo,
                'hora' => $horaFormatada,
                'data_aceitacao' => $carona->data_aceitacao,
            ];
        })->filter(); // Remove nulls

        return response()->json($resultado);
    }

    // ===== CALCULAR DISTÂNCIA (GOOGLE MAPS API) =====

    private function calcularDistancia($endereco1, $endereco2)
    {
        $apiKey = env('GOOGLE_MAPS_API_KEY');
        
        // Tenta usar Google Maps primeiro
        if (!empty($apiKey)) {
            try {
                $url = "https://maps.googleapis.com/maps/api/distancematrix/json?" . 
                       "origins=" . urlencode($endereco1) . 
                       "&destinations=" . urlencode($endereco2) . 
                       "&key=" . $apiKey .
                       "&language=pt-BR";
                
                $context = stream_context_create([
                    'http' => [
                        'timeout' => 10,
                        'ignore_errors' => true
                    ]
                ]);
                
                $response = @file_get_contents($url, false, $context);
                
                if ($response !== false) {
                    $data = json_decode($response, true);
                    
                    // Log para debug
                    if (isset($data['error_message'])) {
                        \Log::warning('Google Maps Distance Matrix API error', [
                            'error' => $data['error_message'],
                            'status' => $data['status'] ?? 'UNKNOWN'
                        ]);
                    }
                    
                    // Se não houver erro de billing, usa o resultado
                    if (!isset($data['error_message']) || strpos($data['error_message'], 'Billing') === false) {
                        if (isset($data['status']) && $data['status'] === 'OK') {
                            if (isset($data['rows'][0]['elements'][0]['distance']['value'])) {
                                $distanciaMetros = $data['rows'][0]['elements'][0]['distance']['value'];
                                $distanciaKm = $distanciaMetros / 1000;
                                \Log::info('Distância calculada via Google Maps', [
                                    'distancia_km' => $distanciaKm,
                                    'endereco1' => $endereco1,
                                    'endereco2' => $endereco2
                                ]);
                                return round($distanciaKm, 2);
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                \Log::warning('Erro ao calcular distância com Google Maps, usando cálculo aproximado', [
                    'error' => $e->getMessage()
                ]);
            }
        } else {
            \Log::warning('GOOGLE_MAPS_API_KEY não configurada, usando cálculo aproximado');
        }
        
        // Fallback: calcula distância aproximada usando coordenadas (Haversine)
        \Log::info('Tentando calcular distância usando coordenadas (Haversine)', [
            'endereco1' => $endereco1,
            'endereco2' => $endereco2
        ]);
        
        $coord1 = $this->obterCoordenadas($endereco1);
        $coord2 = $this->obterCoordenadas($endereco2);
        
        if ($coord1 && $coord2) {
            $distancia = $this->calcularDistanciaHaversine($coord1, $coord2);
            \Log::info('Distância calculada via Haversine', [
                'distancia_km' => $distancia,
                'coord1' => $coord1,
                'coord2' => $coord2
            ]);
            return $distancia;
        }
        
        // Se não conseguir coordenadas, retorna valor padrão
        \Log::warning('Não foi possível calcular distância, retornando valor padrão', [
            'coord1_obtida' => $coord1 !== null,
            'coord2_obtida' => $coord2 !== null,
            'endereco1' => $endereco1,
            'endereco2' => $endereco2
        ]);
        return round(5.0, 2);
    }

    // ===== CALCULAR DISTÂNCIA USANDO FÓRMULA DE HAVERSINE (APROXIMADA) =====
    
    private function calcularDistanciaHaversine($coord1, $coord2)
    {
        $raioTerra = 6371; // Raio da Terra em km
        
        $lat1 = deg2rad($coord1['lat']);
        $lat2 = deg2rad($coord2['lat']);
        $deltaLat = deg2rad($coord2['lat'] - $coord1['lat']);
        $deltaLng = deg2rad($coord2['lng'] - $coord1['lng']);
        
        $a = sin($deltaLat / 2) * sin($deltaLat / 2) +
             cos($lat1) * cos($lat2) *
             sin($deltaLng / 2) * sin($deltaLng / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distancia = $raioTerra * $c;
        
        return round($distancia, 2);
    }

    // ===== OBTER COORDENADAS (GEOCODING) =====

    private function obterCoordenadas($endereco)
    {
        $apiKey = env('GOOGLE_MAPS_API_KEY');
        
        // Se não houver API key, usa diretamente OpenStreetMap Nominatim (gratuito, sem cartão)
        if (empty($apiKey)) {
            \Log::info('GOOGLE_MAPS_API_KEY não configurada, usando Nominatim diretamente');
            return $this->obterCoordenadasNominatim($endereco);
        }

        // Tenta Google Maps primeiro (se tiver API key)
        try {
            $url = "https://maps.googleapis.com/maps/api/geocode/json?" . 
                   "address=" . urlencode($endereco) . 
                   "&key=" . $apiKey .
                   "&language=pt-BR";
            
            $context = stream_context_create([
                'http' => [
                    'timeout' => 10,
                    'ignore_errors' => true
                ]
            ]);
            
            $response = @file_get_contents($url, false, $context);
            
            if ($response === false) {
                \Log::warning('Erro ao buscar coordenadas do Google Maps API, tentando Nominatim');
                return $this->obterCoordenadasNominatim($endereco);
            }
            
            $data = json_decode($response, true);
            
            // Se a API retornar erro de billing ou qualquer erro, usa Nominatim como fallback
            if (isset($data['error_message'])) {
                \Log::warning('Google Maps API retornou erro, usando Nominatim como fallback', [
                    'error' => $data['error_message'],
                    'status' => $data['status'] ?? 'UNKNOWN'
                ]);
                return $this->obterCoordenadasNominatim($endereco);
            }
            
            if (isset($data['status']) && $data['status'] === 'OK' && !empty($data['results'])) {
                $location = $data['results'][0]['geometry']['location'];
                \Log::info('Coordenadas obtidas via Google Maps', [
                    'endereco' => $endereco,
                    'coordenadas' => $location
                ]);
                return [
                    'lat' => $location['lat'],
                    'lng' => $location['lng']
                ];
            }
            
            // Se status não for OK, tenta Nominatim
            \Log::warning('Google Maps API retornou status diferente de OK, tentando Nominatim', [
                'status' => $data['status'] ?? 'UNKNOWN'
            ]);
            return $this->obterCoordenadasNominatim($endereco);
        } catch (\Exception $e) {
            \Log::warning('Exceção ao obter coordenadas do Google Maps, tentando Nominatim', ['error' => $e->getMessage()]);
            return $this->obterCoordenadasNominatim($endereco);
        }
    }

    // ===== OBTER COORDENADAS USANDO NOMINATIM (OPENSTREETMAP) - GRATUITO, SEM CARTÃO =====
    
    private function obterCoordenadasNominatim($endereco)
    {
        try {
            // Normalizar endereço para melhor busca no Nominatim
            $enderecoNormalizado = $this->normalizarEnderecoParaNominatim($endereco);
            
            \Log::info('Tentando obter coordenadas via Nominatim', [
                'endereco_original' => $endereco,
                'endereco_normalizado' => $enderecoNormalizado
            ]);
            
            // OpenStreetMap Nominatim - 100% gratuito, sem necessidade de cartão
            // IMPORTANTE: Nominatim requer User-Agent válido e tem rate limiting (1 req/segundo)
            $url = "https://nominatim.openstreetmap.org/search?" . 
                   "q=" . urlencode($enderecoNormalizado) . 
                   "&format=json&limit=1&addressdetails=1&countrycodes=br";
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => [
                        'User-Agent: CangUp/1.0 (Contact: cangup@exemplo.com)',
                        'Accept: application/json'
                    ],
                    'timeout' => 15,
                    'ignore_errors' => true
                ]
            ]);
            
            // Delay reduzido para evitar timeout (0.5s ao invés de 1.1s)
            static $ultimaRequisicaoCEP = 0;
            $tempoAtual = microtime(true);
            $tempoDesdeUltima = ($tempoAtual - $ultimaRequisicaoCEP) * 1000000;
            if ($tempoDesdeUltima < 500000) { // 0.5 segundos
                usleep(500000 - $tempoDesdeUltima);
            }
            $ultimaRequisicaoCEP = microtime(true);
            
            $response = @file_get_contents($url, false, $context);
            
            if ($response === false) {
                \Log::error('Erro ao buscar coordenadas do Nominatim (file_get_contents falhou)', [
                    'endereco' => $endereco,
                    'endereco_normalizado' => $enderecoNormalizado,
                    'url' => $url
                ]);
                return null;
            }
            
            $data = json_decode($response, true);
            
            // Log da resposta para debug
            \Log::info('Resposta do Nominatim', [
                'endereco' => $endereco,
                'resposta_vazia' => empty($data),
                'total_resultados' => is_array($data) ? count($data) : 0,
                'primeiro_resultado' => isset($data[0]) ? [
                    'display_name' => $data[0]['display_name'] ?? 'N/A',
                    'lat' => $data[0]['lat'] ?? 'N/A',
                    'lon' => $data[0]['lon'] ?? 'N/A'
                ] : null
            ]);
            
            if (!empty($data) && isset($data[0]['lat']) && isset($data[0]['lon'])) {
                $coordenadas = [
                    'lat' => (float)$data[0]['lat'],
                    'lng' => (float)$data[0]['lon']
                ];
                
                // Salvar no cache
                static $cacheCoordenadas = [];
                $cacheKey = md5($enderecoNormalizado);
                $cacheCoordenadas[$cacheKey] = $coordenadas;
                
                \Log::info('✓ Coordenadas obtidas via Nominatim', [
                    'endereco' => $endereco,
                    'coordenadas' => $coordenadas,
                    'display_name' => $data[0]['display_name'] ?? 'N/A'
                ]);
                return $coordenadas;
            }
            
            // Se não encontrou, tenta apenas com CEP se houver
            if (preg_match('/\d{5}-?\d{3}/', $endereco, $cepMatch)) {
                $cep = $cepMatch[0];
                \Log::info('Tentando buscar apenas pelo CEP', ['cep' => $cep]);
                $coordenadasPorCEP = $this->obterCoordenadasPorCEP($cep);
                if ($coordenadasPorCEP) {
                    return $coordenadasPorCEP;
                }
            }
            
            \Log::warning('Nominatim não retornou coordenadas válidas', [
                'endereco' => $endereco,
                'endereco_normalizado' => $enderecoNormalizado,
                'resposta_vazia' => empty($data),
                'resposta_preview' => substr($response, 0, 500),
                'url_usada' => $url
            ]);
            return null;
        } catch (\Exception $e) {
            \Log::error('Exceção ao obter coordenadas do Nominatim', [
                'error' => $e->getMessage(),
                'endereco' => $endereco
            ]);
            return null;
        }
    }
    
    // ===== NORMALIZAR ENDEREÇO PARA NOMINATIM =====
    
    private function normalizarEnderecoParaNominatim($endereco)
    {
        // Remove espaços extras
        $endereco = trim($endereco);
        
        // Se já tem "Bauru" e "SP" ou "Brasil", está bom
        if (stripos($endereco, 'Bauru') !== false && (stripos($endereco, 'SP') !== false || stripos($endereco, 'Brasil') !== false)) {
            return $endereco;
        }
        
        // Se tem CEP mas não tem cidade/estado, adiciona
        if (preg_match('/\d{5}-?\d{3}/', $endereco, $cepMatch)) {
            // CEP encontrado, garante que tem "Bauru, SP, Brasil"
            if (stripos($endereco, 'Bauru') === false) {
                $endereco .= ', Bauru';
            }
            if (stripos($endereco, 'SP') === false) {
                $endereco .= ', SP';
            }
            if (stripos($endereco, 'Brasil') === false && stripos($endereco, 'Brazil') === false) {
                $endereco .= ', Brasil';
            }
        } else {
            // Sem CEP, adiciona cidade/estado/país
            if (stripos($endereco, 'Bauru') === false) {
                $endereco .= ', Bauru';
            }
            if (stripos($endereco, 'SP') === false) {
                $endereco .= ', SP';
            }
            if (stripos($endereco, 'Brasil') === false && stripos($endereco, 'Brazil') === false) {
                $endereco .= ', Brasil';
            }
        }
        
        return $endereco;
    }
    
    // ===== OBTER COORDENADAS NOMINATIM SIMPLES (SEM DELAY, PARA EVITAR LOOP) =====
    
    private function obterCoordenadasNominatimSimples($endereco)
    {
        try {
            $url = "https://nominatim.openstreetmap.org/search?" . 
                   "q=" . urlencode($endereco) . 
                   "&format=json&limit=1&addressdetails=1&countrycodes=br";
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => [
                        'User-Agent: CangUp/1.0 (Contact: cangup@exemplo.com)',
                        'Accept: application/json'
                    ],
                    'timeout' => 15,
                    'ignore_errors' => true
                ]
            ]);
            
            $response = @file_get_contents($url, false, $context);
            
            if ($response !== false) {
                $data = json_decode($response, true);
                
                if (!empty($data) && isset($data[0]['lat']) && isset($data[0]['lon'])) {
                    return [
                        'lat' => (float)$data[0]['lat'],
                        'lng' => (float)$data[0]['lon']
                    ];
                }
            }
            
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }
    
    // ===== OBTER COORDENADAS POR CEP (FALLBACK) =====
    
    private function obterCoordenadasPorCEP($cep)
    {
        try {
            // Remove hífen do CEP
            $cep = str_replace('-', '', $cep);
            
            // Tenta via API ViaCEP (gratuita)
            $url = "https://viacep.com.br/ws/{$cep}/json/";
            
            $context = stream_context_create([
                'http' => [
                    'timeout' => 10,
                    'ignore_errors' => true
                ]
            ]);
            
            $response = @file_get_contents($url, false, $context);
            
            if ($response !== false) {
                $data = json_decode($response, true);
                
                if (!isset($data['erro']) && isset($data['logradouro'])) {
                    // Monta endereço completo
                    $enderecoCompleto = $data['logradouro'] . ', ' . 
                                      ($data['bairro'] ?? '') . ', ' . 
                                      $data['localidade'] . ', ' . 
                                      $data['uf'] . ', Brasil';
                    
                    \Log::info('Endereço completo obtido do ViaCEP', ['endereco' => $enderecoCompleto]);
                    
                    // Tenta novamente com o endereço completo (mas sem delay extra, já que é uma segunda tentativa)
                    // Usa uma versão simplificada para evitar loop
                    return $this->obterCoordenadasNominatimSimples($enderecoCompleto);
                }
            }
            
            // Se ViaCEP falhar, tenta direto com CEP no Nominatim
            $urlNominatim = "https://nominatim.openstreetmap.org/search?" . 
                           "postalcode=" . urlencode($cep) . 
                           "&country=Brasil" .
                           "&format=json&limit=1";
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => [
                        'User-Agent: CangUp/1.0 (Contact: cangup@exemplo.com)',
                        'Accept: application/json'
                    ],
                    'timeout' => 15,
                    'ignore_errors' => true
                ]
            ]);
            
            usleep(1100000); // Delay para rate limiting
            
            $response = @file_get_contents($urlNominatim, false, $context);
            
            if ($response !== false) {
                $data = json_decode($response, true);
                
                if (!empty($data) && isset($data[0]['lat']) && isset($data[0]['lon'])) {
                    return [
                        'lat' => (float)$data[0]['lat'],
                        'lng' => (float)$data[0]['lon']
                    ];
                }
            }
            
            return null;
        } catch (\Exception $e) {
            \Log::error('Erro ao obter coordenadas por CEP', [
                'error' => $e->getMessage(),
                'cep' => $cep
            ]);
            return null;
        }
    }

    // ===== OBTER ROTA PARA TODOS OS ALUNOS ACEITOS =====

    public function getRotaAlunosAceitos($idResponsavel)
    {
        try {
            // Aumentar timeout para esta requisição (pode fazer muitas chamadas de API)
            set_time_limit(60);
            
            // Buscar responsável
            $responsavel = Responsavel::findOrFail($idResponsavel);
            
            // Buscar instituição do responsável (destino final será sempre a instituição do responsável)
            $instituicao = Instituicao::find($responsavel->id_inst);
            $enderecoInstituicao = $instituicao ? $instituicao->endereco : null;
            
            if (!$enderecoInstituicao) {
                return response()->json([
                    'pontos' => [],
                    'coordenadas_responsavel' => null,
                    'coordenadas_instituicao' => null,
                    'url_google_maps' => null,
                    'message' => 'Instituição do responsável não encontrada ou sem endereço'
                ]);
            }
            
            // Buscar todas as caronas aceitas deste responsável
            $caronas = Carona::where('id_responsavel', $idResponsavel)
                ->where('status', 'aceita')
                ->with(['aluno' => function($query) {
                    $query->select('id', 'nome', 'endereco', 'imagem');
                }])
                ->get();

            // Filtrar alunos que existem
            $caronas = $caronas->filter(function($carona) {
                return $carona->aluno !== null;
            });

            // Se não há caronas aceitas, retorna lista vazia
            if ($caronas->isEmpty()) {
                return response()->json([
                    'pontos' => [],
                    'coordenadas_responsavel' => null,
                    'coordenadas_instituicao' => null,
                    'url_google_maps' => null,
                    'message' => 'Nenhuma carona aceita encontrada'
                ]);
            }

            // Obter coordenadas do responsável (ponto de partida)
            $coordenadasResponsavel = null;
            if (empty($responsavel->endereco)) {
                \Log::warning('Responsável sem endereço', ['id' => $responsavel->id, 'nome' => $responsavel->nome]);
            } else {
                \Log::info('Obtendo coordenadas do responsável', [
                    'id' => $responsavel->id,
                    'nome' => $responsavel->nome,
                    'endereco' => $responsavel->endereco
                ]);
                $coordenadasResponsavel = $this->obterCoordenadas($responsavel->endereco);
            }
            
            // Obter coordenadas da instituição (destino final)
            $coordenadasInstituicao = null;
            if (empty($enderecoInstituicao)) {
                \Log::warning('Instituição sem endereço', ['id' => $instituicao->id ?? 'N/A']);
            } else {
                \Log::info('Obtendo coordenadas da instituição', [
                    'id' => $instituicao->id ?? 'N/A',
                    'nome' => $instituicao->nome ?? 'N/A',
                    'endereco' => $enderecoInstituicao
                ]);
                $coordenadasInstituicao = $this->obterCoordenadas($enderecoInstituicao);
            }
            
            // Se não conseguiu coordenadas do responsável, tenta obter pelo menos dos alunos
            // Se não conseguir nenhuma, retorna lista vazia mas com sucesso
            $pontos = [];
            
            if ($coordenadasResponsavel) {
                \Log::info('Coordenadas do responsável obtidas', ['coordenadas' => $coordenadasResponsavel]);
                $pontos[] = [
                    'tipo' => 'responsavel',
                    'nome' => $responsavel->nome,
                    'endereco' => $responsavel->endereco,
                    'coordenadas' => $coordenadasResponsavel,
                    'carona' => null,
                    'ordem' => 0
                ];
            } else {
                \Log::warning('Não foi possível obter coordenadas do responsável', ['endereco' => $responsavel->endereco]);
            }

            $ordem = 1;
            foreach ($caronas as $carona) {
                if (empty($carona->aluno->endereco)) {
                    \Log::warning('Aluno sem endereço', [
                        'id' => $carona->aluno->id,
                        'nome' => $carona->aluno->nome
                    ]);
                    continue;
                }
                
                \Log::info('Obtendo coordenadas do aluno', [
                    'id' => $carona->aluno->id,
                    'aluno' => $carona->aluno->nome,
                    'endereco' => $carona->aluno->endereco
                ]);
                $coordenadasAluno = $this->obterCoordenadas($carona->aluno->endereco);
                
                if ($coordenadasAluno) {
                    \Log::info('Coordenadas do aluno obtidas', ['aluno' => $carona->aluno->nome, 'coordenadas' => $coordenadasAluno]);
                    $pontos[] = [
                        'tipo' => 'aluno',
                        'nome' => $carona->aluno->nome,
                        'endereco' => $carona->aluno->endereco,
                        'coordenadas' => $coordenadasAluno,
                        'carona' => [
                            'id' => $carona->id,
                            'dia_semana' => $carona->dia_semana,
                            'hora' => $carona->hora,
                            'tipo' => $carona->tipo
                        ],
                        'ordem' => $ordem++
                    ];
                } else {
                    \Log::warning('Não foi possível obter coordenadas do aluno', ['aluno' => $carona->aluno->nome, 'endereco' => $carona->aluno->endereco]);
                }
            }

            // Adicionar instituição como destino final
            if ($coordenadasInstituicao) {
                \Log::info('Coordenadas da instituição obtidas', ['coordenadas' => $coordenadasInstituicao]);
                $pontos[] = [
                    'tipo' => 'instituicao',
                    'nome' => $instituicao ? $instituicao->nome : 'Instituição',
                    'endereco' => $enderecoInstituicao,
                    'coordenadas' => $coordenadasInstituicao,
                    'carona' => null,
                    'ordem' => $ordem
                ];
            } else {
                \Log::warning('Não foi possível obter coordenadas da instituição', ['endereco' => $enderecoInstituicao]);
            }
            
            \Log::info('Total de pontos obtidos para rota', [
                'total' => count($pontos),
                'tem_responsavel' => $coordenadasResponsavel !== null,
                'tem_instituicao' => $coordenadasInstituicao !== null,
                'total_alunos' => count($caronas),
                'pontos' => array_map(function($p) {
                    return ['tipo' => $p['tipo'], 'nome' => $p['nome']];
                }, $pontos)
            ]);

            // Se não tem pelo menos origem e destino, não gera URL
            if (count($pontos) < 2) {
                \Log::warning('Pontos insuficientes para gerar rota', [
                    'total_pontos' => count($pontos),
                    'tem_responsavel' => $coordenadasResponsavel !== null,
                    'tem_instituicao' => $coordenadasInstituicao !== null
                ]);
            }

            // Gerar URL do Google Maps com waypoints (só se tiver pelo menos 2 pontos)
            $urlGoogleMaps = count($pontos) >= 2 ? $this->gerarUrlGoogleMaps($pontos) : null;

            // Retorna sucesso mesmo se não conseguiu coordenadas (API não configurada)
            // Frontend pode mostrar lista de alunos mesmo sem mapa
            return response()->json([
                'pontos' => $pontos,
                'coordenadas_responsavel' => $coordenadasResponsavel,
                'coordenadas_instituicao' => $coordenadasInstituicao,
                'url_google_maps' => $urlGoogleMaps,
                'has_coordinates' => count($pontos) >= 2
            ]);
        } catch (\Exception $e) {
            \Log::error('Erro ao obter rota de alunos', [
                'error' => $e->getMessage(),
                'id_responsavel' => $idResponsavel
            ]);
            // Retorna lista vazia em vez de erro 500 para não quebrar o frontend
            return response()->json([
                'pontos' => [],
                'coordenadas_responsavel' => null,
                'coordenadas_instituicao' => null,
                'url_google_maps' => null,
                'has_coordinates' => false,
                'error' => 'Erro ao obter coordenadas. Verifique se a API do Google Maps está configurada.'
            ]);
        }
    }

    // ===== GERAR URL DO GOOGLE MAPS COM WAYPOINTS =====
    
    private function gerarUrlGoogleMaps($pontos)
    {
        if (empty($pontos)) {
            return null;
        }

        // Ordenar pontos por ordem
        usort($pontos, function($a, $b) {
            return ($a['ordem'] ?? 999) - ($b['ordem'] ?? 999);
        });

        // Separar pontos por tipo
        $pontoResponsavel = null;
        $pontosAlunos = [];
        $pontoInstituicao = null;

        foreach ($pontos as $ponto) {
            if ($ponto['tipo'] === 'responsavel') {
                $pontoResponsavel = $ponto;
            } elseif ($ponto['tipo'] === 'aluno') {
                $pontosAlunos[] = $ponto;
            } elseif ($ponto['tipo'] === 'instituicao') {
                $pontoInstituicao = $ponto;
            }
        }

        // Validar que temos origem (responsável) e destino (instituição)
        if (!$pontoResponsavel || !$pontoInstituicao) {
            \Log::warning('Não é possível gerar URL do Google Maps: faltam origem ou destino', [
                'tem_responsavel' => $pontoResponsavel !== null,
                'tem_instituicao' => $pontoInstituicao !== null
            ]);
            return null;
        }

            // Validar que origem e destino são diferentes
            $origemLat = $pontoResponsavel['coordenadas']['lat'];
            $origemLng = $pontoResponsavel['coordenadas']['lng'];
            $destinoLat = $pontoInstituicao['coordenadas']['lat'];
            $destinoLng = $pontoInstituicao['coordenadas']['lng'];
            
            $origemCoords = $origemLat . ',' . $origemLng;
            $destinoCoords = $destinoLat . ',' . $destinoLng;
        
        // Se coordenadas são muito próximas (menos de 10 metros), usar endereços
        $distanciaCoords = $this->calcularDistanciaHaversine(
            ['lat' => $origemLat, 'lng' => $origemLng],
            ['lat' => $destinoLat, 'lng' => $destinoLng]
        );
        
        if ($distanciaCoords < 0.01) { // Menos de 10 metros
            \Log::warning('Origem e destino muito próximos (coordenadas iguais ou quase), usando endereços', [
                'origem' => $pontoResponsavel['endereco'],
                'destino' => $pontoInstituicao['endereco'],
                'distancia_km' => $distanciaCoords
            ]);
            
            // Usar endereços completos ao invés de coordenadas
            $origemCoords = urlencode($pontoResponsavel['endereco']);
            $destinoCoords = urlencode($pontoInstituicao['endereco']);
        } else {
            // Usar coordenadas normalmente
            $origemCoords = $origemLat . ',' . $origemLng;
            $destinoCoords = $destinoLat . ',' . $destinoLng;
        }

        // Pontos intermediários são os alunos (waypoints)
        $waypoints = [];
        foreach ($pontosAlunos as $aluno) {
            if (isset($aluno['coordenadas'])) {
                $waypoints[] = $aluno['coordenadas']['lat'] . ',' . $aluno['coordenadas']['lng'];
            } elseif (isset($aluno['endereco'])) {
                // Se não tem coordenadas, usar endereço
                $waypoints[] = urlencode($aluno['endereco']);
            }
        }

        // Construir URL do Google Maps
        // Formato: https://www.google.com/maps/dir/?api=1&origin=...&destination=...&waypoints=...
        $url = 'https://www.google.com/maps/dir/?api=1';
        $url .= '&origin=' . $origemCoords;
        $url .= '&destination=' . $destinoCoords;
        
        if (!empty($waypoints)) {
            $url .= '&waypoints=' . implode('|', $waypoints);
        }

        \Log::info('URL do Google Maps gerada', [
            'origem' => $pontoResponsavel['endereco'],
            'destino' => $pontoInstituicao['endereco'],
            'waypoints_count' => count($waypoints),
            'url_preview' => substr($url, 0, 200)
        ]);

        return $url;
    }
}

