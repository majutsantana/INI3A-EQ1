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
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';


export default function FuncionalidadesAlunoResponsavel({ navigation }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);

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
    
    useEffect(() => {
        loadFonts();
        setFontsLoaded(true);
    }, []);


    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#BEACDE" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <HeaderComLogout/>

            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                
            </ScrollView>
            <FooterComIcones />

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