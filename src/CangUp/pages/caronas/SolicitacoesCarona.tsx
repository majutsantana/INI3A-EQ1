import React, { useState, useEffect, useRef } from 'react';
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
    Linking,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import { useTheme } from '../../context/ThemeContext';
import useApi from '../../hooks/useApi';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type Solicitacao = {
    id: number;
    id_aluno: number;
    nome_aluno: string;
    imagem_aluno: string | null;
    dia_semana: number;
    dia_semana_nome: string;
    tipo: string;
    hora: string;
    distancia_km: number | null;
    data_solicitacao: string;
};

type CaronaAceita = {
    id: number;
    id_aluno: number;
    nome_aluno: string;
    imagem_aluno: string | null;
    endereco_aluno: string;
    dia_semana: number;
    dia_semana_nome: string;
    tipo: string;
    hora: string;
    data_aceitacao: string;
};

type PontoRota = {
    tipo: string;
    nome: string;
    endereco: string;
    coordenadas: {
        lat: number;
        lng: number;
    };
    carona: any;
};

export default function SolicitacoesCarona({ navigation }) {
    const { url } = useApi();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [solicitacoesPendentes, setSolicitacoesPendentes] = useState<Solicitacao[]>([]);
    const [caronasAceitas, setCaronasAceitas] = useState<CaronaAceita[]>([]);
    const [mostrarAceitas, setMostrarAceitas] = useState(false);
    const [pontosRota, setPontosRota] = useState<PontoRota[]>([]);
    const [loadingRota, setLoadingRota] = useState(false);
    const [urlGoogleMaps, setUrlGoogleMaps] = useState<string | null>(null);
    const mapRef = useRef<MapView | null>(null);
    const { theme } = useTheme();

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

    const carregarRotaAlunos = async (idResponsavel: string, token: string) => {
        try {
            setLoadingRota(true);
            const response = await fetch(`${url}/api/responsaveis/${idResponsavel}/rota-alunos`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                try {
                    const data = await response.json();
                    console.log("Dados da rota recebidos:", {
                        pontos: data.pontos?.length || 0,
                        has_coordinates: data.has_coordinates,
                        url_google_maps: data.url_google_maps || null,
                        message: data.message
                    });
                    
                    if (data && data.pontos && data.pontos.length > 0) {
                        setPontosRota(data.pontos);
                        setUrlGoogleMaps(data.url_google_maps || null);
                        console.log("Rota carregada com sucesso:", data.pontos.length, "pontos");
                    } else {
                        console.log("Nenhum ponto na rota:", data.message || "Sem dados");
                        setPontosRota([]);
                        setUrlGoogleMaps(null);
                    }
                } catch (jsonError) {
                    console.error("Erro ao parsear JSON da rota:", jsonError);
                    setPontosRota([]);
                    setUrlGoogleMaps(null);
                }
            } else {
                // Se não há caronas aceitas, retorna 404 ou erro - não é crítico
                // Apenas limpa a rota e não mostra erro no console para 404
                if (response.status === 404) {
                    setPontosRota([]);
                    setUrlGoogleMaps(null);
                } else {
                    console.error("Erro ao carregar rota:", response.status);
                    setPontosRota([]);
                    setUrlGoogleMaps(null);
                }
            }
        } catch (error) {
            // Erro de rede ou conexão - não é crítico, apenas não mostra rota
            setPontosRota([]);
        } finally {
            setLoadingRota(false);
        }
    };

    const carregarDados = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const idResponsavel = await AsyncStorage.getItem('id_responsavel');

            if (!token || !idResponsavel) {
                Alert.alert("Erro", "Você precisa estar logado.");
                return;
            }

            setLoading(true);

            // Carregar solicitações pendentes
            const responsePendentes = await fetch(`${url}/api/responsaveis/${idResponsavel}/solicitacoes-pendentes`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (responsePendentes.ok) {
                const data = await responsePendentes.json();
                setSolicitacoesPendentes(data);
            }

            // Carregar caronas aceitas
            const responseAceitas = await fetch(`${url}/api/responsaveis/${idResponsavel}/caronas-aceitas`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (responseAceitas.ok) {
                const data = await responseAceitas.json();
                setCaronasAceitas(data);
            }

            // Carregar rota de alunos aceitos
            await carregarRotaAlunos(idResponsavel, token);

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            Alert.alert("Erro", "Não foi possível carregar os dados.");
        } finally {
            setLoading(false);
        }
    };

    const aceitarCarona = async (solicitacao: Solicitacao) => {
        try {
            const token = await AsyncStorage.getItem('jwt');

            if (!token) {
                Alert.alert("Erro", "Você precisa estar logado.");
                return;
            }

            Alert.alert(
                "Aceitar Carona",
                `Deseja aceitar a solicitação de ${solicitacao.nome_aluno} para ${solicitacao.dia_semana_nome} às ${formatarHorario(solicitacao.hora)} (${solicitacao.tipo === 'entrada' ? 'Entrada' : 'Saída'})?`,
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Aceitar Carona",
                        onPress: async () => {
                            try {
                                const response = await fetch(`${url}/api/caronas/${solicitacao.id}/aceitar`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json'
                                    }
                                });

                                if (response.ok) {
                                    Alert.alert("Sucesso!", "Carona aceita com sucesso!");
                                    const token = await AsyncStorage.getItem('jwt');
                                    const idResponsavel = await AsyncStorage.getItem('id_responsavel');
                                    if (token && idResponsavel) {
                                        await carregarDados();
                                        await carregarRotaAlunos(idResponsavel, token);
                                    }
                                } else {
                                    const error = await response.json();
                                    Alert.alert("Erro", error.error || "Não foi possível aceitar a carona.");
                                }
                            } catch (error) {
                                console.error("Erro ao aceitar carona:", error);
                                Alert.alert("Erro", "Não foi possível aceitar a carona.");
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Erro ao aceitar carona:", error);
            Alert.alert("Erro", "Não foi possível aceitar a carona.");
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
                `Deseja realmente cancelar a carona com ${carona.nome_aluno} para ${carona.dia_semana_nome} às ${formatarHorario(carona.hora)} (${carona.tipo === 'entrada' ? 'Entrada' : 'Saída'})?`,
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
                                    const token = await AsyncStorage.getItem('jwt');
                                    const idResponsavel = await AsyncStorage.getItem('id_responsavel');
                                    if (token && idResponsavel) {
                                        await carregarDados();
                                        await carregarRotaAlunos(idResponsavel, token);
                                    }
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
                        Solicitações de Carona
                    </Text>

                    {/* Abas */}
                    <View style={styles.abasContainer}>
                        <TouchableOpacity
                            style={[styles.aba, !mostrarAceitas && styles.abaAtiva]}
                            onPress={() => setMostrarAceitas(false)}
                        >
                            <Text style={[styles.textoAba, !mostrarAceitas && styles.textoAbaAtiva]}>
                                Pendentes ({solicitacoesPendentes.length})
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
                        // SOLICITAÇÕES PENDENTES
                        <View>
                            {solicitacoesPendentes.length === 0 ? (
                                <Text style={theme === "light" ? styles.textoVazio : styles.textoVazioDark}>
                                    Nenhuma solicitação pendente no momento.
                                </Text>
                            ) : (
                                solicitacoesPendentes.map((solicitacao) => (
                                    <View key={solicitacao.id} style={theme === "light" ? styles.card : styles.cardDark}>
                                        <View style={styles.cardHeader}>
                                            {solicitacao.imagem_aluno ? (
                                                <Image
                                                    source={{ uri: solicitacao.imagem_aluno }}
                                                    style={styles.fotoPerfil}
                                                />
                                            ) : (
                                                <View style={styles.fotoPerfilPlaceholder}>
                                                    <Text style={styles.fotoPerfilTexto}>
                                                        {solicitacao.nome_aluno.charAt(0)}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={styles.cardInfo}>
                                                <Text style={theme === "light" ? styles.nome : styles.nomeDark}>
                                                    {solicitacao.nome_aluno}
                                                </Text>
                                                <Text style={theme === "light" ? styles.detalhes : styles.detalhesDark}>
                                                    {solicitacao.dia_semana_nome} às {formatarHorario(solicitacao.hora)}
                                                </Text>
                                                <Text style={theme === "light" ? styles.detalhes : styles.detalhesDark}>
                                                    {solicitacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                                                </Text>
                                                {solicitacao.distancia_km !== null && solicitacao.distancia_km !== undefined && (
                                                    <Text style={theme === "light" ? styles.distancia : styles.distanciaDark}>
                                                        📍 Distância: {Number(solicitacao.distancia_km).toFixed(2)} km
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.botaoAceitar}
                                            onPress={() => aceitarCarona(solicitacao)}
                                        >
                                            <Text style={styles.textoBotaoAceitar}>Aceitar Carona</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </View>
                    ) : (
                        // CARONAS ACEITAS COM MAPA
                        <View>
                            {loadingRota ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#522a91" />
                                    <Text style={theme === "light" ? styles.textoVazio : styles.textoVazioDark}>
                                        Carregando mapa...
                                    </Text>
                                </View>
                            ) : pontosRota.length > 0 ? (
                                <>
                                    {/* MAPA COM ROTA */}
                                    <View style={styles.mapaContainer}>
                                        <MapView
                                            ref={mapRef}
                                            style={styles.mapa}
                                            initialRegion={(() => {
                                                if (pontosRota.length === 0) {
                                                    return {
                                                        latitude: -22.3145,
                                                        longitude: -49.0606,
                                                        latitudeDelta: 0.05,
                                                        longitudeDelta: 0.05,
                                                    };
                                                }
                                                const lats = pontosRota.map(p => p.coordenadas.lat);
                                                const lngs = pontosRota.map(p => p.coordenadas.lng);
                                                const minLat = Math.min(...lats);
                                                const maxLat = Math.max(...lats);
                                                const minLng = Math.min(...lngs);
                                                const maxLng = Math.max(...lngs);
                                                const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01) || 0.05;
                                                const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01) || 0.05;
                                                
                                                return {
                                                    latitude: (minLat + maxLat) / 2,
                                                    longitude: (minLng + maxLng) / 2,
                                                    latitudeDelta: latDelta,
                                                    longitudeDelta: lngDelta,
                                                };
                                            })()}
                                            onMapReady={() => {
                                                // Ajustar zoom para mostrar todos os pontos
                                                if (pontosRota.length > 0 && mapRef.current) {
                                                    const lats = pontosRota.map(p => p.coordenadas.lat);
                                                    const lngs = pontosRota.map(p => p.coordenadas.lng);
                                                    const minLat = Math.min(...lats);
                                                    const maxLat = Math.max(...lats);
                                                    const minLng = Math.min(...lngs);
                                                    const maxLng = Math.max(...lngs);
                                                    const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01) || 0.05;
                                                    const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01) || 0.05;
                                                    
                                                    mapRef.current.fitToCoordinates(
                                                        pontosRota.map(p => ({
                                                            latitude: p.coordenadas.lat,
                                                            longitude: p.coordenadas.lng,
                                                        })),
                                                        {
                                                            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                                                            animated: true,
                                                        }
                                                    );
                                                }
                                            }}
                                        >
                                            {/* Marcadores para cada ponto */}
                                            {pontosRota.map((ponto, index) => (
                                                <Marker
                                                    key={index}
                                                    coordinate={{
                                                        latitude: ponto.coordenadas.lat,
                                                        longitude: ponto.coordenadas.lng,
                                                    }}
                                                    title={ponto.nome}
                                                    description={ponto.endereco}
                                                    pinColor={ponto.tipo === 'responsavel' ? '#522a91' : '#dc3545'}
                                                />
                                            ))}
                                            {/* Linha conectando todos os pontos */}
                                            {pontosRota.length > 1 && (
                                                <Polyline
                                                    coordinates={pontosRota.map(p => ({
                                                        latitude: p.coordenadas.lat,
                                                        longitude: p.coordenadas.lng,
                                                    }))}
                                                    strokeColor="#522a91"
                                                    strokeWidth={3}
                                                    lineDashPattern={[5, 5]}
                                                />
                                            )}
                                            </MapView>
                                        </View>
                                    
                                    {/* BOTÃO PARA ABRIR GOOGLE MAPS */}
                                    {urlGoogleMaps && (
                                        <TouchableOpacity
                                            style={styles.botaoGoogleMaps}
                                            onPress={() => {
                                                Linking.openURL(urlGoogleMaps).catch(err => {
                                                    console.error('Erro ao abrir Google Maps:', err);
                                                    Alert.alert('Erro', 'Não foi possível abrir o Google Maps.');
                                                });
                                            }}
                                        >
                                            <Text style={styles.botaoGoogleMapsTexto}>
                                                📍 Abrir rota no Google Maps
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    
                                    {/* LISTA DE ALUNOS */}
                                    <ScrollView style={styles.listaAlunosContainer}>
                                        {caronasAceitas.map((carona) => (
                                            <View key={carona.id} style={theme === "light" ? styles.card : styles.cardDark}>
                                                <View style={styles.cardHeader}>
                                                    {carona.imagem_aluno ? (
                                                        <Image
                                                            source={{ uri: carona.imagem_aluno }}
                                                            style={styles.fotoPerfil}
                                                        />
                                                    ) : (
                                                        <View style={styles.fotoPerfilPlaceholder}>
                                                            <Text style={styles.fotoPerfilTexto}>
                                                                {carona.nome_aluno.charAt(0)}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    <View style={styles.cardInfo}>
                                                        <Text style={theme === "light" ? styles.nome : styles.nomeDark}>
                                                            {carona.nome_aluno}
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
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.botaoCancelar}
                                                    onPress={() => cancelarCarona(carona)}
                                                >
                                                    <Text style={styles.textoBotaoCancelar}>Cancelar Carona</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </>
                            ) : caronasAceitas.length === 0 ? (
                                <Text style={theme === "light" ? styles.textoVazio : styles.textoVazioDark}>
                                    Nenhuma carona aceita no momento.
                                </Text>
                            ) : (
                                <>
                                    {/* Mostra lista de alunos mesmo sem mapa */}
                                    <View style={styles.loadingContainer}>
                                        <Text style={theme === "light" ? styles.textoVazio : styles.textoVazioDark}>
                                            Não foi possível carregar as coordenadas para o mapa.{"\n\n"}
                                            Possíveis causas:{"\n"}
                                            • API do Google Maps não configurada ou sem billing{"\n"}
                                            • Endereços inválidos ou incompletos{"\n"}
                                            • Problema de conexão com serviços de geocoding{"\n\n"}
                                            A lista de caronas aceitas está disponível abaixo.
                                        </Text>
                                    </View>
                                    <ScrollView style={styles.listaAlunosContainer}>
                                        {caronasAceitas.map((carona) => (
                                            <View key={carona.id} style={theme === "light" ? styles.card : styles.cardDark}>
                                                <View style={styles.cardHeader}>
                                                    {carona.imagem_aluno ? (
                                                        <Image
                                                            source={{ uri: carona.imagem_aluno }}
                                                            style={styles.fotoPerfil}
                                                        />
                                                    ) : (
                                                        <View style={styles.fotoPerfilPlaceholder}>
                                                            <Text style={styles.fotoPerfilTexto}>
                                                                {carona.nome_aluno.charAt(0)}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    <View style={styles.cardInfo}>
                                                        <Text style={theme === "light" ? styles.nome : styles.nomeDark}>
                                                            {carona.nome_aluno}
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
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.botaoCancelar}
                                                    onPress={() => cancelarCarona(carona)}
                                                >
                                                    <Text style={styles.textoBotaoCancelar}>Cancelar Carona</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </>
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
    distancia: {
        fontFamily: 'PoppinsRegular',
        fontSize: 12,
        color: '#333',
        marginTop: 5,
    },
    distanciaDark: {
        fontFamily: 'PoppinsRegular',
        fontSize: 12,
        color: '#ddd',
        marginTop: 5,
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
    botaoAceitar: {
        backgroundColor: '#522a91',
        paddingVertical: 12,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    textoBotaoAceitar: {
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
    mapaContainer: {
        height: 300,
        marginBottom: 15,
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    mapa: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    botaoGoogleMaps: {
        backgroundColor: '#4285F4',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    botaoGoogleMapsTexto: {
        color: '#FFF',
        fontFamily: 'PoppinsBold',
        fontSize: 16,
    },
    listaAlunosContainer: {
        maxHeight: 400,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
});

