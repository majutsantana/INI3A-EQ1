// Yasmin 
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
    ActivityIndicator
} from 'react-native';
import { Icon } from 'react-native-elements';
import * as Font from 'expo-font';

export default function PerfilInstituicao() {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);

    const loadFonts = async () => {
        await Font.loadAsync({
            'PoppinsRegular': require('../assets/fonts/PoppinsRegular.ttf'),
            'PoppinsBold': require('../assets/fonts/PoppinsBold.ttf'),
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
            {/* Cabeçalho */}
            <View style={styles.header} />

            {/* Parte de cima com nome, foto e editar */}
            <View style={styles.profileTop}>
                <Text style={styles.institutionName}>Nome da Instituição</Text>
                <View style={styles.profilePic}>
                    <Text style={{ fontFamily: 'PoppinsRegular', fontSize: 12 }}>Foto de Perfil</Text>
                </View>
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => Alert.alert("Função de edição ainda será implementada.")}
                >
                    <Text style={{ fontFamily: 'PoppinsRegular', fontSize: 16 }}>Editar perfil</Text>
                </TouchableOpacity>
            </View>

            {/* Formulário */}
            <View style={styles.formFields}>
                <TextInput
                    placeholder="Nome da Instituição:"
                    style={styles.input}
                    placeholderTextColor="#000"
                />
                <TextInput
                    placeholder="Endereço:"
                    style={styles.input}
                    placeholderTextColor="#000"
                />
                <TextInput
                    placeholder="Horários de Funcionamento:"
                    style={styles.input}
                    placeholderTextColor="#000"
                />
                <TextInput
                    placeholder="Telefone para Contato:"
                    style={styles.input}
                    placeholderTextColor="#000"
                />

            </View>

            {/* Rodapé */}
            <View style={styles.footer}>
                <TouchableOpacity>
                    <Icon name="perm-identity" type="material" color="#522a91" size={30} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Icon name="home" type="material" color="#522a91" size={30} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Icon name="list" type="material" color="#522a91" size={30} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FCD28D',
    },
    header: {
        height: '15%',
        backgroundColor: '#BEACDE',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    profileTop: {
        backgroundColor: '#FFBE31',
        alignItems: 'center',
        paddingVertical: 16,
    },
    institutionName: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 20,
        fontFamily: 'PoppinsRegular',
        fontSize: 16,
        marginBottom: 10,
    },
    profilePic: {
        width: 130,
        height: 130,
        backgroundColor: '#D9D9D9',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    editBtn: {
        backgroundColor: '#beacde',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
        shadowColor: "#000",
        shadowOffset: {
        width: 0,
        height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
        },
    formFields: {
        flex: 1,
        gap:'8%',
        alignItems:'center',
        justifyContent:'center',
    },
    input: {
        width:'80%',
        height:'15%',
        paddingLeft:'5%',
        backgroundColor: '#F5F5F5',
        borderRadius: 30,
        borderColor: '#ccc',
        fontFamily: 'PoppinsRegular',
        fontSize: 12,
        shadowColor: "#000",
        shadowOffset: {
        width: 0,
        height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    footer: {
        backgroundColor: '#BEACDE',
        height: '8%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
});
