import { useNavigation } from '@react-navigation/core';
import React, { useContext, useEffect, useState } from 'react';
import {
    SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity,
    Alert, ActivityIndicator, ScrollView
} from 'react-native';
import * as Font from 'expo-font';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useApi from '../../hooks/useApi';
import { TextInputMask } from 'react-native-masked-text';
import { AuthContext } from '../../components/AuthContext';

type Instituicao = {
    id: number;
    nome: string;
    cnpj: string;
    email: string;
    endereco: string;
    plano: string;
    telefone: string;
}

export default function PerfilInstituicao({ navigation }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
    const [originalInstituicao, setOriginalInstituicao] = useState<Instituicao | null>(null);
    const [rawTelefone, setRawTelefone] = useState('');
    const [editando, setEditando] = useState(false);
    const [errors, setErrors] = useState<{ telefone?: string }>({});
    const { url } = useApi();
    const {logout} = useContext(AuthContext);

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
                logout();
                return;
            }
            const id = await AsyncStorage.getItem("id_instituicao");
            if (!id) {
                Alert.alert("Erro", "ID da instituição não encontrado.");
                logout();
                return;
            }
            const res = await fetch(`${url}/api/instituicoes/${id}`, {
                method: "GET", headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) {
                Alert.alert("Erro", "Falha ao carregar dados.");
                return;
            }
            const data = await res.json();
            setInstituicao(data);
            setOriginalInstituicao(data); 
            if (data.telefone) {
                setRawTelefone(data.telefone.replace(/\D/g, ''));
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Não foi possível buscar os dados.");
        }
    };

    const validateForm = () => {
        const newErrors: { telefone?: string } = {};
        let isValid = true;
        if (rawTelefone.length < 10 || rawTelefone.length > 11) {
            newErrors.telefone = 'Telefone inválido. Precisa ter 10 ou 11 dígitos.';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const salvarEdicao = async () => {
        if (!instituicao) return;
        if (!validateForm()) return;

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
                    telefone: rawTelefone
                })
            });
            if (!res.ok) {
                Alert.alert("Erro", "Não foi possível atualizar.");
                return;
            }
            const atualizado = await res.json();
            setInstituicao(atualizado);
            setOriginalInstituicao(atualizado);
            setEditando(false);
            setErrors({});
            Alert.alert("Sucesso", "Perfil atualizado!");
        } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Falha ao salvar dados.");
        }
    };

    const handleEditCancel = () => {
        if (editando) {
            if (originalInstituicao) {
                setInstituicao(originalInstituicao);
                setRawTelefone(originalInstituicao.telefone.replace(/\D/g, ''));
            }
        }
        setEditando(!editando);
        setErrors({});
    };

    useEffect(() => {
        loadFonts();
        fetchInstituicao();
    }, []);

    const handleInputChange = (field: keyof Instituicao, value: string) => {
        if (instituicao) {
            setInstituicao({ ...instituicao, [field]: value });
        }
    };

    if (!fontsLoaded || !instituicao) {
        return <ActivityIndicator size="large" style={{ flex: 1 }} />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <HeaderComLogout />
            <View>
                <View style={styles.profileTop}><View style={styles.nameTag}><Text style={styles.nameText}>{instituicao.nome}</Text></View></View>
                <View style={styles.profilePicWrapper}><Text style={styles.picText}>Foto de perfil</Text></View>
                <View style={styles.profileBottom}>
                    <TouchableOpacity style={styles.editBtn} onPress={handleEditCancel}>
                        <Text style={styles.editText}>{editando ? 'Cancelar' : 'Editar perfil'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Text style={styles.label}>Nome:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={instituicao.nome} editable={false} />
                <Text style={styles.label}>Email:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={instituicao.email} editable={false} />
                <Text style={styles.label}>Endereço:</Text>
                <TextInput style={styles.input} value={instituicao.endereco} editable={editando} onChangeText={(text) => handleInputChange('endereco', text)} />
                <Text style={styles.label}>CNPJ:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={instituicao.cnpj} editable={false} />
                <Text style={styles.label}>Telefone para contato:</Text>
                <TextInputMask
                    style={[styles.input, errors.telefone && styles.inputError]}
                    type={'cel-phone'}
                    options={{ withDDD: true }}
                    placeholder="(99) 99999-9999"
                    placeholderTextColor="#888"
                    value={instituicao.telefone}
                    onChangeText={(maskedText) => {
                        const newRawText = maskedText.replace(/\D/g, '');
                        handleInputChange('telefone', maskedText);
                        setRawTelefone(newRawText);
                        if (errors.telefone) setErrors({});
                    }}
                    editable={editando}
                    keyboardType="phone-pad"
                />
                {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
                <Text style={styles.label}>Plano:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={instituicao.plano} editable={false} />
                
                {editando && <TouchableOpacity style={styles.saveBtn} onPress={salvarEdicao}><Text style={styles.saveText}>Salvar Alterações</Text></TouchableOpacity>}
                
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(`PreCadastroResponsavel`)}><Text style={styles.buttonText}>Cadastro de responsáveis</Text></TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(`PreCadastroAluno`)}><Text style={styles.buttonText}>Cadastro de alunos</Text></TouchableOpacity>
            </ScrollView>
            <FooterComIcones />
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
        display: 'flex',
        justifyContent: 'center',
        position: 'absolute',
        backgroundColor: '#D9D9D9',
        borderRadius: '100%',
        alignItems: 'center',
        zIndex: 2,
        width: 120,
        height: 120,
        borderWidth: 2,
        borderColor: '#FFF',
        left: '50%', 
        top: '50%',
        transform: [
        { translateX: -60 },
        { translateY: -60 }
        ],
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
        paddingVertical: 2,
        borderRadius: 20,
        alignItems: 'center'
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
    inputDisabled: {
        backgroundColor: '#E0E0E0',
        color: '#888',
    },
    inputError: {
        borderColor: '#d9534f',
    },
});