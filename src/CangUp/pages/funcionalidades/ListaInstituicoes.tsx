import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/core';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import * as Font from 'expo-font';
import { Feather } from '@expo/vector-icons';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterSemIcones from '../../components/FooterSemIcones';
import useApi from '../../hooks/useApi';
import { AuthContext } from '../../components/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

type Instituicao = {
    id: number;
    nome: string;
    email: string;
    endereco: string;
    plano: string;
}

    export default function ListaInstituicoes({navigation}) { //Navigation não está dando erro 
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const { url } = useApi();
    const { logout, token } = useContext(AuthContext);
    const { theme, toggleTheme, colors } = useTheme();

    const loadFonts = async () => {
        try {
            await Font.loadAsync({
                'PoppinsRegular': require('../../assets/fonts/PoppinsRegular.ttf'),
                'PoppinsBold': require('../../assets/fonts/PoppinsBold.ttf'),
            });
            setFontsLoaded(true);
        } catch (error) {
            console.error("Erro ao carregar as fontes:", error);
        }
    };

    const fetchInstituicoes = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${url}/api/instituicoes`,
                {
                    headers:{
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, 
                }}
            ); // ajuste o endpoint se precisar
            if (!response.ok) throw new Error("Erro ao buscar instituições");
            const data: Instituicao[] = await response.json();
            setInstituicoes(data);
        } catch (error) {
            console.error("Erro:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFonts();
        fetchInstituicoes();
    }, []);

    const verificaPlano = (plano: string) => {
        if (plano === 'A') {
            return <Text style={theme == "light" ? styles.infoInstituicao : styles.infoInstituicaoDark}>Plano: Anual</Text>;
        } else if (plano === 'S') {
            return <Text style={theme == "light" ? styles.infoInstituicao : styles.infoInstituicaoDark}>Plano: Semestral</Text>;
        } else {
            return null;
        }
    };
    
    const handleExcluirInstituicao = async (id: number, nome: string) => {
        if (confirm("Deseja mesmo excluir a instituicao "+nome+"?")){
            console.log(`Iniciando exclusão direta para a instituição ID: ${id}`);
            try {
                const token = await AsyncStorage.getItem('jwt');
                const response = await fetch(`${url}/api/instituicoes/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`, 
                    },
                });
        
                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Falha na API: ${response.status} - ${errorBody}`);
                }
        
                setInstituicoes(prevInstituicoes =>
                    prevInstituicoes.filter(inst => inst.id !== id)
                );
        
                console.log(`Instituição ID: ${id} excluída com sucesso.`);
        
            } catch (error) {
                console.error("Erro durante o processo de exclusão:", error);
            }
        }
    };
      

    if (!fontsLoaded || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#BEACDE" />
            </View>
        );
    }

    const instituicoesFiltradas = instituicoes.filter(inst =>
        inst.nome.toLowerCase().includes(busca.toLowerCase())
    ).sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' })); 

    return (
        <SafeAreaView style={theme == "light" ? styles.safeArea : styles.safeAreaDark}>
            <HeaderComLogout />

            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <Text style={theme == "light" ? styles.tituloAba : styles.tituloAbaDark}>Instituições</Text>

                <TextInput
                    style={theme == 'light' ? styles.inputBusca : styles.inputBuscaDark}
                    placeholder="Buscar instituição..."
                    placeholderTextColor="#888"
                    value={busca}
                    onChangeText={setBusca}
                />

                {instituicoesFiltradas.length === 0 ? (
                    <Text style={theme == 'dark' ? styles.textoDiaDark : styles.textoDia}>Nenhuma instituição encontrada.</Text>
                ) : (
                    instituicoesFiltradas.map((inst) => (
                        <View key={inst.id} style={theme == 'light' ? styles.cardInstituicao: styles.inputBuscaDark}>
                        <TouchableOpacity style={theme == 'dark' ? styles.fabExcluirDark : styles.fabExcluir} onPress={() => handleExcluirInstituicao(inst.id, inst.nome)}>
                            <Feather name="trash-2" size={18} color="#fff" />
                        </TouchableOpacity>
                            <Text style={theme == 'dark' ? styles.nomeInstituicaoDark : styles.nomeInstituicao }>{inst.nome}</Text>
                            <Text style={theme == "light" ? styles.infoInstituicao : styles.infoInstituicaoDark}> 📧 {inst.email}</Text>
                            <Text style={theme == "light" ? styles.infoInstituicao : styles.infoInstituicaoDark}> 📍 {inst.endereco}</Text>
                            {verificaPlano(inst.plano)}                        
                        </View>
                    ))
                )}
            </ScrollView>
            <TouchableOpacity activeOpacity={0.8} style={theme == "light" ? styles.fab : styles.fabDark} onPress={() => navigation.navigate(`CadastroInstituicao`)} accessibilityLabel="Adicionar">
                <Feather name="plus" size={28} color="#fff" />
            </TouchableOpacity>
            <FooterSemIcones />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FCD28D',
    },safeAreaDark: {
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
        padding: 20,
        paddingBottom: 80,
    },
    tituloAba: {
        fontFamily: 'PoppinsBold',
        fontSize: 18,
        color: '#3D3D3D',
        textAlign: 'center',
        marginBottom: 20,
    },
    tituloAbaDark: {
        fontFamily: 'PoppinsBold',
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputBusca: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 12,
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#333',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    inputBuscaDark: {
        backgroundColor: '#555',
        borderRadius: 15,
        padding: 12,
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardInstituicao: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#FFF',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        position: "relative"
    },
    cardInstituicaoDark: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#333',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        position: "relative"
    },
    nomeInstituicao: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#522a91',
        marginBottom: 8,
    },
    nomeInstituicaoDark: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#E8A326',
        marginBottom: 8,
    },
    infoInstituicao: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#333',
    },
    infoInstituicaoDark: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#FFF',
    },
    textoDia: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 90, // sobe acima do footer
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#522a91',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
        },
        fabExcluir: {
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "#E53935", // vermelho do excluir
            borderRadius: 20,
            padding: 10,
            elevation: 5,
            zIndex: 10,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
        },
        textoDiaDark: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
    },
    fabDark: {
        position: 'absolute',
        right: 20,
        bottom: 90, // sobe acima do footer
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E8A326',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
        },
        fabExcluirDark: {
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "#E53935", // vermelho do excluir
            borderRadius: 20,
            padding: 10,
            elevation: 5,
            zIndex: 10,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
        },
});
