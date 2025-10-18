import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/core';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    Alert,
    Modal,
} from 'react-native';
import * as Font from 'expo-font';
import { Feather } from '@expo/vector-icons';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterSemIcones from '../../components/FooterSemIcones';
import useApi from '../../hooks/useApi';
import { AuthContext } from '../../components/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type Instituicao = {
    id: number;
    nome: string;
    email: string;
    endereco: string;
    plano: string;
}

export default function ListaInstituicoes({ navigation }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const { url } = useApi();
    const { logout, token } = useContext(AuthContext);
    const { theme, toggleTheme, colors } = useTheme();

    const [adminLogin, setAdminLogin] = useState('');
    const [modalVisivel, setModalVisivel] = useState(false);
    const [instituicaoParaExcluir, setInstituicaoParaExcluir] = useState<Instituicao | null>(null);
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

    const fetchInstituicoes = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${url}/api/instituicoes`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                }
            });
            if (!response.ok) throw new Error("Erro ao buscar instituições");
            const data: Instituicao[] = await response.json();
            setInstituicoes(data);
        } catch (error) {
            console.error("Erro:", error);
        } finally {
            setLoading(false);
        }
    };

    const getAdminLogin = async () => {
        const login = await AsyncStorage.getItem('userLogin');
        if (login) {
            setAdminLogin(login);
        } else {
            console.warn("Login do administrador não encontrado no AsyncStorage.");
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadFonts();
            fetchInstituicoes();
            getAdminLogin();
        });
        return unsubscribe;
    }, [navigation]);

    const verificaPlano = (plano: string) => {
        if (plano === 'A') {
            return <Text style={theme == "light" ? styles.infoInstituicao : styles.infoInstituicaoDark}>Plano: Anual</Text>;
        } else if (plano === 'S') {
            return <Text style={theme == "light" ? styles.infoInstituicao : styles.infoInstituicaoDark}>Plano: Semestral</Text>;
        } else {
            return null;
        }
    };

    const abrirModalExclusao = (instituicao: Instituicao) => {
        setInstituicaoParaExcluir(instituicao);
        setModalVisivel(true);
        setTextoConfirmacao('');
        setErroConfirmacao('');
    };

    const handleInputChange = (text: string) => {
        setTextoConfirmacao(text);
        if (erroConfirmacao) {
            setErroConfirmacao('');
        }
    };

    const handleConfirmarExclusao = async () => {
        if (!instituicaoParaExcluir || !adminLogin) {
            setErroConfirmacao('Login do admin não carregado. Não é possível confirmar.');
            return;
        }

        const stringEsperada = `${adminLogin}/${instituicaoParaExcluir.email}`;
        const stringDigitada = textoConfirmacao.trim();

        if (stringDigitada !== stringEsperada) {
            setErroConfirmacao('Confirmação inválida. Verifique o login e o e-mail.');
            return;
        }

        try {
            const authToken = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${url}/api/instituicoes/${instituicaoParaExcluir.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Falha na API: ${response.status} - ${errorBody}`);
            }

            setInstituicoes(prev => prev.filter(inst => inst.id !== instituicaoParaExcluir.id));
            setModalVisivel(false);
            Alert.alert('Sucesso', 'Instituição excluída com sucesso.');

        } catch (error) {
            console.error("Erro durante a exclusão:", error);
            Alert.alert('Erro', `Não foi possível excluir a instituição.`);
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
        <SafeAreaProvider style={theme == "light" ? styles.safeArea : styles.safeAreaDark}>
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
                    <Text style={theme == 'light' ? styles.textoDia : styles.textoDiaDark}>Nenhuma instituição encontrada.</Text>
                ) : (
                    instituicoesFiltradas.map((inst) => (
                        <View key={inst.id} style={theme == 'light' ? styles.cardInstituicao : styles.cardInstituicaoDark}>
                            <TouchableOpacity style={theme == 'dark' ? styles.fabExcluirDark : styles.fabExcluir} onPress={() => abrirModalExclusao(inst)}>
                                <Feather name="trash-2" size={18} color="#fff" />
                            </TouchableOpacity>
                            <Text style={theme == 'dark' ? styles.nomeInstituicaoDark : styles.nomeInstituicao}>{inst.nome}</Text>
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

            {/* MODAL MODIFICADO */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisivel}
                onRequestClose={() => setModalVisivel(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={theme === 'light' ? styles.modalView : styles.modalViewDark}>
                        {/* NOVO: Botão 'X' para fechar */}
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisivel(false)}>
                            <Feather name="x" size={24} color={theme === 'light' ? '#333' : '#FFF'} />
                        </TouchableOpacity>
                        
                        <Text style={theme === 'light' ? styles.modalTitle : styles.modalTitleDark}>Confirmar Exclusão</Text>
                        <Text style={theme === 'light' ? styles.modalText : styles.modalTextDark}>
                            Para excluir <Text style={{ fontFamily: 'PoppinsBold' }}>{instituicaoParaExcluir?.nome}</Text>,
                            digite o texto abaixo exatamente como mostrado:
                        </Text>
                        
                        <Text style={theme === 'light' ? styles.modalFormatText : styles.modalFormatTextDark}>
                            {adminLogin}/{instituicaoParaExcluir?.email}
                        </Text>

                        <TextInput
                            style={theme === 'light' ? styles.modalInput : styles.modalInputDark}
                            placeholder="login/email-instituicao"
                            placeholderTextColor="#999"
                            value={textoConfirmacao}
                            onChangeText={handleInputChange}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        
                        {erroConfirmacao ? <Text style={styles.errorText}>{erroConfirmacao}</Text> : null}

                        {/* MODIFICADO: Layout do botão */}
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
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FCD28D' },
    safeAreaDark: { flex: 1, backgroundColor: '#522a91' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FCD28D' },
    scrollViewContainer: { padding: 20, paddingBottom: 80 },
    tituloAba: { fontFamily: 'PoppinsBold', fontSize: 18, color: '#3D3D3D', textAlign: 'center', marginBottom: 20 },
    tituloAbaDark: { fontFamily: 'PoppinsBold', fontSize: 18, color: 'white', textAlign: 'center', marginBottom: 20 },
    inputBusca: { backgroundColor: '#FFF', borderRadius: 15, padding: 12, fontFamily: 'PoppinsRegular', fontSize: 14, color: '#333', marginBottom: 20, borderWidth: 1, borderColor: '#DDD' },
    inputBuscaDark: { backgroundColor: '#555', borderRadius: 15, padding: 12, fontFamily: 'PoppinsRegular', fontSize: 14, color: '#FFF', marginBottom: 20, borderWidth: 1, borderColor: '#333' },
    cardInstituicao: { marginBottom: 15, padding: 15, backgroundColor: '#FFF', borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2, position: "relative" },
    cardInstituicaoDark: { marginBottom: 15, padding: 15, backgroundColor: '#333', borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2, position: "relative" },
    nomeInstituicao: { fontFamily: 'PoppinsBold', fontSize: 16, color: '#522a91', marginBottom: 8 },
    nomeInstituicaoDark: { fontFamily: 'PoppinsBold', fontSize: 16, color: '#E8A326', marginBottom: 8 },
    infoInstituicao: { fontFamily: 'PoppinsRegular', fontSize: 14, color: '#333' },
    infoInstituicaoDark: { fontFamily: 'PoppinsRegular', fontSize: 14, color: '#FFF' },
    textoDia: { fontFamily: 'PoppinsRegular', fontSize: 14, color: '#666', textAlign: 'center' },
    textoDiaDark: { fontFamily: 'PoppinsRegular', fontSize: 14, color: '#FFF', textAlign: 'center' },
    fab: { position: 'absolute', right: 20, bottom: 90, width: 60, height: 60, borderRadius: 30, backgroundColor: '#522a91', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }, shadowRadius: 4 },
    fabDark: { position: 'absolute', right: 20, bottom: 90, width: 60, height: 60, borderRadius: 30, backgroundColor: '#E8A326', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }, shadowRadius: 4 },
    fabExcluir: { position: "absolute", top: 10, right: 10, backgroundColor: "#E53935", borderRadius: 20, padding: 10, elevation: 5, zIndex: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 3 },
    fabExcluirDark: { position: "absolute", top: 10, right: 10, backgroundColor: "#E53935", borderRadius: 20, padding: 10, elevation: 5, zIndex: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 3 },
    
    // --- ESTILOS DO MODAL ATUALIZADOS ---
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, paddingTop: 40, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
    modalViewDark: { margin: 20, backgroundColor: '#333', borderRadius: 20, padding: 25, paddingTop: 40, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
    
    // NOVO: Estilo para o botão 'X' de fechar
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
    
    // MODIFICADO: Container agora só segura um botão, não precisa mais de flexbox row.
    modalButtonContainer: { 
        width: '100%', 
        marginTop: 10 
    },
    
    // MODIFICADO: Estilo base do botão, sem `flex: 1` ou margens laterais.
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