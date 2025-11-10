import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Switch,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import { useTheme } from '../../context/ThemeContext';
import useApi from '../../hooks/useApi';

const initialStateDias = [
    { id: 1, nome: 'SEGUNDA', entrada: null, saida: null, entradaHabilitada: true, saidaHabilitada: true },
    { id: 2, nome: 'TERÇA', entrada: null, saida: null, entradaHabilitada: true, saidaHabilitada: true },
    { id: 3, nome: 'QUARTA', entrada: null, saida: null, entradaHabilitada: true, saidaHabilitada: true },
    { id: 4, nome: 'QUINTA', entrada: null, saida: null, entradaHabilitada: true, saidaHabilitada: true },
    { id: 5, nome: 'SEXTA', entrada: null, saida: null, entradaHabilitada: true, saidaHabilitada: true },
    { id: 6, nome: 'SÁBADO', entrada: null, saida: null, entradaHabilitada: true, saidaHabilitada: true },
];

export default function HorariosAlunoResponsavel({ navigation }) {
    const { url } = useApi();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [dias, setDias] = useState(initialStateDias);
    const [horariosOriginais, setHorariosOriginais] = useState(initialStateDias);
    const [showPicker, setShowPicker] = useState(false);
    const [currentDiaId, setCurrentDiaId] = useState(null);
    const [currentTipo, setCurrentTipo] = useState(null);
    const [time, setTime] = useState(new Date());
    const [perfil, setPerfil] = useState('');
    const [idUsuario, setIdUsuario] = useState('');
    const [isEditando, setIsEditando] = useState(false);
    const [temHorariosSalvos, setTemHorariosSalvos] = useState(false);
    const { theme } = useTheme();

    const formatarHorario = (horario: string | undefined | null): string => {
        if (!horario || horario === '--:--' || horario.trim() === '') {
            return '--:--';
        }
        
        const horarioLimpo = horario.trim();
        
        // Se já está no formato HH:mm, retorna direto
        if (/^\d{2}:\d{2}$/.test(horarioLimpo)) {
            return horarioLimpo;
        }
        
        // Se está no formato HH:mm:ss, remove os segundos
        if (/^\d{2}:\d{2}:\d{2}$/.test(horarioLimpo)) {
            return horarioLimpo.substring(0, 5);
        }
        
        // Se é um timestamp ISO (UTC), extrai apenas a hora
        if (horarioLimpo.includes('T')) {
            try {
                // Tenta extrair diretamente do formato ISO: 2025-11-06T07:15:00.000Z
                const timeMatch = horarioLimpo.match(/T(\d{2}):(\d{2})/);
                if (timeMatch) {
                    return `${timeMatch[1]}:${timeMatch[2]}`;
                }
                // Se não conseguir, usa Date (mas pode ter problemas de timezone)
                const date = new Date(horarioLimpo);
                const hours = date.getUTCHours().toString().padStart(2, '0');
                const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            } catch (e) {
                console.error("Erro ao formatar timestamp:", e);
                return '--:--';
            }
        }
        
        // Tenta extrair HH:mm de qualquer formato
        const match = horarioLimpo.match(/^(\d{2}):(\d{2})/);
        if (match) {
            return match[0];
        }
        
        return '--:--';
    };

    const loadFonts = async () => {
        try {
            await Font.loadAsync({
                'PoppinsRegular': require('../../assets/fonts/PoppinsRegular.ttf'),
                'PoppinsBold': require('../../assets/fonts/PoppinsBold.ttf'),
            });
        } catch (error) {
            console.error("Erro ao carregar as fontes:", error);
        }
    };

    const carregarConfiguracoes = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const perfilUsuario = await AsyncStorage.getItem('perfil');
            const idAluno = await AsyncStorage.getItem('id_aluno');
            const idResponsavel = await AsyncStorage.getItem('id_responsavel');
            
            if (!token || !perfilUsuario) {
                Alert.alert("Erro", "Você precisa estar logado.");
                return;
            }

            setPerfil(perfilUsuario);
            const id = perfilUsuario === 'alun' ? idAluno : idResponsavel;
            setIdUsuario(id || '');

            if (!id) {
                Alert.alert("Erro", "ID não encontrado.");
                return;
            }

            const endpoint = perfilUsuario === 'alun' 
                ? `${url}/api/alunos/${id}/horarios`
                : `${url}/api/responsaveis/${id}/horarios`;

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const nomesDias = ['', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
                const horariosFormatados = data.map((h: any) => ({
                    id: h.dia_semana,
                    nome: nomesDias[h.dia_semana],
                    entrada: h.entrada ? formatarHorario(h.entrada) : null,
                    saida: h.saida ? formatarHorario(h.saida) : null,
                    entradaHabilitada: h.entradaHabilitada !== false,
                    saidaHabilitada: h.saidaHabilitada !== false,
                }));
                setDias(horariosFormatados);
                setHorariosOriginais(JSON.parse(JSON.stringify(horariosFormatados)));
                // Verifica se há algum horário salvo
                const temHorarios = horariosFormatados.some((d: any) => d.entrada || d.saida);
                setTemHorariosSalvos(temHorarios);
            } else {
                setHorariosOriginais(JSON.parse(JSON.stringify(initialStateDias)));
                setTemHorariosSalvos(false);
            }
        } catch (error) {
            console.error("Erro ao carregar as configurações:", error);
            Alert.alert("Erro", "Não foi possível carregar as configurações salvas.");
            setHorariosOriginais(JSON.parse(JSON.stringify(initialStateDias)));
            setTemHorariosSalvos(false);
        }
    };

    useEffect(() => {
        async function inicializar() {
            await loadFonts();
            await carregarConfiguracoes();
            setFontsLoaded(true);
        }
        inicializar();
    }, []);

    const salvarConfiguracoes = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            
            if (!token || !perfil || !idUsuario) {
                Alert.alert("Erro", "Você precisa estar logado.");
                return;
            }

            const horariosParaEnviar = dias.map(dia => ({
                dia_semana: dia.id,
                entrada: (dia.entrada && dia.entrada !== '--:--' && dia.entrada.trim() !== '') ? dia.entrada : null,
                saida: (dia.saida && dia.saida !== '--:--' && dia.saida.trim() !== '') ? dia.saida : null,
                entradaHabilitada: dia.entradaHabilitada,
                saidaHabilitada: dia.saidaHabilitada,
            }));

            const endpoint = perfil === 'alun'
                ? `${url}/api/alunos/${idUsuario}/horarios`
                : `${url}/api/responsaveis/${idUsuario}/horarios`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ horarios: horariosParaEnviar })
            });

            if (response.ok) {
                setHorariosOriginais(JSON.parse(JSON.stringify(dias)));
                setIsEditando(false);
                setTemHorariosSalvos(true);
                Alert.alert("Sucesso!", "Suas configurações de horário foram salvas.");
            } else {
                const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
                console.error("Erro do servidor:", errorData);
                Alert.alert("Erro", errorData.error || errorData.message || "Não foi possível salvar as configurações.");
            }
        } catch (error) {
            console.error("Erro ao salvar as configurações:", error);
            Alert.alert("Erro", error.message || "Não foi possível salvar as configurações.");
        }
    };

    const cancelarAlteracoes = () => {
        setDias(horariosOriginais);
        setIsEditando(false);
        Alert.alert("Cancelado", "As alterações foram descartadas.");
    };

    const entrarModoEdicao = () => {
        setIsEditando(true);
    };

    const onTimeChange = (event, selectedDate) => {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate) {
            const selectedTime = selectedDate || time;
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;
            setDias(diasAtuais =>
                diasAtuais.map(dia => {
                    if (dia.id === currentDiaId) {
                        return { ...dia, [currentTipo]: formattedTime };
                    }
                    return dia;
                })
            );
        }
    };

    const showTimepicker = (diaId, tipo) => {
        const diaAtual = dias.find(d => d.id === diaId);
        const habilitado = tipo === 'entrada' ? diaAtual.entradaHabilitada : diaAtual.saidaHabilitada;

        if (habilitado) {
            setCurrentDiaId(diaId);
            setCurrentTipo(tipo);
            
            // Pega o horário salvo do dia
            let horarioSalvo = tipo === 'entrada' ? diaAtual.entrada : diaAtual.saida;
            
            // Garante que o horário está no formato HH:mm
            horarioSalvo = formatarHorario(horarioSalvo);
            
            if (horarioSalvo && horarioSalvo !== '--:--') {
                try {
                    // Converte o horário salvo (formato HH:mm) para um objeto Date
                    const [hours, minutes] = horarioSalvo.split(':').map(Number);
                    if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
                        // Cria uma nova data com a data de hoje e o horário especificado
                        const hoje = new Date();
                        const dataComHorario = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), hours, minutes, 0, 0);
                        setTime(dataComHorario);
                    } else {
                        setTime(new Date());
                    }
                } catch (e) {
                    console.error("Erro ao converter horário:", e);
                    setTime(new Date());
                }
            } else {
                setTime(new Date());
            }
            
            setShowPicker(true);
        } else {
            Alert.alert("Horário Desabilitado", "Carona desabilitada para este horário. Habilite o interruptor para adicionar/alterar.");
        }
    };
    
    const toggleHorarioHabilitado = (diaId, tipo, value) => {
        const propHabilitada = `${tipo}Habilitada`;
        const propHorario = tipo;

        setDias(diasAtuais =>
            diasAtuais.map(dia => {
                if (dia.id === diaId) {
                    const novoEstadoHabilitado = value;
                    const novoHorario = novoEstadoHabilitado ? dia[propHorario] : null; 
                    
                    return {
                        ...dia,
                        [propHabilitada]: novoEstadoHabilitado,
                        [propHorario]: novoHorario,
                    };
                }
                return dia;
            })
        );
    };


    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#BEACDE" />
            </View>
        );
    }

    return (
        <SafeAreaProvider style={theme == "light" ? styles.safeArea : styles.safeAreaDark}>
            <HeaderComLogout />

            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={theme == "light" ? styles.containerPrincipal : styles.containerPrincipalDark}>
                    <Text style={theme == "light" ? styles.tituloAba : styles.tituloAbaDark}>Horários</Text>
                    {dias.map(dia => (
                        <View key={dia.id} style={styles.cardDia}>
                            <View style={theme == "light" ? styles.headerDia : styles.headerDiaDark}>
                                <Text style={theme == "light" ? styles.textoDia : styles.textoDiaDark}>{dia.nome}</Text>
                            </View>
                            <View style={styles.secaoHorarios}>
                                <View style={styles.blocoHorario}>
                                    <Text style={theme == "light" ? styles.labelHorario : styles.labelHorarioDark}>Entrada</Text>
                                    <View style={[styles.circuloHorario, !dia.entradaHabilitada && styles.circuloDesabilitado]}>
                                        {dia.entradaHabilitada ? (
                                            <Text style={styles.textoTempo}>
                                                {formatarHorario(dia.entrada)}
                                            </Text>
                                        ) : (
                                            <>
                                                <Text style={styles.textoTempoDesabilitado}>
                                                    Sem
                                                </Text>
                                                <Text style={[styles.textoTempoPequeno, styles.textoTempoDesabilitado]}>
                                                    Carona
                                                </Text>
                                            </>
                                        )}
                                    </View>

                                    <View style={styles.controleHorarioContainer}>
                                        <Switch
                                            trackColor={{ false: "#767577", true: "#522a91" }}
                                            thumbColor={dia.entradaHabilitada ? "#FFFFFF" : "#f4f3f4"}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={(value) => toggleHorarioHabilitado(dia.id, 'entrada', value)}
                                            value={dia.entradaHabilitada}
                                        />

                                        <TouchableOpacity
                                            style={[styles.botaoAdicionar, !dia.entradaHabilitada && styles.botaoAdicionarDesabilitado]}
                                            onPress={() => showTimepicker(dia.id, 'entrada')}
                                            disabled={!dia.entradaHabilitada}
                                        >
                                            <Text style={[styles.textoBotao, !dia.entradaHabilitada && styles.textoBotaoDesabilitado]}>
                                                {dia.entrada ? 'Alterar' : 'Adicionar'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.blocoHorario}>
                                    <Text style={theme == "light" ? styles.labelHorario : styles.labelHorarioDark}>Saída</Text>
                                    <View style={[styles.circuloHorario, !dia.saidaHabilitada && styles.circuloDesabilitado]}>
                                        {dia.saidaHabilitada ? (
                                            <Text style={styles.textoTempo}>
                                                {formatarHorario(dia.saida)}
                                            </Text>
                                        ) : (
                                            <>
                                                <Text style={styles.textoTempoDesabilitado}>
                                                    Sem
                                                </Text>
                                                <Text style={[styles.textoTempoPequeno, styles.textoTempoDesabilitado]}>
                                                    Carona
                                                </Text>
                                            </>
                                        )}
                                    </View>

                                    <View style={styles.controleHorarioContainer}>
                                        <Switch
                                            trackColor={{ false: "#767577", true: "#522a91" }}
                                            thumbColor={dia.saidaHabilitada ? "#FFFFFF" : "#f4f3f4"}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={(value) => toggleHorarioHabilitado(dia.id, 'saida', value)}
                                            value={dia.saidaHabilitada}
                                        />

                                        <TouchableOpacity
                                            style={[styles.botaoAdicionar, !dia.saidaHabilitada && styles.botaoAdicionarDesabilitado]}
                                            onPress={() => showTimepicker(dia.id, 'saida')}
                                            disabled={!dia.saidaHabilitada}
                                        >
                                            <Text style={[styles.textoBotao, !dia.saidaHabilitada && styles.textoBotaoDesabilitado]}>
                                                {dia.saida ? 'Alterar' : 'Adicionar'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                    {!isEditando && !temHorariosSalvos ? (
                        // Estado inicial: só botão Salvar
                        <TouchableOpacity style={[styles.botaoAcao, styles.botaoSalvar, styles.botaoUnico]} onPress={salvarConfiguracoes}>
                            <Text style={styles.textoBotaoAcao}>Salvar</Text>
                        </TouchableOpacity>
                    ) : !isEditando && temHorariosSalvos ? (
                        // Após salvar: só botão Editar
                        <TouchableOpacity style={[styles.botaoAcao, styles.botaoEditar, styles.botaoUnico]} onPress={entrarModoEdicao}>
                            <Text style={styles.textoBotaoAcao}>Editar</Text>
                        </TouchableOpacity>
                    ) : (
                        // Modo de edição: Salvar e Cancelar
                        <View style={styles.botoesAcaoContainer}>
                            <TouchableOpacity style={[styles.botaoAcao, styles.botaoCancelar]} onPress={cancelarAlteracoes}>
                                <Text style={styles.textoBotaoAcao}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.botaoAcao, styles.botaoSalvar]} onPress={salvarConfiguracoes}>
                                <Text style={styles.textoBotaoAcao}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
            <FooterComIcones nav={navigation} />

            {showPicker && (
                <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onTimeChange}
                />
            )}
        </SafeAreaProvider>
    );
}

// Estilos
// ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FCD28D',
    },
    safeAreaDark: {
        flex: 1,
        backgroundColor: '#522a91',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FCD28D'
    },
    scrollViewContainer: {
        paddingBottom: 80,
    },
    containerPrincipal: {
        margin: 20,
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
    },
    containerPrincipalDark: {
        margin: 20,
        padding: 15,
        backgroundColor: '#313233',
        borderRadius: 25,
    },
    tituloAba: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        marginBottom: 20,
    },
    tituloAbaDark: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    cardDia: {
        marginBottom: 15,
    },
    headerDia: {
        backgroundColor: '#BEACDE',
        paddingVertical: 10,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 10,
    },
    headerDiaDark: {
        backgroundColor: '#5b5b5b',
        paddingVertical: 10,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 10,
    },
    textoDia: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#fff',
    },
    textoDiaDark: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#fff',
    },
    secaoHorarios: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
    },
    blocoHorario: {
        alignItems: 'center',
        width: '48%',
    },
    labelHorario: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#000',
        marginBottom: 8,
    },
    labelHorarioDark: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#fff',
        marginBottom: 8,
    },
    circuloHorario: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: 8,
        padding: 5,
    },
    circuloDesabilitado: {
        backgroundColor: '#DEDEDE',
        borderColor: '#B0B0B0',
    },
    textoTempo: {
        fontFamily: 'PoppinsBold',
        fontSize: 18,
        color: '#000',
        textAlign: 'center', 
        lineHeight: 25, 
    },
    textoTempoPequeno: {
        fontFamily: 'PoppinsRegular',
        fontSize: 10,
        color: '#000',
        marginTop: -5,
        textAlign: 'center',
    },
    textoTempoDesabilitado: {
        color: '#666',
        fontSize: 14, 
        textAlign: 'center', 
        lineHeight: 18,
    },

    controleHorarioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    
    botaoAdicionar: {
        backgroundColor: '#FFBE31',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        minWidth: 90,
        alignItems: 'center',
    },
    botaoAdicionarDesabilitado: {
        backgroundColor: '#E0E0E0',
        opacity: 0.6,
    },
    textoBotao: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#000',
    },
    textoBotaoDesabilitado: {
        color: '#999',
    },
    botoesAcaoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    botaoAcao: {
        flex: 1,
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    botaoUnico: {
        marginHorizontal: 'auto',
        width: '60%',
        flex: 0,
    },
    botaoSalvar: {
        backgroundColor: '#522a91',
    },
    botaoEditar: {
        backgroundColor: '#FFBE31',
    },
    botaoCancelar: {
        backgroundColor: '#FFBE31',
    },
    textoBotaoAcao: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#FFFFFF',
    },
});