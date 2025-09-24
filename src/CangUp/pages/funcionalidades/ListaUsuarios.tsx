import React, { useState, useEffect, useContext } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    Alert, // Importando o Alert para usar na confirmação
} from 'react-native';
import * as Font from 'expo-font';
import { Feather } from '@expo/vector-icons';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import useApi from '../../hooks/useApi';
import { AuthContext } from '../../components/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definindo o tipo para um Aluno
type Aluno = {
    id: number;
    nome: string;
    ra: string;
    cpf: string;
    email: string;
    id_instituicao: number;
}

export default function ListaUsuarios({ navigation }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const { url } = useApi();
    // Obtendo o 'usuario' do contexto, que contém os dados da instituição logada
    const { usuario } = useContext(AuthContext);

    // Carregar fontes personalizadas
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

    // Buscar alunos da instituição logada no backend
    // Substitua a função fetchAlunos existente por esta no seu arquivo ListaUsuarios.js

const fetchAlunos = async () => {
    // Garante que só vamos buscar os alunos se tivermos o ID da instituição
    if (!usuario?.id) {
        setLoading(false);
        return;
    }

    try {
        setLoading(true);
        const token = await AsyncStorage.getItem('jwt');
        
        // 1. Voltamos a buscar na rota principal de alunos
        const response = await fetch(`${url}/api/alunos`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar a lista completa de alunos");
        }

        const todosOsAlunos: Aluno[] = await response.json();

        // 2. Filtramos a lista aqui no frontend para pegar apenas os da instituição logada
        const alunosDaInstituicao = todosOsAlunos.filter(
            aluno => aluno.id_instituicao === usuario.id
        );

        // 3. Atualizamos o estado com a lista já filtrada
        setAlunos(alunosDaInstituicao);

    } catch (error) {
        console.error("Erro ao buscar e filtrar alunos:", error);
    } finally {
        setLoading(false);
    }
};

    // Efeito para carregar fontes e buscar dados iniciais
    useEffect(() => {
        loadFonts();
        fetchAlunos();
    }, [usuario]); // A busca de alunos agora depende do 'usuario' estar carregado

    // Função para excluir um aluno
    const handleExcluirAluno = async (id: number, nome: string) => {
        // Usando o Alert nativo para uma melhor experiência do usuário
        Alert.alert(
            "Confirmar Exclusão",
            `Deseja mesmo excluir o aluno ${nome}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: async () => {
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

                            // Remove o aluno da lista no estado local para atualizar a UI
                            setAlunos(prevAlunos =>
                                prevAlunos.filter(aluno => aluno.id !== id)
                            );
                            Alert.alert("Sucesso", `Aluno ${nome} excluído.`);
                        } catch (error) {
                            console.error("Erro durante o processo de exclusão:", error);
                            Alert.alert("Erro", "Não foi possível excluir o aluno.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // Tela de carregamento enquanto as fontes ou os dados não chegam
    if (!fontsLoaded || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#BEACDE" />
            </View>
        );
    }

    // Filtrando os alunos com base no texto da busca
    const alunosFiltrados = alunos.filter(aluno =>
        aluno.nome.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <HeaderComLogout />

            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <Text style={styles.tituloAba}>Alunos</Text>

                {/* Campo de busca */}
                <TextInput
                    style={styles.inputBusca}
                    placeholder="Buscar aluno por nome..."
                    placeholderTextColor="#888"
                    value={busca}
                    onChangeText={setBusca}
                />

                {alunosFiltrados.length === 0 ? (
                    <Text style={styles.textoInfo}>Nenhum aluno encontrado.</Text>
                ) : (
                    alunosFiltrados.map((aluno) => (
                        <View key={aluno.id} style={styles.cardAluno}>
                            {/* Botão de excluir posicionado no canto do card */}
                            <TouchableOpacity style={styles.fabExcluir} onPress={() => handleExcluirAluno(aluno.id, aluno.nome)}>
                                <Feather name="trash-2" size={18} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.nomeAluno}>{aluno.nome}</Text>
                            <Text style={styles.infoAluno}>🧑‍🎓 RA: {aluno.ra}</Text>
                            <Text style={styles.infoAluno}>🪪 CPF: {aluno.cpf}</Text>
                            <Text style={styles.infoAluno}>📧 E-mail: {aluno.email}</Text>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* **LÓGICA AJUSTADA**: Botão para navegar para a tela de cadastro de usuário */}
            <TouchableOpacity activeOpacity={0.8} style={styles.fab} onPress={() => navigation.navigate(`CadastroUsuario`)} accessibilityLabel="Adicionar Aluno">
                <Feather name="plus" size={28} color="#fff" />
            </TouchableOpacity>

            <FooterComIcones />
        </SafeAreaView>
    );
}

// Estilos (mantidos conforme o original, apenas com uma pequena alteração de nome)
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
        fontSize: 22, // Um pouco maior para dar mais destaque
        color: '#3D3D3D',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputBusca: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
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
        elevation: 3,
        position: "relative"
    },
    nomeAluno: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#522a91',
        marginBottom: 8,
        paddingRight: 40, // Espaço para não ficar embaixo do botão excluir
    },
    infoAluno: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#555', // Cor um pouco mais suave
        lineHeight: 22, // Melhor espaçamento entre linhas
    },
    textoInfo: { // Renomeado de textoDia para um nome mais genérico
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
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
        backgroundColor: "#E53935",
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 10,
    },
});