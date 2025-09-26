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
import FooterComIcones from '../../components/FooterComIcones';
import useApi from '../../hooks/useApi';
import { AuthContext } from '../../components/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Aluno = {
    id: number;
    nome: string;
    ra: string;
    email: string;
    cpf: string;
    id_instituicao: number;
}

type Instituicao = {
    id: number;
}

    export default function ListaInstituicoes({navigation}) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [loading, setLoading] = useState(true);
    const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
    const [busca, setBusca] = useState('');
    const { url } = useApi();
    const { logout, token } = useContext(AuthContext);

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

    const fetchInstituicao = async () => {
        try {
            const token = await AsyncStorage.getItem("jwt");
            if (!token) {
                Alert.alert("Erro", "Você precisa estar logado.");
                logout();
                return;
            }
            const id = await AsyncStorage.getItem("id_instituicao");
            if (!id) {
                Alert.alert("Erro", "ID da instituição não encontrado.");
                logout();
                return;
            }
            const res = await fetch(`${url}/api/instituicoes/${id}`, {
                method: "GET", headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) {
                Alert.alert("Erro", "Falha ao carregar dados.");
                return;
            }
            const data = await res.json();
            setInstituicao(data);
        } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Não foi possível buscar os dados.");
        }
    };

    const fetchAlunos = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${url}/api/alunos`,
                {
                    headers:{
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, 
                }}
            ); // ajuste o endpoint se precisar
            if (!response.ok) throw new Error("Erro ao buscar alunos");
            const data: Aluno[] = await response.json();
            setAlunos(data);
        } catch (error) {
            console.error("Erro:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFonts();
        fetchInstituicao();
        fetchAlunos();
    }, []);
    
    const handleExcluirAluno = async (id: number, nome: string) => {
        if (confirm("Deseja mesmo excluir o aluno "+nome+"?")){
            console.log(`Iniciando exclusão direta para o aluno ID: ${id}`);
            try {
                const token = await AsyncStorage.getItem('jwt');
                const response = await fetch(`${url}/api/alunos/${id}`, {
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
        
                setAlunos(prevAlunos =>
                    prevAlunos.filter(alun => alun.id !== id)
                );
        
                console.log(`Aluno ID: ${id} excluído com sucesso.`);
        
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

    /*const alunosFiltrados = alunos.filter(alun =>
        alun.nome.toLowerCase().includes(busca.toLowerCase())
    ); */

    const alunosFiltrados = alunos.filter(alun =>
        alun.id_instituicao === instituicao?.id &&
        alun.nome.toLowerCase().includes(busca.toLowerCase())
    );


    return (
        <SafeAreaView style={styles.safeArea}>
            <HeaderComLogout />

            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <Text style={styles.tituloAba}>Alunos</Text>

                {/* Campo de busca */}
                <TextInput
                    style={styles.inputBusca}
                    placeholder="Buscar aluno..."
                    placeholderTextColor="#888"
                    value={busca}
                    onChangeText={setBusca}
                />

                {alunosFiltrados.length === 0 ? (
                    <Text style={styles.textoDia}>Nenhum aluno encontrado.</Text>
                ) : (
                    alunosFiltrados.map((alun) => (
                        <View key={alun.id} style={styles.cardAluno}>
                        <TouchableOpacity style={styles.fabExcluir} onPress={() => handleExcluirAluno(alun.id, alun.nome)}>
                            <Feather name="trash-2" size={18} color="#fff" />
                        </TouchableOpacity>
                            <Text style={styles.nomeAluno}>{alun.nome}</Text>
                            <Text style={styles.infoAluno}> 🧑‍🎓 RA: {alun.ra}</Text>
                            <Text style={styles.infoAluno}> 🪪 CPF: {alun.cpf}</Text>
                            <Text style={styles.infoAluno}> 📧 E-mail: {alun.email}</Text>
                        </View>
                    ))
                )}
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
    cardAluno: {
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
    nomeAluno: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#522a91',
        marginBottom: 8,
    },
    infoAluno: {
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
        bottom: 90, 
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
            backgroundColor: "#E53935", // vermelho
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
