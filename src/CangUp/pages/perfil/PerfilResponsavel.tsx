// Yasmin
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
} from 'react-native';
import * as Font from 'expo-font';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';


export default function PerfilResponsavel({navigation}) { //Navigation não está dando erro, é apenas o vs code
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
            <HeaderComLogout/>

            <View style={styles.profileTop}>
                <View style={styles.nameTag}>
                    <Text style={styles.nameText}>Nome do Responsável</Text>
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
                <TextInput placeholder="CPF:" style={styles.input} placeholderTextColor="#000" />
                <TextInput placeholder="E-mail:" style={styles.input} placeholderTextColor="#000" />
                <TextInput placeholder="Telefone para contato:" style={styles.input} placeholderTextColor="#000" />
            </ScrollView>

            <FooterComIcones/>
        </SafeAreaView>
    );
}

    /*Recursos de estilização da tela*/
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
        borderColor: '#FFF',
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
        borderColor: '#ddd',
    },
    inputError: {
        borderColor: '#d9534f',
    },
    errorText: {
        width: '85%',
        color: '#d9534f',
        fontSize: 12,
        fontFamily: 'PoppinsRegular',
        marginTop: -4,
        marginBottom: 8,
    },
    saveBtn: {
        backgroundColor: '#522a91',
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
        paddingVertical: '3%',
        width: '60%',
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
        fontSize: 14,
        fontFamily: 'PoppinsRegular',
    },
});
