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

export default function PerfilInstituicao() {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [selectedGenero, setSelectedGenero] = useState('');

    const loadFonts = async () => {
        await Font.loadAsync({
            'PoppinsRegular': require('../../assets/fonts/PoppinsRegular.ttf'),
            'PoppinsBold': require('../../assets/fonts/PoppinsBold.ttf'),
        });
        setFontsLoaded(true);
    };

    useEffect(() => {
        loadFonts();
    }, []);

    if (!fontsLoaded) {
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
                    <Text style={styles.nameText}>Nome da Instituição</Text>
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
