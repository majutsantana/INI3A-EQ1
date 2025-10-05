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
    Alert,
    Image
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
    id_inst: number;
    imagem?: string;
}

type Responsavel = {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    id_inst: number;
    imagem?: string;
}

type Instituicao = {
    id: number;
}

export default function ListaInstituicoes({ navigation }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState<'alunos' | 'responsaveis'>('alunos'); // Novo estado para a aba ativa
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
    const [loading, setLoading] = useState(true);
    const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
    const [busca, setBusca] = useState('');
    const { url } = useApi();
    const { logout, token } = useContext(AuthContext);

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
                Alert.alert("Erro", "Falha ao carregar dados da instituição.");
                return;
            }
            const data = await res.json();
            setInstituicao(data);
        } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Não foi possível buscar os dados da instituição.");
        }
    };

    const fetchAlunos = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${url}/api/alunos`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    }
                }
            );
            if (!response.ok) throw new Error("Erro ao buscar alunos");
            const data: Aluno[] = await response.json();
            setAlunos(data);
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
        }
    };

    const fetchResponsaveis = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${url}/api/responsaveis`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    }
                }
            );
            if (!response.ok) throw new Error("Erro ao buscar responsáveis");
            const data: Responsavel[] = await response.json();
            setResponsaveis(data);
        } catch (error) {
            console.error("Erro ao buscar responsáveis:", error);
        } 
    };
    
    const fetchData = async () => {
        setLoading(true);
        await Promise.all([
            fetchInstituicao(),
            fetchAlunos(),
            fetchResponsaveis(),
            loadFonts(),
        ]);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExcluirAluno = async (id: number, nome: string) => {
        if (confirm("Deseja mesmo excluir o aluno " + nome + "?")) {
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
                Alert.alert("Sucesso", `Aluno ${nome} excluído.`);

            } catch (error) {
                console.error("Erro durante o processo de exclusão:", error);
                Alert.alert("Erro", "Não foi possível excluir o aluno.");
            }
        }
    };

    const handleExcluirResponsavel = async (id: number, nome: string) => {
        if (confirm("Deseja mesmo excluir o responsável " + nome + "?")) {
            try {
                const token = await AsyncStorage.getItem('jwt');
                const response = await fetch(`${url}/api/responsaveis/${id}`, {
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

                setResponsaveis(prevResponsaveis =>
                    prevResponsaveis.filter(resp => resp.id !== id)
                );
                Alert.alert("Sucesso", `Responsável ${nome} excluído.`);

            } catch (error) {
                console.error("Erro durante o processo de exclusão:", error);
                Alert.alert("Erro", "Não foi possível excluir o responsável.");
            }
        }
    };

    const alunosFiltrados = alunos.filter(alun =>
        alun.id_inst === instituicao?.id &&
        alun.nome.toLowerCase().includes(busca.toLowerCase())
    ).sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }));

    const responsaveisFiltrados = responsaveis.filter(resp =>
        resp.id_inst === instituicao?.id &&
        resp.nome.toLowerCase().includes(busca.toLowerCase())
    ).sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }));

    if (!fontsLoaded || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#522a91" />
            </View>
        );
    }

    const CardItem = ({ item, type }: { item: Aluno | Responsavel, type: 'aluno' | 'responsavel' }) => (
        <View style={styles.cardItem}>
            <TouchableOpacity 
                style={styles.fabExcluir} 
                onPress={() => 
                    type === 'aluno' 
                    ? handleExcluirAluno(item.id, item.nome) 
                    : handleExcluirResponsavel(item.id, item.nome)
                }
            >
                <Feather name="trash-2" size={18} color="#fff" />
            </TouchableOpacity>
            
             <Image
                source={
                    item.imagem
                    ? { uri: item.imagem }
                    : require("../../assets/images/FotoPerfil.png") 
                }
                style={styles.fotoItem}
            />
            
            <View style={styles.infoContainer}>
                <Text style={styles.nomeItem}>{item.nome}</Text>
                
                {type === 'aluno' && 'ra' in item && (
                    <Text style={styles.infoItem}> 🧑‍🎓 RA: {item.ra}</Text>
                )}
                {'cpf' in item && (
                    <Text style={styles.infoItem}> 🪪 CPF: {item.cpf}</Text>
                )}
                {item.email ? (
                    <Text style={styles.infoItem}> 📧 E-mail: {item.email}</Text>
                ) : (
                    <Text style={styles.cadastroPendenteText}>
                        {type === 'aluno' ? 'Aluno' : 'Responsável'} não finalizou o cadastro!
                    </Text>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <HeaderComLogout />

            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <Text style={styles.tituloAba}>
                    {activeTab === 'alunos' ? 'Lista de Alunos' : 'Lista de Responsáveis'}
                </Text>

                <View style={styles.inputBuscaContainer}>
                    <TextInput
                        style={styles.inputBusca}
                        placeholder={activeTab === 'alunos' ? "Buscar aluno..." : "Buscar responsável..."}
                        placeholderTextColor="#888"
                        value={busca}
                        onChangeText={setBusca}
                    />
                    <Feather name="search" size={20} color="#888" style={styles.iconeBusca} />
                </View>

                {activeTab === 'alunos' ? (
                    alunosFiltrados.length === 0 ? (
                        <Text style={styles.textoDia}>Nenhum aluno encontrado.</Text>
                    ) : (
                        alunosFiltrados.map((alun) => (
                            <CardItem key={alun.id} item={alun} type="aluno" />
                        ))
                    )
                ) : (
                    responsaveisFiltrados.length === 0 ? (
                        <Text style={styles.textoDia}>Nenhum responsável encontrado.</Text>
                    ) : (
                        responsaveisFiltrados.map((resp) => (
                            <CardItem key={resp.id} item={resp} type="responsavel" />
                        ))
                    )
                )}
            </ScrollView>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'alunos' && styles.activeTabButton]}
                    onPress={() => { setActiveTab('alunos'); setBusca(''); }}
                >
                    <Text style={[styles.tabText, activeTab === 'alunos' && styles.activeTabText]}>
                        Lista de Alunos
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'responsaveis' && styles.activeTabButton]}
                    onPress={() => { setActiveTab('responsaveis'); setBusca(''); }}
                >
                    <Text style={[styles.tabText, activeTab === 'responsaveis' && styles.activeTabText]}>
                        Lista de Responsáveis
                    </Text>
                </TouchableOpacity>
            </View>
            <FooterComIcones nav={navigation}/>
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#522a91',
        padding: 0,
        marginHorizontal: '5%',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: '20%',
        marginTop: '5%',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#522a91', 
        borderWidth: 0,
    },
    activeTabButton: {
        backgroundColor: '#733FC9',
    },
    tabText: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#BEACDE',
    },
    activeTabText: {
        fontFamily: 'PoppinsBold',
        color: '#fff',
        fontWeight: 'bold',
    },

    inputBuscaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#DDD',
        height: 50,
    },
    inputBusca: {
        flex: 1,
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#333',
        padding: 0,
    },
    iconeBusca: {
        marginLeft: 10,
    },
    
    cardItem: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#FFF',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        position: "relative",
        flexDirection: 'row',
        alignItems: 'center',
    },
    fotoItem: {
        width: 60,
        height: 60,
        borderRadius: 30, 
        marginRight: 15,
        borderWidth: 2,
        borderColor: '#BEACDE',
        backgroundColor: '#E0E0E0', 
    },
    fotoPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    fotoPlaceholderText: {
        fontFamily: 'PoppinsRegular',
        fontSize: 12,
        color: '#666',
    },
    infoContainer: {
        flex: 1,
    },
    nomeItem: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#522a91',
        marginBottom: 8,
    },
    infoItem: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#333',
    },
    cadastroPendenteText: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#522a91',
        marginTop: 5,
        fontStyle: 'italic',
    },
    textoDia: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    fabExcluir: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#E53935", 
        borderRadius: 20,
        padding: 8, 
        elevation: 5,
        zIndex: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
    },
});