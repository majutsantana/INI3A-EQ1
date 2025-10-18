import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Switch,
} from 'react-native';
import * as Font from 'expo-font';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import { useTheme } from '../../context/ThemeContext';

const STORAGE_KEY = '@horarios_config';

const initialStateDias = [
    { id: 1, nome: 'SEGUNDA', entrada: null, saida: null, entradaHabilitada: true, saidaHabilitada: true },
    { id: 2, nome: 'TERÇA', entrada: null, saida: null, entradaHabilitada: true, saidaHabilitada: true },
    { id: 3, nome: 'QUARTA', entrada: null, saida: null, entradaHabilitada: true, saidaHabilitada: true },
    { id: 4, nome: 'QUINTA', entrada: null, saida: null, entradaHabilitada: true, saidaHabilitada: true },
    { id: 5, nome: 'SEXTA', entrada: null, saida: null, entradaHabilitada: true, saidaHabilitada: true },
    { id: 6, nome: 'SÁBADO', entrada: null, saida: null, entradaHabilitada: true, saidaHabilitada: true },
];

export default function HorariosAlunoResponsavel({ navigation }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [dias, setDias] = useState(initialStateDias);
    const [horariosOriginais, setHorariosOriginais] = useState(initialStateDias);
    const [showPicker, setShowPicker] = useState(false);
    const [currentDiaId, setCurrentDiaId] = useState(null);
    const [currentTipo, setCurrentTipo] = useState(null);
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

    const carregarConfiguracoes = async () => {
        try {
            const configsSalvas = await AsyncStorage.getItem(STORAGE_KEY);
            if (configsSalvas !== null) {
                const parsedConfigs = JSON.parse(configsSalvas);
                const configsComNovasProps = parsedConfigs.map(dia => ({
                    ...dia,
                    entradaHabilitada: dia.hasOwnProperty('entradaHabilitada') ? dia.entradaHabilitada : true,
                    saidaHabilitada: dia.hasOwnProperty('saidaHabilitada') ? dia.saidaHabilitada : true,
                }));
                setDias(configsComNovasProps);
                setHorariosOriginais(JSON.parse(JSON.stringify(configsComNovasProps)));
            } else {
                setHorariosOriginais(JSON.parse(JSON.stringify(initialStateDias)));
            }
        } catch (error) {
            console.error("Erro ao carregar as configurações:", error);
            Alert.alert("Erro", "Não foi possível carregar as configurações salvas.");
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
            const jsonValue = JSON.stringify(dias);
            await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
            setHorariosOriginais(JSON.parse(JSON.stringify(dias)));
            Alert.alert("Sucesso!", "Suas configurações de horário foram salvas.");
        } catch (error) {
            console.error("Erro ao salvar as configurações:", error);
            Alert.alert("Erro", "Não foi possível salvar as configurações.");
        }
    };

    const cancelarAlteracoes = () => {
        setDias(horariosOriginais);
        Alert.alert("Cancelado", "As alterações foram descartadas.");
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
            setTime(new Date());
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
        <SafeAreaView style={theme == "light" ? styles.safeArea : styles.safeAreaDark}>
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
                                                {dia.entrada || '--:--'}
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
                                                {dia.saida || '--:--'}
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
        </SafeAreaView>
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