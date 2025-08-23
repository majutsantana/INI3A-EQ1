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
    telefone: string;
} 

export default function PerfilInstituicao({navigation}) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
    const [editando, setEditando] = useState(false);
    const { url } = useApi();
 
    const loadFonts = async () => {
      await Font.loadAsync({
        'PoppinsRegular': require('../../assets/fonts/PoppinsRegular.ttf'),
        'PoppinsBold': require('../../assets/fonts/PoppinsBold.ttf'),
      });
      setFontsLoaded(true);
    };
 
    const fetchInstituicao = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt");
        if (!token) {
          Alert.alert("Erro", "Você precisa estar logado.");
          navigation.navigate("Login");
          return;
        }
        
        const id = await AsyncStorage.getItem("id_instituicao");
        if (!id) {
            Alert.alert("Erro", "ID da instituição não encontrado. Por favor, faça o login novamente.");
            navigation.navigate("Login");
            return;
        }

        const res = await fetch(`${url}/api/instituicoes/${id}`, {
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
 
    const salvarEdicao = async () => {
      if (!instituicao) return;
      try {
        const token = await AsyncStorage.getItem("jwt");
        const res = await fetch(`${url}/api/instituicoes/${instituicao.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
              nome: instituicao.nome,
              endereco: instituicao.endereco,
              telefone: instituicao.telefone
          })
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

    // Função para lidar com a mudança nos inputs
    const handleInputChange = (field: keyof Instituicao, value: string) => {
        if (instituicao) {
            setInstituicao({ ...instituicao, [field]: value });
        }
    };
 
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
                    onPress={() => setEditando(!editando)} // Alterna o modo de edição
                >
                    <Text style={styles.editText}>{editando ? 'Cancelar' : 'Editar perfil'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer}>
                <Text style={styles.label}>Nome:</Text>
                <TextInput 
                    style={styles.input}
                    value={instituicao.nome}
                    onChangeText={(text) => handleInputChange('nome', text)}
                    editable={editando}
                />

                <Text style={styles.label}>Endereço:</Text>
                <TextInput
                    style={styles.input}
                    value={instituicao.endereco}
                    onChangeText={(text) => handleInputChange('endereco', text)}
                    editable={editando}
                />

                <Text style={styles.label}>Telefone para contato:</Text>
                <TextInput
                    style={styles.input}
                    value={instituicao.telefone}
                    onChangeText={(text) => handleInputChange('telefone', text)}
                    editable={editando}
                    keyboardType="phone-pad"
                />

                {/* Botão de salvar só aparece no modo de edição */}
                {editando && (
                    <TouchableOpacity style={styles.saveBtn} onPress={salvarEdicao}>
                        <Text style={styles.saveText}>Salvar Alterações</Text>
                    </TouchableOpacity>
                )} 
               
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
        top: 160,
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
        borderWidth: 2,
        borderColor: '#FFF'
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
    editBtn: {
        backgroundColor: '#FFBE31',
        borderRadius: 20,
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
    label: {
        width: '85%',
        fontFamily: 'PoppinsBold',
        fontSize: 14,
        color: '#333',
        marginTop: 10,
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
        color: '#000',
        borderWidth: 1,
        borderColor: '#ddd'
    },
    saveBtn: {
        backgroundColor: '#522a91', // Roxo
        borderRadius: 20,
        paddingHorizontal: 30,
        paddingVertical: 10,
        marginTop: 20,
    },
    saveText: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: '#fff',
    },
    button: {
          backgroundColor: '#FFBE31',
          paddingVertical: '5%',
          width:'60%',
          borderRadius: 20,
          alignItems: 'center',
          marginTop: '10%',
          shadowColor: '#000',
          shadowOffset: {
          width: 0,
          height: 3,
          },
          shadowOpacity: 0.27,
          shadowRadius: 4.65,
          elevation: 6,
      },
      buttonText: {
          fontSize: 18,
          fontFamily: 'PoppinsRegular',
      },
});
