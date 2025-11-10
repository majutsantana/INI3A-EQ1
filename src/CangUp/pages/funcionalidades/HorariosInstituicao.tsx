import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import * as Font from 'expo-font';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useApi from '../../hooks/useApi';
import { Ionicons } from '@expo/vector-icons';

const nomesDias = ['', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const periodosPredefinidos = ['manha', 'tarde', 'noite'];

const initialStateDias = [
    { id: 1, nome: 'SEGUNDA', periodos: [] },
    { id: 2, nome: 'TERÇA', periodos: [] },
    { id: 3, nome: 'QUARTA', periodos: [] },
    { id: 4, nome: 'QUINTA', periodos: [] },
    { id: 5, nome: 'SEXTA', periodos: [] },
    { id: 6, nome: 'SÁBADO', periodos: [] },
];

type Periodo = {
    periodo?: string;
    inicio: string;
    fim: string;
};

type Dia = {
    id: number;
    nome: string;
    periodos: Periodo[];
};

export default function HorariosInstituicao({ navigation }) {
    const { url } = useApi();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [dias, setDias] = useState<Dia[]>(initialStateDias);
    const [horariosOriginais, setHorariosOriginais] = useState<Dia[]>(initialStateDias);
    const [showPicker, setShowPicker] = useState(false);
    const [currentDiaId, setCurrentDiaId] = useState<number | null>(null);
    const [currentPeriodoIndex, setCurrentPeriodoIndex] = useState<number | null>(null);
    const [currentTipo, setCurrentTipo] = useState<string | null>(null);
    const [time, setTime] = useState(new Date());
    const { theme } = useTheme();

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

    const formatarHorario = (horario: string | undefined | null): string => {
        if (!horario || horario === '--:--' || horario.trim() === '') {
            return '--:--';
        }
        
        // Remove espaços
        const horarioLimpo = horario.trim();
        
        // Se já está no formato HH:mm, retorna direto
        if (/^\d{2}:\d{2}$/.test(horarioLimpo)) {
            return horarioLimpo;
        }
        
        // Se está no formato HH:mm:ss (com segundos), remove os segundos
        if (/^\d{2}:\d{2}:\d{2}$/.test(horarioLimpo)) {
            return horarioLimpo.substring(0, 5); // Retorna apenas HH:mm
        }
        
        // Se é um timestamp ISO, extrai apenas a hora LOCAL (não UTC)
        if (horarioLimpo.includes('T')) {
            try {
                const date = new Date(horarioLimpo);
                // IMPORTANTE: Usa getHours() e getMinutes() que retornam horário LOCAL
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            } catch (e) {
                console.error("Erro ao formatar timestamp:", e);
                return '--:--';
            }
        }
        
        // Tenta extrair HH:mm de qualquer formato (ex: "12:00:00" -> "12:00")
        const match = horarioLimpo.match(/^(\d{2}):(\d{2})/);
        if (match) {
            return match[0]; // Retorna HH:mm
        }
        
        console.warn("Formato de horário não reconhecido:", horario);
        return '--:--';
    };
    
    const carregarConfiguracoes = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const idInst = await AsyncStorage.getItem('id_instituicao');
            
            if (!token || !idInst) {
                Alert.alert("Erro", "Você precisa estar logado.");
                return;
            }

            const response = await fetch(`${url}/api/instituicoes/${idInst}/horarios`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Dados recebidos do backend:", JSON.stringify(data, null, 2));
                
                const horariosFormatados = data.map((diaData: any) => ({
                    id: diaData.dia_semana,
                    nome: nomesDias[diaData.dia_semana],
                    periodos: (diaData.periodos || []).map((periodo: any) => {
                        const inicioFormatado = periodo.inicio ? formatarHorario(periodo.inicio) : '';
                        const fimFormatado = periodo.fim ? formatarHorario(periodo.fim) : '';
                        
                        console.log("Formatando período:", {
                            original: { inicio: periodo.inicio, fim: periodo.fim },
                            formatado: { inicio: inicioFormatado, fim: fimFormatado }
                        });
                        
                        return {
                            periodo: periodo.periodo || null,
                            inicio: inicioFormatado,
                            fim: fimFormatado,
                        };
                    }),
                }));
                
                console.log("Horários formatados para exibição:", JSON.stringify(horariosFormatados, null, 2));
                
                setDias(horariosFormatados);
                setHorariosOriginais(JSON.parse(JSON.stringify(horariosFormatados)));
            } else {
                setHorariosOriginais(JSON.parse(JSON.stringify(initialStateDias)));
            }
        } catch (error) {
            console.error("Erro ao carregar as configurações:", error);
            Alert.alert("Erro", "Não foi possível carregar as configurações salvas.");
            setHorariosOriginais(JSON.parse(JSON.stringify(initialStateDias)));
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

    const adicionarPeriodo = (diaId: number) => {
        setDias(diasAtuais =>
            diasAtuais.map(dia => {
                if (dia.id === diaId) {
                    const periodoDisponivel = periodosPredefinidos.find(
                        p => !dia.periodos.some(per => per.periodo === p)
                    );
                    return {
                        ...dia,
                        periodos: [
                            ...dia.periodos,
                            {
                                periodo: periodoDisponivel || 'periodo',
                                inicio: '',
                                fim: '',
                            }
                        ]
                    };
                }
                return dia;
            })
        );
    };

    const removerPeriodo = (diaId: number, periodoIndex: number) => {
        setDias(diasAtuais =>
            diasAtuais.map(dia => {
                if (dia.id === diaId) {
                    return {
                        ...dia,
                        periodos: dia.periodos.filter((_, index) => index !== periodoIndex)
                    };
                }
                return dia;
            })
        );
    };

    const salvarConfiguracoes = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const idInst = await AsyncStorage.getItem('id_instituicao');
            
            if (!token || !idInst) {
                Alert.alert("Erro", "Você precisa estar logado.");
                return;
            }

            // Filtra apenas dias que têm pelo menos um período válido (com início e fim)
            const horariosParaEnviar = dias
                .map(dia => ({
                    dia_semana: dia.id,
                    periodos: dia.periodos
                        .filter(p => p.inicio && p.fim && p.inicio.trim() !== '' && p.fim.trim() !== '')
                        .map(p => ({
                            periodo: p.periodo || null,
                            inicio: p.inicio.trim(),
                            fim: p.fim.trim(),
                        }))
                }))
                .filter(dia => dia.periodos.length > 0); // Remove dias sem períodos válidos

            console.log("Enviando horários para o backend:", JSON.stringify(horariosParaEnviar, null, 2));
            
            // Verifica se há algum problema com os horários antes de enviar
            horariosParaEnviar.forEach((dia, index) => {
                dia.periodos.forEach((periodo, pIndex) => {
                    console.log(`Dia ${dia.dia_semana}, Período ${pIndex}:`, {
                        periodo: periodo.periodo,
                        inicio: periodo.inicio,
                        fim: periodo.fim
                    });
                });
            });

            const response = await fetch(`${url}/api/instituicoes/${idInst}/horarios`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ horarios: horariosParaEnviar })
            });

            if (response.ok) {
                await carregarConfiguracoes();
                Alert.alert("Sucesso!", "Suas configurações de horário foram salvas.");
            } else {
                let errorMessage = "Não foi possível salvar as configurações.";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                    console.error("Erro do servidor:", errorData);
                } catch (e) {
                    console.error("Erro ao processar resposta:", e);
                    const errorText = await response.text();
                    console.error("Resposta do servidor:", errorText);
                }
                Alert.alert("Erro", errorMessage);
            }
        } catch (error) {
            console.error("Erro ao salvar as configurações:", error);
            Alert.alert("Erro", error.message || "Não foi possível salvar as configurações.");
        }
    };

    const cancelarAlteracoes = () => {
        setDias(JSON.parse(JSON.stringify(horariosOriginais)));
        Alert.alert("Cancelado", "As alterações foram descartadas.");
    };

    const onTimeChange = (event, selectedDate) => {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate && currentDiaId !== null && currentPeriodoIndex !== null && currentTipo) {
            // O DateTimePicker retorna uma data no timezone local
            // Mas pode haver diferenças dependendo da plataforma
            // Vamos usar getHours() e getMinutes() que retornam o horário local
            const selectedTime = selectedDate || time;
            
            // Pega horas e minutos locais
            const hoursLocal = selectedTime.getHours();
            const minutesLocal = selectedTime.getMinutes();
            
            // Também pega UTC para comparar (debug)
            const hoursUTC = selectedTime.getUTCHours();
            const minutesUTC = selectedTime.getUTCMinutes();
            
            console.log("Horário selecionado - Local:", hoursLocal, minutesLocal, "UTC:", hoursUTC, minutesUTC);
            
            // Usa o horário local (que é o que o usuário vê no picker)
            const hoursFormatted = hoursLocal.toString().padStart(2, '0');
            const minutesFormatted = minutesLocal.toString().padStart(2, '0');
            const formattedTime = `${hoursFormatted}:${minutesFormatted}`;
            
            console.log("Horário formatado para salvar:", formattedTime);
            
            setDias(diasAtuais =>
                diasAtuais.map(dia => {
                    if (dia.id === currentDiaId) {
                        return {
                            ...dia,
                            periodos: dia.periodos.map((periodo, index) => {
                                if (index === currentPeriodoIndex) {
                                    return { ...periodo, [currentTipo]: formattedTime };
                                }
                                return periodo;
                            })
                        };
                    }
                    return dia;
                })
            );
        }
    };

    const showTimepicker = (diaId: number, periodoIndex: number, tipo: string) => {
        setCurrentDiaId(diaId);
        setCurrentPeriodoIndex(periodoIndex);
        setCurrentTipo(tipo);
        
        // Encontra o período atual para pegar o horário salvo
        const diaAtual = dias.find(d => d.id === diaId);
        if (diaAtual && diaAtual.periodos[periodoIndex]) {
            const periodoAtual = diaAtual.periodos[periodoIndex];
            let horarioSalvo = periodoAtual[tipo === 'inicio' ? 'inicio' : 'fim'];
            
            // Garante que o horário está no formato HH:mm
            horarioSalvo = formatarHorario(horarioSalvo);
            
            if (horarioSalvo && horarioSalvo !== '--:--') {
                try {
                    // Converte o horário salvo (formato HH:mm) para um objeto Date
                    const [hours, minutes] = horarioSalvo.split(':').map(Number);
                    if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
                        // Cria uma nova data com a data de hoje e o horário especificado
                        // Usa setHours() que trabalha com timezone local
                        const hoje = new Date();
                        const dataComHorario = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), hours, minutes, 0, 0);
                        
                        console.log("Criando data para picker:", {
                            horarioSalvo: horarioSalvo,
                            hours: hours,
                            minutes: minutes,
                            dataComHorario: dataComHorario.toISOString(),
                            horasLocais: dataComHorario.getHours(),
                            minutosLocais: dataComHorario.getMinutes(),
                            horasUTC: dataComHorario.getUTCHours(),
                            minutosUTC: dataComHorario.getUTCMinutes()
                        });
                        
                        setTime(dataComHorario);
                    } else {
                        console.log("Horário inválido, usando hora atual");
                        setTime(new Date());
                    }
                } catch (e) {
                    console.error("Erro ao converter horário:", e);
                    setTime(new Date());
                }
            } else {
                console.log("Nenhum horário salvo, usando hora atual");
                setTime(new Date());
            }
        } else {
            setTime(new Date());
        }
        
        setShowPicker(true);
    };

    const getNomePeriodo = (periodo: string | undefined): string => {
        if (!periodo) return 'Período';
        const periodos: { [key: string]: string } = {
            'manha': 'MANHÃ',
            'tarde': 'TARDE',
            'noite': 'NOITE',
        };
        return periodos[periodo] || periodo.toUpperCase();
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
            <HeaderComLogout/>

            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={theme == "light" ? styles.containerPrincipal : styles.containerPrincipalDark}>
                    <Text style={theme == "light" ? styles.tituloAba : styles.tituloAbaDark}>Horários</Text>
                    {dias.map(dia => (
                        <View key={dia.id} style={styles.cardDia}>
                            <View style={theme == "light" ? styles.headerDia : styles.headerDiaDark}>
                                <Text style={theme == "light" ? styles.textoDia : styles.textoDiaDark}>{dia.nome}</Text>
                            </View>
                            
                            {dia.periodos.map((periodo, periodoIndex) => (
                                <View key={periodoIndex} style={styles.periodoContainer}>
                                    <View style={styles.periodoHeader}>
                                        <Text style={theme == "light" ? styles.textoPeriodo : styles.textoPeriodoDark}>
                                            {getNomePeriodo(periodo.periodo)}
                                        </Text>
                                        {dia.periodos.length > 1 && (
                                            <TouchableOpacity
                                                onPress={() => removerPeriodo(dia.id, periodoIndex)}
                                                style={styles.botaoRemover}
                                            >
                                                <Ionicons name="close-circle" size={24} color="#ff4444" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    
                                    <View style={styles.secaoHorarios}>
                                        <View style={styles.blocoHorario}>
                                            <Text style={theme == "light" ? styles.labelHorario : styles.labelHorarioDark}>Início</Text>
                                            <View style={styles.circuloHorario}>
                                                <Text style={styles.textoTempo}>{formatarHorario(periodo.inicio)}</Text>
                                            </View>
                                            <TouchableOpacity 
                                                style={styles.botaoAdicionar}
                                                onPress={() => showTimepicker(dia.id, periodoIndex, 'inicio')}
                                            >
                                                <Text style={styles.textoBotao}>{periodo.inicio ? 'alterar' : 'adicionar'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.blocoHorario}>
                                            <Text style={theme == "light" ? styles.labelHorario : styles.labelHorarioDark}>Fim</Text>
                                            <View style={styles.circuloHorario}>
                                                <Text style={styles.textoTempo}>{formatarHorario(periodo.fim)}</Text>
                                            </View>
                                            <TouchableOpacity 
                                                style={styles.botaoAdicionar}
                                                onPress={() => showTimepicker(dia.id, periodoIndex, 'fim')}
                                            >
                                                <Text style={styles.textoBotao}>{periodo.fim ? 'alterar' : 'adicionar'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                            
                            <TouchableOpacity
                                style={styles.botaoAdicionarPeriodo}
                                onPress={() => adicionarPeriodo(dia.id)}
                            >
                                <Ionicons name="add-circle-outline" size={24} color={theme == "light" ? "#522a91" : "#fff"} />
                                <Text style={[styles.textoBotaoAdicionar, theme == "light" ? styles.textoBotaoAdicionarLight : styles.textoBotaoAdicionarDark]}>
                                    Adicionar Período
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    
                    <View style={styles.botoesAcaoContainer}>
                        <TouchableOpacity style={[styles.botaoAcao, styles.botaoCancelar]} onPress={cancelarAlteracoes}>
                            <Text style={styles.textoBotaoAcao}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.botaoAcao, styles.botaoSalvar]} onPress={salvarConfiguracoes}>
                            <Text style={styles.textoBotaoAcao}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <FooterComIcones nav={navigation}/>

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
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 15,
    },
    headerDia: {
        backgroundColor: '#EAEAEA',
        paddingVertical: 10,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    headerDiaDark: {
        backgroundColor: '#5b5b5b',
        paddingVertical: 10,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    textoDia: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#555',
    },
    textoDiaDark: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#fff',
    },
    periodoContainer: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    periodoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    textoPeriodo: {
        fontFamily: 'PoppinsBold',
        fontSize: 14,
        color: '#333',
    },
    textoPeriodoDark: {
        fontFamily: 'PoppinsBold',
        fontSize: 14,
        color: '#fff',
    },
    botaoRemover: {
        padding: 5,
    },
    secaoHorarios: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    blocoHorario: {
        alignItems: 'center',
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
    },
    textoTempo: {
        fontFamily: 'PoppinsBold',
        fontSize: 18,
        color: '#000',
    },
    botaoAdicionar: {
        backgroundColor: '#FFBE31',
        paddingHorizontal: 18,
        paddingVertical: 6,
        borderRadius: 15,
    },
    textoBotao: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#000',
    },
    botaoAdicionarPeriodo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        marginTop: 10,
    },
    textoBotaoAdicionar: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        marginLeft: 5,
    },
    textoBotaoAdicionarLight: {
        color: '#522a91',
    },
    textoBotaoAdicionarDark: {
        color: '#fff',
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
    botaoSalvar: {
        backgroundColor: '#522a91',
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
