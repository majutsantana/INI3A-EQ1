import React, { useEffect, useState, useRef } from 'react';
import {
    Image,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    Alert,
    Keyboard,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import {
    requestForegroundPermissionsAsync,
    getCurrentPositionAsync,
    LocationObject,
    watchPositionAsync,
    LocationAccuracy
} from 'expo-location';
import { FontAwesome } from '@expo/vector-icons'; // Importando ícones
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Mapa({ navigation }) {
    const [location, setLocation] = useState < LocationObject | null > (null);
    const [destination, setDestination] = useState(null);
    const [address, setAddress] = useState('');
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [loading, setLoading] = useState(false);

    const mapRef = useRef < MapView | null > (null);

    // Chave da sua API do OpenRouteService - IMPORTANTE: Substitua pela sua chave
    const OPENROUTESERVICE_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA4MWMzZjMzMGZmNzQ3MTk5Y2U2ZWNhNjI3MWUzNmYyIiwiaCI6Im11cm11cjY0In0=';

    // Função para solicitar permissão de localização
    async function requestLocationPermissions() {
        const {
            granted
        } = await requestForegroundPermissionsAsync();

        if (granted) {
            const currentPosition = await getCurrentPositionAsync({});
            setLocation(currentPosition);
        } else {
            Alert.alert("Permissão Negada", "A permissão de localização é necessária para usar o mapa.");
        }
    }

    // Efeito para carregar a localização inicial
    useEffect(() => {
        requestLocationPermissions();
    }, []);

    // Efeito para acompanhar a mudança de localização do usuário
    useEffect(() => {
        const subscription = watchPositionAsync({
            accuracy: LocationAccuracy.Highest,
            timeInterval: 1000,
            distanceInterval: 1
        }, (response) => {
            setLocation(response);
            // Opcional: descomente a linha abaixo para sempre centralizar no usuário
            // mapRef.current?.animateCamera({ center: response.coords });
        });

        return () => subscription.then(sub => sub.remove());
    }, []);


    /**
     * Converte um endereço de texto em coordenadas geográficas (latitude e longitude)
     * usando a API de geocodificação do OpenRouteService.
     */
    const geocodeAddress = async () => {
        if (!address) {
            Alert.alert("Endereço Vazio", "Por favor, digite um endereço de destino.");
            return;
        }
        Keyboard.dismiss(); // Esconde o teclado
        setLoading(true);
        setRouteCoordinates([]); // Limpa a rota anterior
        setDestination(null); // Limpa o destino anterior

        try {
            const response = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${OPENROUTESERVICE_API_KEY}&text=${encodeURIComponent(address)}`);
            const json = await response.json();

            if (json.features && json.features.length > 0) {
                const [longitude, latitude] = json.features[0].geometry.coordinates;
                const newDestination = {
                    latitude,
                    longitude
                };
                setDestination(newDestination);
                getRoute(newDestination); // Após encontrar o destino, busca a rota
            } else {
                Alert.alert("Erro", "Endereço não encontrado. Tente novamente.");
                setLoading(false);
            }
        } catch (error) {
            console.error("Erro no geocoding:", error);
            Alert.alert("Erro de Rede", "Não foi possível buscar o endereço.");
            setLoading(false);
        }
    };

    /**
     * Busca a rota entre a localização atual do usuário e o destino
     * usando a API de direções do OpenRouteService.
     * @param {object} destCoords - As coordenadas do destino {latitude, longitude}.
     */
    const getRoute = async (destCoords) => {
        if (!location) return;

        try {
            const startCoords = `${location.coords.longitude},${location.coords.latitude}`;
            const endCoords = `${destCoords.longitude},${destCoords.latitude}`;

            const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${OPENROUTESERVICE_API_KEY}&start=${startCoords}&end=${endCoords}`);
            const json = await response.json();

            if (json.features && json.features.length > 0) {
                const coordinates = json.features[0].geometry.coordinates.map(coord => ({
                    latitude: coord[1],
                    longitude: coord[0]
                }));
                setRouteCoordinates(coordinates);
                // Ajusta o mapa para mostrar a rota inteira
                mapRef.current?.fitToCoordinates(coordinates, {
                    edgePadding: {
                        top: 50,
                        right: 50,
                        bottom: 50,
                        left: 50
                    },
                    animated: true,
                });
            } else {
                 Alert.alert("Erro", "Não foi possível calcular a rota.");
            }
        } catch (error) {
            console.error("Erro ao buscar rota:", error);
            Alert.alert("Erro de Rede", "Não foi possível buscar a rota.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaProvider style = {styles.container} >
            <View style = {styles.searchContainer} >
                <TextInput
                    style = {styles.input}
                    placeholder = "Digite o endereço de destino..."
                    value = {address}
                    onChangeText = {setAddress}
                />
                <TouchableOpacity style = {styles.searchButton} onPress = {geocodeAddress} >
                    <FontAwesome name = "search" size = {20} color = "#fff" />
                </TouchableOpacity>
            </View>

            {loading &&
                <View style = {styles.loadingOverlay} >
                    <ActivityIndicator size = "large" color = "#BEACDE" />
                </View>
            }

            {location ? (
                <MapView
                    ref = {mapRef}
                    style = {styles.map}
                    initialRegion = {{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                >
                    {/* Marcador da posição atual do usuário */}
                    <Marker
                        coordinate = {location.coords}
                        title = "Sua Posição"
                    >
                        <Image
                            source = {require('../assets/canguru.png')} // CORREÇÃO: Ajustado para o caminho correto dentro de src
                            style = {styles.markerImage}
                            resizeMode = "contain"
                        />
                    </Marker>

                    {/* Marcador do destino */}
                    {destination && (
                        <Marker
                            coordinate = {destination}
                            title = "Destino"
                            pinColor = "blue"
                        />
                    )}

                    {/* Linha da rota */}
                    {routeCoordinates.length > 0 && (
                        <Polyline
                            coordinates = {routeCoordinates}
                            strokeColor = "#FFBE31" // Cor da rota
                            strokeWidth = {5}
                        />
                    )}
                </MapView>
            ) : (
                <View style = {styles.loadingMap} >
                    <ActivityIndicator size = "large" color = "#BEACDE" />
                    <Text style = {styles.loadingText} > Carregando mapa e localização... </Text>
                </View>
            )}
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchContainer: {
        position: 'absolute',
        top: 60,
        left: 10,
        right: 10,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 10,
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: '#BEACDE',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        flex: 1,
    },
    markerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    loadingMap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
});
