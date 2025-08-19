import { useNavigation } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    Platform
} from 'react-native';
import * as Font from 'expo-font';
import Header from '../../components/Header';
import FooterComIcones from '../../components/FooterComIcones';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useApi from '../../hooks/useApi';

type Instituicao = {
    id: number;
    nome: string;
    endereco: string;
    horario_funcionamento: string;
    telefone: string;
  }  


export default function PerfilInstituicao() {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [selectedGenero, setSelectedGenero] = useState('');

    const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
    const [editando, setEditando] = useState(false);
  
    const { url } = useApi();
  
    // carregar fontes
    const loadFonts = async () => {
      await Font.loadAsync({
        'PoppinsRegular': require('../../assets/fonts/PoppinsRegular.ttf'),
        'PoppinsBold': require('../../assets/fonts/PoppinsBold.ttf'),
      });
      setFontsLoaded(true);
    };
  
    // buscar dados da instituição
    const fetchInstituicao = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt");
        if (!token) {
          Alert.alert("Erro", "Você precisa estar logado.");
          return;
        }
        
        const id = await AsyncStorage.getItem("id_instituicao");
        const res = await fetch(url + "/api/instituicoes/" + id, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
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
  
    // salvar edição
    const salvarEdicao = async () => {
      if (!instituicao) return;
      try {
        const token = await AsyncStorage.getItem("jwt");
        const res = await fetch(url + "/api/instituicoes/" + instituicao.id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(instituicao)
        });
  
        if (!res.ok) {
          Alert.alert("Erro", "Não foi possível atualizar.");
          return;
        }
  
        const atualizado = await res.json();
        setInstituicao(atualizado);
        setEditando(false);
        Alert.alert("Sucesso", "Perfil atualizado!");
      } catch (err) {
        console.error(err);
        Alert.alert("Erro", "Falha ao salvar dados.");
      }
    };
  
    useEffect(() => {
      loadFonts();
      fetchInstituicao();
    }, []);
  
    if (!fontsLoaded || !instituicao) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header/>

            <View style={styles.profileTop}>
                <View style={styles.nameTag}>
                    <Text style={styles.nameText}>{instituicao.nome}</Text>
                </View>
            </View>

            <View style={styles.profilePicWrapper}>
                <View style={styles.profilePic}>
                    <Text style={styles.picText}>Foto de perfil</Text>
                </View>
            </View>

            <View style={styles.profileBottom}>
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => Alert.alert("Função de edição ainda será implementada.")}
                >
                    <Text style={styles.editText}>Editar perfil</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer}>
                <TextInput placeholder="Nome:" style={styles.input} placeholderTextColor="#000" />
                <TextInput placeholder="Endereço:" style={styles.input} placeholderTextColor="#000" />
                <TextInput placeholder="Horário de funcionamento:" style={styles.input} placeholderTextColor="#000" />
                <TextInput placeholder="Telefone para contato:" style={styles.input} placeholderTextColor="#000" />
            </ScrollView>

            <FooterComIcones/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FCD28D',
    },

    profileTop: {
        backgroundColor: '#FFBE31',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 60,
    },

    profileBottom: {
        backgroundColor: '#FCD28D',
        alignItems: 'center',
        paddingTop: 80,
    },

    profilePicWrapper: {
        position: 'absolute',
        top: 160, // ajuste fino da posição vertical
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 2,
    },

    profilePic: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        alignItems: 'center',
        // borderWidth: 2,
        // borderColor: '#3D3D3D',
    },

    picText: {
        fontFamily: 'PoppinsRegular',
        fontSize: 12,
        color: '#555',
    },

    nameTag: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 10,
    },

    nameText: {
        fontFamily: 'PoppinsBold',
        fontSize: 14,
        color: '#000',
    },

    // Botão de editar Perfil
    editBtn: {
        backgroundColor: '#FFBE31', //amarelo forte para o botão
        borderRadius: 20, //borda arredondada
        paddingHorizontal: 20,
        paddingVertical: 6,
    },

    editText: {
        fontFamily: 'PoppinsRegular',
        fontSize: 14,
        color: '#000',
    },

    formContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingBottom: 100,
    },

    input: {
        width: '85%',
        height: 45,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginVertical: 8,
        justifyContent: 'center',
        fontFamily: 'PoppinsRegular',
    },

    // Caixa do gênero 
    picker: {
        width: '100%',
        height: Platform.OS === 'ios' ? undefined : 45,
        color: '#000',
        backgroundColor: '#F5F5F5',
        borderWidth: 0,
    },
});
