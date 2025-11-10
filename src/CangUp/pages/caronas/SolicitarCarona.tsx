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
    Image,
} from 'react-native';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import { useTheme } from '../../context/ThemeContext';
import useApi from '../../hooks/useApi';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type ResponsavelDisponivel = {
    id_responsavel: number;
    nome_responsavel: string;
    dia_semana: number;
    dia_semana_nome: string;
    tipo: string;
    hora: string;
    imagem: string | null;
    distancia_km: number | null;
};

type CaronaAceita = {
    id: number;
    id_responsavel: number;
    nome_responsavel: string;
    imagem_responsavel: string | null;
    telefone_responsavel: string;
    endereco_aluno: string;
    imagem_aluno: string | null;
    dia_semana: number;
    dia_semana_nome: string;
    tipo: string;
    hora: string;
    data_aceitacao: string;
};

export default function SolicitarCarona({ navigation }) {
    const { url } = useApi();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [responsaveisDisponiveis, setResponsaveisDisponiveis] = useState<ResponsavelDisponivel[]>([]);
    const [caronasAceitas, setCaronasAceitas] = useState<CaronaAceita[]>([]);
    const [mostrarAceitas, setMostrarAceitas] = useState(false);
    const [diaAberto, setDiaAberto] = useState<number | null>(null); // null = nenhum aberto
    const { theme } = useTheme();

    const nomesDias = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    const formatarHorario = (horario: string | undefined | null): string => {
        if (!horario || horario.trim() === '') {
            return '--:--';
        }
        
        const horarioLimpo = horario.trim();
        
        // Se já está no formato HH:mm, retorna direto
        if (/^\d{2}:\d{2}$/.test(horarioLimpo)) {
            return horarioLimpo;
        }
        
        // Se está no formato HH:mm:ss, remove os segundos
        if (/^\d{2}:\d{2}:\d{2}$/.test(horarioLimpo)) {
            return horarioLimpo.substring(0, 5);
        }
        
        // Se é um timestamp ISO (UTC), extrai apenas a hora
        if (horarioLimpo.includes('T')) {
            try {
                // Tenta extrair diretamente do formato ISO: 2025-11-06T07:15:00.000Z
                const timeMatch = horarioLimpo.match(/T(\d{2}):(\d{2})/);
                if (timeMatch) {
                    return `${timeMatch[1]}:${timeMatch[2]}`;
                }
                // Se não conseguir, usa Date (mas pode ter problemas de timezone)
                const date = new Date(horarioLimpo);
                const hours = date.getUTCHours().toString().padStart(2, '0');
                const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            } catch (e) {
                console.error("Erro ao formatar timestamp:", e);
                return '--:--';
            }
        }
        
        // Tenta extrair HH:mm de qualquer formato
        const match = horarioLimpo.match(/^(\d{2}):(\d{2})/);
        if (match) {
            return match[0];
        }
        
        return '--:--';
    };

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

    const carregarDados = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const idAluno = await AsyncStorage.getItem('id_aluno');

            if (!token || !idAluno) {
                Alert.alert("Erro", "Você precisa estar logado.");
                return;
            }

            setLoading(true);

            // Carregar responsáveis disponíveis
            const responseDisponiveis = await fetch(`${url}/api/alunos/${idAluno}/responsaveis-disponiveis`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (responseDisponiveis.ok) {
                try {
                    const responseText = await responseDisponiveis.text();
                    if (responseText && responseText.trim()) {
                        const data = JSON.parse(responseText);
                        setResponsaveisDisponiveis(data);
                    } else {
                        console.warn("Resposta vazia de responsáveis disponíveis");
                        setResponsaveisDisponiveis([]);
                    }
                } catch (e) {
                    console.error("Erro ao parsear JSON de responsáveis disponíveis:", e);
                    setResponsaveisDisponiveis([]);
                }
            } else {
                console.warn("Erro ao buscar responsáveis disponíveis:", responseDisponiveis.status);
                setResponsaveisDisponiveis([]);
            }

            // Carregar caronas aceitas
            const responseAceitas = await fetch(`${url}/api/alunos/${idAluno}/caronas-aceitas`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (responseAceitas.ok) {
                try {
                    const responseText = await responseAceitas.text();
                    if (responseText && responseText.trim()) {
                        const data = JSON.parse(responseText);
                        setCaronasAceitas(data);
                    } else {
                        console.warn("Resposta vazia de caronas aceitas");
                        setCaronasAceitas([]);
                    }
                } catch (e) {
                    console.error("Erro ao parsear JSON de caronas aceitas:", e);
                    setCaronasAceitas([]);
                }
            } else {
                console.warn("Erro ao buscar caronas aceitas:", responseAceitas.status);
                setCaronasAceitas([]);
            }

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            Alert.alert("Erro", "Não foi possível carregar os dados.");
        } finally {
            setLoading(false);
        }
    };

    const solicitarCarona = async (responsavel: ResponsavelDisponivel) => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const idAluno = await AsyncStorage.getItem('id_aluno');

            if (!token || !idAluno) {
                Alert.alert("Erro", "Você precisa estar logado.");
                return;
            }

            Alert.alert(
                "Confirmar Solicitação",
                `Deseja solicitar carona para ${responsavel.nome_responsavel} na ${responsavel.dia_semana_nome} às ${formatarHorario(responsavel.hora)} (${responsavel.tipo === 'entrada' ? 'Entrada' : 'Saída'})?`,
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Solicitar",
                        onPress: async () => {
                            try {
                                // Garante que a hora está no formato HH:mm antes de enviar
                                const horaFormatada = formatarHorario(responsavel.hora);
                                
                                if (horaFormatada === '--:--') {
                                    Alert.alert("Erro", "Horário inválido.");
                                    return;
                                }

                                console.log("Enviando solicitação de carona:", {
                                    id_aluno: parseInt(idAluno),
                                    id_responsavel: responsavel.id_responsavel,
                                    dia_semana: responsavel.dia_semana,
                                    tipo: responsavel.tipo,
                                    hora: horaFormatada,
                                });

                                const response = await fetch(`${url}/api/caronas/solicitar`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        id_aluno: parseInt(idAluno),
                                        id_responsavel: responsavel.id_responsavel,
                                        dia_semana: responsavel.dia_semana,
                                        tipo: responsavel.tipo,
                                        hora: horaFormatada,
                                    })
                                });

                                // Verificar se a resposta tem conteúdo antes de tentar parsear JSON
                                const responseText = await response.text();
                                
                                if (response.ok) {
                                    // Tentar parsear JSON apenas se houver conteúdo
                                    if (responseText && responseText.trim()) {
                                        try {
                                            const responseData = JSON.parse(responseText);
                                            console.log("Resposta do servidor:", responseData);
                                        } catch (e) {
                                            console.warn("Resposta não é JSON válido, mas status é OK:", responseText);
                                        }
                                    }
                                    
                                    Alert.alert("Sucesso!", "Carona solicitada com sucesso!");
                                    
                                    // Aguardar um pouco antes de recarregar para garantir que o servidor processou
                                    setTimeout(() => {
                                        carregarDados();
                                    }, 500);
                                } else {
                                    let errorMessage = "Não foi possível solicitar a carona.";
                                    if (responseText && responseText.trim()) {
                                        try {
                                            const errorData = JSON.parse(responseText);
                                            errorMessage = errorData.error || errorData.message || errorMessage;
                                            console.error("Erro do servidor:", errorData);
                                        } catch (e) {
                                            console.error("Resposta do servidor (texto):", responseText);
                                            errorMessage = responseText.substring(0, 100) || errorMessage;
                                        }
                                    }
                                    Alert.alert("Erro", errorMessage);
                                }
                            } catch (error) {
                                console.error("Erro ao solicitar carona:", error);
                                Alert.alert("Erro", error.message || "Não foi possível solicitar a carona.");
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Erro ao solicitar carona:", error);
            Alert.alert("Erro", "Não foi possível solicitar a carona.");
        }
    };

    const cancelarCarona = async (carona: CaronaAceita) => {
        try {
            const token = await AsyncStorage.getItem('jwt');

            if (!token) {
                Alert.alert("Erro", "Você precisa estar logado.");
                return;
            }

            Alert.alert(
                "Cancelar Carona",
                `Deseja realmente cancelar a carona com ${carona.nome_responsavel} para ${carona.dia_semana_nome} às ${formatarHorario(carona.hora)} (${carona.tipo === 'entrada' ? 'Entrada' : 'Saída'})?`,
                [
                    { text: "Não", style: "cancel" },
                    {
                        text: "Sim, Cancelar",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                const response = await fetch(`${url}/api/caronas/${carona.id}/cancelar`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json'
                                    }
                                });

                                if (response.ok) {
                                    Alert.alert("Sucesso!", "Carona cancelada com sucesso!");
                                    carregarDados();
                                } else {
                                    const error = await response.json();
                                    Alert.alert("Erro", error.error || "Não foi possível cancelar a carona.");
                                }
                            } catch (error) {
                                console.error("Erro ao cancelar carona:", error);
                                Alert.alert("Erro", "Não foi possível cancelar a carona.");
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Erro ao cancelar carona:", error);
            Alert.alert("Erro", "Não foi possível cancelar a carona.");
        }
    };

    useEffect(() => {
        async function inicializar() {
            await loadFonts();
            await carregarDados();
        }
        inicializar();
    }, []);

    if (!fontsLoaded || loading) {
        return (
            <SafeAreaProvider style={theme === "light" ? styles.safeArea : styles.safeAreaDark}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#BEACDE" />
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider style={theme === "light" ? styles.safeArea : styles.safeAreaDark}>
            <HeaderComLogout />
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={theme === "light" ? styles.containerPrincipal : styles.containerPrincipalDark}>
                    <Text style={theme === "light" ? styles.tituloAba : styles.tituloAbaDark}>
                        Solicitar Carona
                    </Text>

                    {/* Abas */}
                    <View style={styles.abasContainer}>
                        <TouchableOpacity
                            style={[styles.aba, !mostrarAceitas && styles.abaAtiva]}
                            onPress={() => setMostrarAceitas(false)}
                        >
                            <Text style={[styles.textoAba, !mostrarAceitas && styles.textoAbaAtiva]}>
                                Disponíveis
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.aba, mostrarAceitas && styles.abaAtiva]}
                            onPress={() => setMostrarAceitas(true)}
                        >
                            <Text style={[styles.textoAba, mostrarAceitas && styles.textoAbaAtiva]}>
                                Aceitas ({caronasAceitas.length})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {!mostrarAceitas ? (
                        // RESPONSÁVEIS DISPONÍVEIS COM ACCORDION POR DIA
                        <View>
                            {responsaveisDisponiveis.length === 0 ? (
                                <Text style={theme === "light" ? styles.textoVazio : styles.textoVazioDark}>
                                    Nenhum responsável disponível no momento.
                                </Text>
                            ) : (
                                // Agrupar por dia da semana
                                (() => {
                                    const caronasPorDia: { [key: number]: ResponsavelDisponivel[] } = {};
                                    responsaveisDisponiveis.forEach(resp => {
                                        if (!caronasPorDia[resp.dia_semana]) {
                                            caronasPorDia[resp.dia_semana] = [];
                                        }
                                        caronasPorDia[resp.dia_semana].push(resp);
                                    });

                                    // Ordenar caronas de cada dia por distância (menor primeiro)
                                    Object.keys(caronasPorDia).forEach(dia => {
                                        caronasPorDia[parseInt(dia)].sort((a, b) => {
                                            const distA = a.distancia_km ?? 999;
                                            const distB = b.distancia_km ?? 999;
                                            return distA - distB;
                                        });
                                    });

                                    // Sempre mostrar todos os dias (Segunda a Sábado), mesmo se não tiver caronas
                                    return [1, 2, 3, 4, 5, 6].map(dia => {
                                        const caronasDoDia = caronasPorDia[dia] || [];
                                        const isAberto = diaAberto === dia;
                                        const nomeDia = nomesDias[dia];
                                        
                                        // Se não tem caronas, ainda mostra a caixa mas vazia
                                        if (caronasDoDia.length === 0) {
                                            return (
                                                <View key={dia} style={styles.accordionContainer}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.accordionHeader,
                                                            theme === "dark" && styles.accordionHeaderDark,
                                                            isAberto && styles.accordionHeaderAberto
                                                        ]}
                                                        onPress={() => setDiaAberto(isAberto ? null : dia)}
                                                    >
                                                        <Text style={[
                                                            styles.accordionHeaderText,
                                                            theme === "dark" && styles.accordionHeaderTextDark,
                                                            isAberto && styles.accordionHeaderTextAberto
                                                        ]}>
                                                            {nomeDia} (0)
                                                        </Text>
                                                        <Text style={[
                                                            styles.accordionIcon,
                                                            theme === "dark" && styles.accordionIconDark
                                                        ]}>
                                                            {isAberto ? '▼' : '▶'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    
                                                    {isAberto && (
                                                        <View style={styles.accordionContent}>
                                                            <Text style={theme === "light" ? styles.textoVazio : styles.textoVazioDark}>
                                                                Nenhuma carona disponível para {nomeDia}.
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        }

                                        return (
                                            <View key={dia} style={styles.accordionContainer}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.accordionHeader,
                                                        theme === "dark" && styles.accordionHeaderDark,
                                                        isAberto && styles.accordionHeaderAberto
                                                    ]}
                                                    onPress={() => setDiaAberto(isAberto ? null : dia)}
                                                >
                                                    <Text style={[
                                                        styles.accordionHeaderText,
                                                        theme === "dark" && styles.accordionHeaderTextDark,
                                                        isAberto && styles.accordionHeaderTextAberto
                                                    ]}>
                                                        {nomeDia} ({caronasDoDia.length})
                                                    </Text>
                                                    <Text style={[
                                                        styles.accordionIcon,
                                                        theme === "dark" && styles.accordionIconDark
                                                    ]}>
                                                        {isAberto ? '▼' : '▶'}
                                                    </Text>
                                                </TouchableOpacity>
                                                
                                                {isAberto && (
                                                    <View style={styles.accordionContent}>
                                                        {caronasDoDia.map((resp, index) => (
                                                            <View
                                                                key={index}
                                                                style={[
                                                                    theme === "light" ? styles.card : styles.cardDark,
                                                                    styles.cardAccordion
                                                                ]}
                                                            >
                                                                <View style={styles.cardHeader}>
                                                                    {resp.imagem ? (
                                                                        <Image source={{ uri: resp.imagem }} style={styles.fotoPerfil} />
                                                                    ) : (
                                                                        <View style={styles.fotoPerfilPlaceholder}>
                                                                            <Text style={styles.fotoPerfilTexto}>
                                                                                {resp.nome_responsavel.charAt(0)}
                                                                            </Text>
                                                                        </View>
                                                                    )}
                                                                    <View style={styles.cardInfo}>
                                                                        <Text style={theme === "light" ? styles.nome : styles.nomeDark}>
                                                                            {resp.nome_responsavel}
                                                                        </Text>
                                                                        <Text style={theme === "light" ? styles.detalhes : styles.detalhesDark}>
                                                                            {formatarHorario(resp.hora)} - {resp.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                                                                        </Text>
                                                                        {resp.distancia_km !== null && (
                                                                            <Text style={theme === "light" ? styles.distancia : styles.distanciaDark}>
                                                                                📍 {Number(resp.distancia_km).toFixed(2)} km da sua casa
                                                                            </Text>
                                                                        )}
                                                                    </View>
                                                                </View>
                                                                <TouchableOpacity
                                                                    style={styles.botaoSolicitar}
                                                                    onPress={() => solicitarCarona(resp)}
                                                                >
                                                                    <Text style={styles.textoBotaoSolicitar}>Solicitar Carona</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    });
                                })()
                            )}
                        </View>
                    ) : (
                        // CARONAS ACEITAS
                        <View>
                            {caronasAceitas.length === 0 ? (
                                <Text style={theme === "light" ? styles.textoVazio : styles.textoVazioDark}>
                                    Nenhuma carona aceita no momento.
                                </Text>
                            ) : (
                                caronasAceitas.map((carona) => (
                                    <View key={carona.id} style={theme === "light" ? styles.card : styles.cardDark}>
                                        <View style={styles.cardHeader}>
                                            {carona.imagem_responsavel ? (
                                                <Image
                                                    source={{ uri: carona.imagem_responsavel }}
                                                    style={styles.fotoPerfil}
                                                />
                                            ) : (
                                                <View style={styles.fotoPerfilPlaceholder}>
                                                    <Text style={styles.fotoPerfilTexto}>
                                                        {carona.nome_responsavel.charAt(0)}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={styles.cardInfo}>
                                                <Text style={theme === "light" ? styles.nome : styles.nomeDark}>
                                                    {carona.nome_responsavel}
                                                </Text>
                                                <Text style={theme === "light" ? styles.detalhes : styles.detalhesDark}>
                                                    {carona.dia_semana_nome} às {formatarHorario(carona.hora)}
                                                </Text>
                                                <Text style={theme === "light" ? styles.detalhes : styles.detalhesDark}>
                                                    {carona.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                                                </Text>
                                                <Text style={theme === "light" ? styles.endereco : styles.enderecoDark}>
                                                    📍 {carona.endereco_aluno}
                                                </Text>
                                                {carona.telefone_responsavel && (
                                                    <Text style={theme === "light" ? styles.telefone : styles.telefoneDark}>
                                                        📞 {carona.telefone_responsavel}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.botaoCancelar}
                                            onPress={() => cancelarCarona(carona)}
                                        >
                                            <Text style={styles.textoBotaoCancelar}>Cancelar Carona</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
            <FooterComIcones nav={navigation} />
        </SafeAreaProvider>
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
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
        marginBottom: 20,
    },
    tituloAbaDark: {
        fontFamily: 'PoppinsBold',
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    abasContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#E0E0E0',
        borderRadius: 15,
        padding: 3,
    },
    aba: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
    },
    abaAtiva: {
        backgroundColor: '#522a91',
    },
    textoAba: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#666',
    },
    textoAbaAtiva: {
        color: '#fff',
        fontFamily: 'PoppinsBold',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardDark: {
        backgroundColor: '#424242',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    fotoPerfil: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    fotoPerfilPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#BEACDE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    fotoPerfilTexto: {
        fontFamily: 'PoppinsBold',
        fontSize: 24,
        color: '#FFF',
    },
    cardInfo: {
        flex: 1,
    },
    nome: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#000',
        marginBottom: 5,
    },
    nomeDark: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#fff',
        marginBottom: 5,
    },
    detalhes: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    detalhesDark: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#ccc',
        marginBottom: 3,
    },
    endereco: {
        fontFamily: 'PoppinsRegular',
        fontSize: 12,
        color: '#333',
        marginTop: 5,
    },
    enderecoDark: {
        fontFamily: 'PoppinsRegular',
        fontSize: 12,
        color: '#ddd',
        marginTop: 5,
    },
    telefone: {
        fontFamily: 'PoppinsRegular',
        fontSize: 12,
        color: '#333',
        marginTop: 3,
    },
    telefoneDark: {
        fontFamily: 'PoppinsRegular',
        fontSize: 12,
        color: '#ddd',
        marginTop: 3,
    },
    botaoSolicitar: {
        backgroundColor: '#522a91',
        paddingVertical: 12,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    textoBotaoSolicitar: {
        fontFamily: 'PoppinsBold',
        fontSize: 14,
        color: '#FFF',
    },
    botaoCancelar: {
        backgroundColor: '#dc3545',
        paddingVertical: 12,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    textoBotaoCancelar: {
        fontFamily: 'PoppinsBold',
        fontSize: 14,
        color: '#FFF',
    },
    textoVazio: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingVertical: 40,
    },
    textoVazioDark: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
        paddingVertical: 40,
    },
    accordionContainer: {
        marginBottom: 10,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 5,
    },
    accordionHeaderDark: {
        backgroundColor: '#424242',
    },
    accordionHeaderAberto: {
        backgroundColor: '#522a91',
    },
    accordionHeaderText: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#333',
    },
    accordionHeaderTextDark: {
        color: '#fff',
    },
    accordionHeaderTextAberto: {
        color: '#fff',
    },
    accordionIcon: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#666',
    },
    accordionIconDark: {
        color: '#ccc',
    },
    accordionContent: {
        marginTop: 5,
    },
    cardAccordion: {
        marginBottom: 10,
    },
    distancia: {
        fontFamily: 'PoppinsRegular',
        fontSize: 13,
        color: '#522a91',
        marginTop: 5,
        fontWeight: 'bold',
    },
    distanciaDark: {
        fontFamily: 'PoppinsRegular',
        fontSize: 13,
        color: '#BEACDE',
        marginTop: 5,
        fontWeight: 'bold',
    },
});

