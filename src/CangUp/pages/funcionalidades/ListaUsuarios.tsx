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
    Image,
    Modal, // Importação adicionada
} from 'react-native';
import * as Font from 'expo-font';
import { Feather } from '@expo/vector-icons';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import useApi from '../../hooks/useApi';
import { AuthContext } from '../../components/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

// Tipos de dados
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

// ATUALIZADO: Adicionado o e-mail, que é necessário para a confirmação
type Instituicao = {
    id: number;
    email: string;
}

export default function ListaUsuarios({ navigation }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState<'alunos' | 'responsaveis'>('alunos');
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
    const [loading, setLoading] = useState(true);
    const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
    const [busca, setBusca] = useState('');
    const { url } = useApi();
    const { logout, token } = useContext(AuthContext);
    const { theme, toggleTheme, colors } = useTheme();

    // NOVOS ESTADOS PARA O MODAL
    const [modalVisivel, setModalVisivel] = useState(false);
    const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<Aluno | Responsavel | null>(null);
    const [textoConfirmacao, setTextoConfirmacao] = useState('');
    const [erroConfirmacao, setErroConfirmacao] = useState('');

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
            const id = await AsyncStorage.getItem("id_instituicao");
            if (!token || !id) {
                Alert.alert("Erro", "Sessão inválida. Por favor, faça login novamente.");
                logout();
                return;
            }
            const res = await fetch(`${url}/api/instituicoes/${id}`, {
                method: "GET", headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) {
                throw new Error("Falha ao carregar dados da instituição.");
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
            const response = await fetch(`${url}/api/alunos`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                }
            });
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
            const response = await fetch(`${url}/api/responsaveis`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                }
            });
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
        const unsubscribe = navigation.addListener('focus', () => {
            fetchData();
        });
        return unsubscribe;
    }, [navigation]);

    // NOVA LÓGICA DE EXCLUSÃO COM MODAL
    const abrirModalExclusao = (usuario: Aluno | Responsavel) => {
        setUsuarioParaExcluir(usuario);
        setModalVisivel(true);
        setTextoConfirmacao('');
        setErroConfirmacao('');
    };

    const handleInputChange = (text: string) => {
        setTextoConfirmacao(text);
        if (erroConfirmacao) setErroConfirmacao('');
    };

    const handleConfirmarExclusao = async () => {
        if (!usuarioParaExcluir || !instituicao?.email) {
            setErroConfirmacao('Erro interno. Não foi possível carregar os dados para confirmação.');
            return;
        }

        const stringEsperada = `${instituicao.email}/${usuarioParaExcluir.cpf}`;
        const stringDigitada = textoConfirmacao.trim();

        if (stringDigitada !== stringEsperada) {
            setErroConfirmacao('Confirmação inválida. Verifique o e-mail da instituição e o CPF do usuário.');
            return;
        }

        const ehAluno = 'ra' in usuarioParaExcluir;
        const endpoint = ehAluno ? 'alunos' : 'responsaveis';
        const tipoUsuario = ehAluno ? 'Aluno' : 'Responsável';

        try {
            const authToken = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${url}/api/${endpoint}/${usuarioParaExcluir.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Falha na API: ${response.status}`);
            }

            if (ehAluno) {
                setAlunos(prev => prev.filter(item => item.id !== usuarioParaExcluir.id));
            } else {
                setResponsaveis(prev => prev.filter(item => item.id !== usuarioParaExcluir.id));
            }

            setModalVisivel(false);
            Alert.alert('Sucesso', `${tipoUsuario} excluído com sucesso.`);

        } catch (error) {
            console.error(`Erro ao excluir ${tipoUsuario}:`, error);
            Alert.alert('Erro', `Não foi possível excluir o ${tipoUsuario}.`);
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
        <View style={theme === 'light' ? styles.cardItem : styles.cardItemDark}>
            {/* MODIFICADO: OnPress agora abre o modal */}
            <TouchableOpacity 
                style={styles.fabExcluir}
                onPress={() => abrirModalExclusao(item)}
            >
                <Feather name="trash-2" size={18} color="#fff" />
            </TouchableOpacity>
            
            <Image
                source={
                    item.imagem
                    ? { uri: item.imagem }
                    : require("../../assets/images/FotoPerfil.png") 
                }
                style={theme === 'light' ? styles.fotoItem : styles.fotoItemDark}
            />
            
            <View style={styles.infoContainer}>
                <Text style={theme === 'light' ? styles.nomeItem : styles.nomeItemDark}>
                    {item.nome}
                </Text>
                
                {type === 'aluno' && 'ra' in item && (
                    <Text style={theme === 'light' ? styles.infoItem : styles.infoItemDark}> 🧑‍🎓 RA: {item.ra}</Text>
                )}
                {'cpf' in item && (
                    <Text style={theme === 'light' ? styles.infoItem : styles.infoItemDark}> 🪪 CPF: {item.cpf}</Text>
                )}
                {item.email ? (
                    <Text style={theme === 'light' ? styles.infoItem : styles.infoItemDark}> 📧 E-mail: {item.email}</Text>
                ) : (
                    <Text style={theme === 'light' ? styles.cadastroPendenteText : styles.cadastroPendenteTextDark}> 
                        {type === 'aluno' ? 'Aluno' : 'Responsável'} não finalizou o cadastro!
                    </Text>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={theme === 'light' ? styles.safeArea : styles.safeAreaDark}>
            <HeaderComLogout />

            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <Text style={theme === 'light' ? styles.tituloAba : styles.tituloAbaDark}>
                    {activeTab === 'alunos' ? 'Lista de Alunos' : 'Lista de Responsáveis'}
                </Text>

                <View style={theme === 'light' ? styles.inputBuscaContainer : styles.inputBuscaContainerDark}>
                    <TextInput
                        style={theme === 'light' ? styles.inputBusca : styles.inputBuscaDark}
                        placeholder={activeTab === 'alunos' ? "Buscar aluno..." : "Buscar responsável..."}
                        placeholderTextColor={theme === 'light' ? "#888" : "#AAA"}
                        value={busca}
                        onChangeText={setBusca}
                    />
                    <Feather name="search" size={20} color={theme === 'light' ? "#888" : "#AAA"} style={styles.iconeBusca} />
                </View>

                {activeTab === 'alunos' ? (
                    alunosFiltrados.length === 0 ? (
                        <Text style={theme === 'light' ? styles.textoDia : styles.textoDiaDark}>Nenhum aluno encontrado.</Text>
                    ) : (
                        alunosFiltrados.map((alun) => (
                            <CardItem key={`aluno-${alun.id}`} item={alun} type="aluno" />
                        ))
                    )
                ) : (
                    responsaveisFiltrados.length === 0 ? (
                        <Text style={theme === 'light' ? styles.textoDia : styles.textoDiaDark}>Nenhum responsável encontrado.</Text>
                    ) : (
                        responsaveisFiltrados.map((resp) => (
                            <CardItem key={`resp-${resp.id}`} item={resp} type="responsavel" />
                        ))
                    )
                )}
            </ScrollView>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabButton, 
                        activeTab === 'alunos' ? (theme === 'dark' ? styles.activeTabButtonDark : styles.activeTabButton) : (theme === 'dark' && styles.tabButtonDark) 
                    ]}
                    onPress={() => { setActiveTab('alunos'); setBusca(''); }}
                >
                    <Text style={[
                        styles.tabText, 
                        activeTab === 'alunos' ? styles.activeTabText : theme === 'dark' && styles.tabTextDark
                    ]}>
                        Lista de Alunos
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton, 
                        activeTab === 'responsaveis' ? (theme === 'dark' ? styles.activeTabButtonDark : styles.activeTabButton) : (theme === 'dark' && styles.tabButtonDark) 
                    ]}
                    onPress={() => { setActiveTab('responsaveis'); setBusca(''); }}
                >
                    <Text style={[
                        styles.tabText, 
                        activeTab === 'responsaveis' ? styles.activeTabText : theme === 'dark' && styles.tabTextDark
                    ]}>
                        Lista de Responsáveis
                    </Text>
                </TouchableOpacity>
            </View>
            <FooterComIcones nav={navigation}/>

            {/* NOVO: MODAL DE CONFIRMAÇÃO */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisivel}
                onRequestClose={() => setModalVisivel(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={theme === 'light' ? styles.modalView : styles.modalViewDark}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisivel(false)}>
                            <Feather name="x" size={24} color={theme === 'light' ? '#333' : '#FFF'} />
                        </TouchableOpacity>
                        
                        <Text style={theme === 'light' ? styles.modalTitle : styles.modalTitleDark}>Confirmar Exclusão</Text>
                        <Text style={theme === 'light' ? styles.modalText : styles.modalTextDark}>
                            Para excluir <Text style={{ fontFamily: 'PoppinsBold' }}>{usuarioParaExcluir?.nome}</Text>, digite o texto abaixo:
                        </Text>
                        
                        <Text style={theme === 'light' ? styles.modalFormatText : styles.modalFormatTextDark}>
                            {instituicao?.email}/{usuarioParaExcluir?.cpf}
                        </Text>

                        <TextInput
                            style={theme === 'light' ? styles.modalInput : styles.modalInputDark}
                            placeholder="email-instituicao/cpf-usuario"
                            placeholderTextColor="#999"
                            value={textoConfirmacao}
                            onChangeText={handleInputChange}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        
                        {erroConfirmacao ? <Text style={styles.errorText}>{erroConfirmacao}</Text> : null}

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleConfirmarExclusao}
                            >
                                <Text style={styles.buttonText}>Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    inputBuscaContainerDark: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#555',
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
        height: 50,
    },
    inputBusca: {
        flex: 1,
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#333',
        padding: 0,
    },
    inputBuscaDark: {
        flex: 1,
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#FFF',
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
    cardItemDark: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#555', 
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.3,
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
        borderColor: '#522a91', 
        backgroundColor: '#E0E0E0', 
    },
    fotoItemDark: {
        width: 60,
        height: 60,
        borderRadius: 30, 
        marginRight: 15,
        borderWidth: 2,
        borderColor: '#E8A326', 
        backgroundColor: '#E0E0E0', 
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
    nomeItemDark: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#E8A326', 
        marginBottom: 8,
    },
    infoItem: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#333', 
    },
    infoItemDark: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#E0E0E0', 
    },
    cadastroPendenteText: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#522a91', 
        marginTop: 5,
        fontStyle: 'italic',
    },
    cadastroPendenteTextDark: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#E8A326', 
        marginTop: 5,
        fontStyle: 'italic',
    },
    textoDia: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    textoDiaDark: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#AAA',
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'transparent', 
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
    tabButtonDark: {
        backgroundColor: '#E8A326', 
    },
    activeTabButton: {
        backgroundColor: '#733FC9', 
    },
    activeTabButtonDark: {
        backgroundColor: '#fcc753', 
    },
    tabText: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#BEACDE', 
    },
    tabTextDark: {
        color: '#F8E0B0', 
    },
    activeTabText: {
        fontFamily: 'PoppinsBold',
        color: '#fff', 
        fontWeight: 'bold',
    },
    activeTabTextDark: {
        fontFamily: 'PoppinsBold',
        color: '#3D3D3D', 
        fontWeight: 'bold',
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
    // ESTILOS PARA O MODAL
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, paddingTop: 40, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
    modalViewDark: { margin: 20, backgroundColor: '#333', borderRadius: 20, padding: 25, paddingTop: 40, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    modalTitle: { fontFamily: 'PoppinsBold', fontSize: 18, marginBottom: 15, color: '#333' },
    modalTitleDark: { fontFamily: 'PoppinsBold', fontSize: 18, marginBottom: 15, color: '#FFF' },
    modalText: { fontFamily: 'PoppinsRegular', fontSize: 14, marginBottom: 10, textAlign: 'center', color: '#333' },
    modalTextDark: { fontFamily: 'PoppinsRegular', fontSize: 14, marginBottom: 10, textAlign: 'center', color: '#FFF' },
    modalFormatText: { fontFamily: 'PoppinsBold', fontSize: 14, color: '#522a91', backgroundColor: '#f0f0f0', padding: 8, borderRadius: 5, marginBottom: 20, textAlign: 'center' },
    modalFormatTextDark: { fontFamily: 'PoppinsBold', fontSize: 14, color: '#E8A326', backgroundColor: '#555', padding: 8, borderRadius: 5, marginBottom: 20, textAlign: 'center' },
    modalInput: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10, fontFamily: 'PoppinsRegular', marginBottom: 10, textAlign: 'center' },
    modalInputDark: { width: '100%', borderWidth: 1, borderColor: '#777', padding: 10, borderRadius: 10, fontFamily: 'PoppinsRegular', marginBottom: 10, color: '#FFF', backgroundColor: '#555', textAlign: 'center' },
    errorText: { color: '#E53935', fontFamily: 'PoppinsRegular', marginBottom: 15 },
    modalButtonContainer: { 
        width: '100%', 
        marginTop: 10 
    },
    modalButton: { 
        borderRadius: 10, 
        paddingVertical: 12, 
        elevation: 2,
    },
    confirmButton: { 
        backgroundColor: '#E53935' 
    },
    buttonText: { 
        color: 'white', 
        fontFamily: 'PoppinsBold', 
        textAlign: 'center' 
    },
});