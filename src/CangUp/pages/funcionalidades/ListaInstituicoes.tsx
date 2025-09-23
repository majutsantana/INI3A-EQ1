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
} from 'react-native';
import * as Font from 'expo-font';
import { Feather } from '@expo/vector-icons';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import useApi from '../../hooks/useApi';
import { AuthContext } from '../../components/AuthContext';

type Instituicao = {
    id: number;
    nome: string;
    email: string;
    endereco: string;
    plano: string;
}

    export default function FuncionalidadesAlunoResponsavel({navigation}) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const { url } = useApi();
    const { logout } = useContext(AuthContext);

    // Carregar fontes
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

    // Buscar instituições no backend
    const fetchInstituicoes = async () => {
        try {
            const response = await fetch(`${url}/api/instituicoes`); // ajuste o endpoint se precisar
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
            return <Text style={styles.infoInstituicao}>Plano: Anual</Text>;
        } else if (plano === 'S') {
            return <Text style={styles.infoInstituicao}>Plano: Semestral</Text>;
        } else {
            return null;
        }
    };
    

    if (!fontsLoaded || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#BEACDE" />
            </View>
        );
    }

    // Filtrando as instituições
    const instituicoesFiltradas = instituicoes.filter(inst =>
        inst.nome.toLowerCase().includes(busca.toLowerCase())
    ); 

    return (
        <SafeAreaView style={styles.safeArea}>
            <HeaderComLogout />

            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <Text style={styles.tituloAba}>Instituições</Text>

                {/* Campo de busca */}
                <TextInput
                    style={styles.inputBusca}
                    placeholder="Buscar instituição..."
                    placeholderTextColor="#888"
                    value={busca}
                    onChangeText={setBusca}
                />

                {instituicoesFiltradas.length === 0 ? (
                    <Text style={styles.textoDia}>Nenhuma instituição encontrada.</Text>
                ) : (
                    instituicoesFiltradas.map((inst) => (
                        <View key={inst.id} style={styles.cardInstituicao}>
                            <Text style={styles.nomeInstituicao}>{inst.nome}</Text>
                            <Text style={styles.infoInstituicao}> 📧 {inst.email}</Text>
                            <Text style={styles.infoInstituicao}> 📍 {inst.endereco}</Text>
                            {verificaPlano(inst.plano)}                        
                        </View>
                    ))
                )}
            </ScrollView>
            <TouchableOpacity activeOpacity={0.8} style={styles.fab} onPress={() => navigation.navigate(`CadastroInstituicao`)} accessibilityLabel="Adicionar">
                <Feather name="plus" size={28} color="#fff" />
            </TouchableOpacity>

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
    cardInstituicao: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#FFF',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    nomeInstituicao: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#522a91',
        marginBottom: 8,
    },
    infoInstituicao: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#333',
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
});
