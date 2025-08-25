import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import * as Font from 'expo-font';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../../components/Header';
import FooterComIcones from '../../components/FooterComIcones';

export default function FuncionalidadesAlunoResponsavel({ navigation }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    
    const [dias, setDias] = useState([
        { id: 1, nome: 'SEGUNDA', inicio: null, fim: null },
        { id: 2, nome: 'TERÇA', inicio: null, fim: null },
        { id: 3, nome: 'QUARTA', inicio: null, fim: null },
        { id: 4, nome: 'QUINTA', inicio: null, fim: null },
        { id: 5, nome: 'SEXTA', inicio: null, fim: null },
        { id: 6, nome: 'SÁBADO', inicio: null, fim: null },
    ]);

    const [showPicker, setShowPicker] = useState(false);
    const [currentDiaId, setCurrentDiaId] = useState(null);
    const [currentTipo, setCurrentTipo] = useState(null);
    const [time, setTime] = useState(new Date());

    const loadFonts = async () => {
        try {
            await Font.loadAsync({
                'PoppinsRegular': require('../../assets/fonts/PoppinsRegular.ttf'),
                'PoppinsBold': require('../../assets/fonts/PoppinsBold.ttf'),
            });
        } catch (error) {
            console.error("Erro ao carregar as fontes:", error);
        } finally {
            setFontsLoaded(true);
        }
    };

    useEffect(() => {
        loadFonts();
    }, []);

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
        <SafeAreaView style={styles.safeArea}>
            <Header />

            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.containerPrincipal}>
                    <Text style={styles.tituloAba}>Horários</Text>
                    
                    {dias.map(dia => (
                        <View key={dia.id} style={styles.cardDia}>
                            <View style={styles.headerDia}>
                                <Text style={styles.textoDia}>{dia.nome}</Text>
                            </View>
                            
                            <View style={styles.secaoHorarios}>
                                {/* Seção de Início */}
                                <View style={styles.blocoHorario}>
                                    <Text style={styles.labelHorario}>Início</Text>
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
                                
                                {/* Seção de Fim */}
                                <View style={styles.blocoHorario}>
                                    <Text style={styles.labelHorario}>Fim</Text>
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
                </View>
            </ScrollView>

            <FooterComIcones />

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
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 25,
    },
    tituloAba: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#3D3D3D',
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
        color: '#666',
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
        color: '#333',
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
        color: '#3D3D3D',
    },
});
