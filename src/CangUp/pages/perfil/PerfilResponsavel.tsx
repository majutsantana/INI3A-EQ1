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
import useApi from '../../hooks/useApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInputMask } from 'react-native-masked-text';

type Responsavel = {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    sexo: string;
    endereco: string;    
}

export default function PerfilResponsavel({navigation}) { //Navigation não está dando erro, é apenas o vs code
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [selectedGenero, setSelectedGenero] = useState('');
    const [responsavel, setResponsavel] = useState<Responsavel | null>(null);
    const [originalResponsavel, setOriginalResponsavel] = useState<Responsavel | null>(null);
    const [rawTelefone, setRawTelefone] = useState('');
    const [editando, setEditando] = useState(false);
    const [errors, setErrors] = useState<{ telefone?: string }>({});
    const { url } = useApi();

    const loadFonts = async () => {
        await Font.loadAsync({
            'PoppinsRegular': require('../../assets/fonts/PoppinsRegular.ttf'),
            'PoppinsBold': require('../../assets/fonts/PoppinsBold.ttf'),
        });
        setFontsLoaded(true);
    };

    const fetchResponsavel = async () => {
        try {
            const token = await AsyncStorage.getItem("jwt");
            if (!token) {
                Alert.alert("Erro", "Você precisa estar logado.");
                return;
            }
            const id = await AsyncStorage.getItem("id_responsavel");
            if (!id) {
                Alert.alert("Erro", "ID da responsavel não encontrado.");
                return;
            }
            const res = await fetch(`${url}/api/responsaveis/${id}`, {
                method: "GET", headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) {
                Alert.alert("Erro", "Falha ao carregar dados.");
                return;
            }
            const data = await res.json();
            setResponsavel(data);
            setOriginalResponsavel(data); 
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
        if (!responsavel) return;
        if (!validateForm()) return;

        try {
            const token = await AsyncStorage.getItem("jwt");
            const res = await fetch(`${url}/api/responsaveis/${responsavel.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: responsavel.nome,
                    cpf: responsavel.cpf,
                    email: responsavel.email,
                    telefone: rawTelefone,
                    sexo: responsavel.sexo,
                    endereco: responsavel.endereco,
                })
            });
            if (!res.ok) {
                Alert.alert("Erro", "Não foi possível atualizar.");
                return;
            }
            const atualizado = await res.json();
            setResponsavel(atualizado);
            setOriginalResponsavel(atualizado);
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
            if (originalResponsavel) {
                setResponsavel(originalResponsavel);
                setRawTelefone(originalResponsavel.telefone.replace(/\D/g, ''));
            }
        }
        setEditando(!editando);
        setErrors({});
    };

    useEffect(() => {
        loadFonts();
        fetchResponsavel();
    }, []);

    const handleInputChange = (field: keyof Responsavel, value: string) => {
        if (responsavel) {
            setResponsavel({ ...responsavel, [field]: value });
        }
    };

    if (!fontsLoaded || !responsavel) {
        return <ActivityIndicator size="large" style={{ flex: 1 }} />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <HeaderComLogout/>
            <View style={styles.profileTop}><View style={styles.nameTag}><Text style={styles.nameText}>{responsavel.nome}</Text></View></View>
            <View style={styles.profilePicWrapper}><View style={styles.profilePic}><Text style={styles.picText}>Foto de perfil</Text></View></View>
            <View style={styles.profileBottom}>
                <TouchableOpacity style={styles.editBtn} onPress={handleEditCancel}>
                        <Text style={styles.editText}>{editando ? 'Cancelar' : 'Editar perfil'}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Text style={styles.label}>Nome:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={responsavel.nome} editable={false} />
                <Text style={styles.label}>Email:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={responsavel.email} editable={false} />
                <Text style={styles.label}>Endereço:</Text>
                <TextInput style={styles.input} value={responsavel.endereco} editable={editando} onChangeText={(text) => handleInputChange('endereco', text)} />
                <Text style={styles.label}>CPF:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={responsavel.cpf} editable={false} />
                <Text style={styles.label}>Telefone para contato:</Text>
                <TextInputMask
                    style={[styles.input, errors.telefone && styles.inputError]}
                    type={'cel-phone'}
                    options={{ withDDD: true }}
                    placeholder="(99) 99999-9999"
                    placeholderTextColor="#888"
                    value={responsavel.telefone}
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
                <Text style={styles.label}>Sexo:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={responsavel.sexo} editable={false} />

                {editando && <TouchableOpacity style={styles.saveBtn} onPress={salvarEdicao}><Text style={styles.saveText}>Salvar Alterações</Text></TouchableOpacity>}
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(`CadastroVeiculo`)}><Text style={styles.buttonText}>Cadastro de veículo</Text></TouchableOpacity>
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
    inputDisabled: {
        backgroundColor: '#E0E0E0',
        color: '#888',
    },
});
