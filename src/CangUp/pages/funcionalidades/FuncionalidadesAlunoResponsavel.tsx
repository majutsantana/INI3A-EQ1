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
} from 'react-native';
import * as Font from 'expo-font';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import { useTheme } from '../../context/ThemeContext';

const STORAGE_KEY = '@horarios_config';

const initialStateDias = [
    { id: 1, nome: 'SEGUNDA', inicio: null, fim: null },
    { id: 2, nome: 'TERÇA', inicio: null, fim: null },
    { id: 3, nome: 'QUARTA', inicio: null, fim: null },
    { id: 4, nome: 'QUINTA', inicio: null, fim: null },
    { id: 5, nome: 'SEXTA', inicio: null, fim: null },
    { id: 6, nome: 'SÁBADO', inicio: null, fim: null },
];

export default function FuncionalidadesAlunoResponsavel({ navigation }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [dias, setDias] = useState(initialStateDias);
    const [horariosOriginais, setHorariosOriginais] = useState(initialStateDias);
    const [showPicker, setShowPicker] = useState(false);
    const [currentDiaId, setCurrentDiaId] = useState(null);
    const [currentTipo, setCurrentTipo] = useState(null);
    const [time, setTime] = useState(new Date());
    const {theme} = useTheme();

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
                setDias(parsedConfigs);
                setHorariosOriginais(JSON.parse(JSON.stringify(parsedConfigs)));
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
        setCurrentDiaId(diaId);
        setCurrentTipo(tipo);
        setTime(new Date());
        setShowPicker(true);
    };

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#BEACDE" />
            </View>
        );
    }

    return (
        <SafeAreaView style={theme == "light"? styles.safeArea : styles.safeAreaDark}>
            <HeaderComLogout/>

            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={theme == "light"? styles.containerPrincipal : styles.containerPrincipalDark}>
                    <Text style={theme == "light" ? styles.tituloAba : styles.tituloAbaDark}>Horários</Text>
                    {dias.map(dia => (
                        <View key={dia.id} style={styles.cardDia}>
                            <View style={theme == "light" ? styles.headerDia : styles.headerDiaDark}>
                                <Text style={styles.textoDia}>{dia.nome}</Text>
                            </View>    
                            <View style={styles.secaoHorarios}>
                                <View style={styles.blocoHorario}>
                                    <Text style={theme == "light" ? styles.labelHorario : styles.labelHorarioDark}>Início</Text>
                                    <View style={styles.circuloHorario}>
                                        <Text style={styles.textoTempo}>{dia.inicio || '--:--'}</Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.botaoAdicionar}
                                        onPress={() => showTimepicker(dia.id, 'inicio')}
                                    >
                                        <Text style={styles.textoBotao}>{dia.inicio ? 'alterar' : 'adicionar'}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.blocoHorario}>
                                    <Text style={theme == "light" ? styles.labelHorario : styles.labelHorarioDark}>Fim</Text>
                                    <View style={styles.circuloHorario}>
                                        <Text style={styles.textoTempo}>{dia.fim || '--:--'}</Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.botaoAdicionar}
                                        onPress={() => showTimepicker(dia.id, 'fim')}
                                    >
                                        <Text style={styles.textoBotao}>{dia.fim ? 'alterar' : 'adicionar'}</Text>
                                    </TouchableOpacity>
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
        </SafeAreaView>
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
        marginBottom: 15,
    },
    headerDia: {
        backgroundColor: '#EAEAEA',
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
        color: '#555',
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