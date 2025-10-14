import React, { useContext, useEffect, useState } from 'react';
import {
    SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity,
    Alert, ActivityIndicator, ScrollView, Image
} from 'react-native';
import * as Font from 'expo-font';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useApi from '../../hooks/useApi';
import { TextInputMask } from 'react-native-masked-text';
import { AuthContext } from '../../components/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as ImagePicker from "expo-image-picker";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

type Instituicao = {
    id: number;
    nome: string;
    cnpj: string;
    email: string;
    endereco: string;
    plano: string;
    telefone: string;
    imagem: string;
}

export default function PerfilInstituicao({ navigation }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
    const [originalInstituicao, setOriginalInstituicao] = useState<Instituicao | null>(null);
    const [rawTelefone, setRawTelefone] = useState('');
    const [editando, setEditando] = useState(false);
    const [errors, setErrors] = useState<{ telefone?: string, cep?: string }>({});
    const { url } = useApi();
    const { logout } = useContext(AuthContext);
    const { theme} = useTheme();
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');
    const [loadingCep, setLoadingCep] = useState(false);
    const [imagem, setImagem] = useState<string | null>(null);

    const loadFonts = async () => {
        await Font.loadAsync({
            'PoppinsRegular': require('../../assets/fonts/PoppinsRegular.ttf'),
            'PoppinsBold': require('../../assets/fonts/PoppinsBold.ttf'),
        });
        setFontsLoaded(true);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            const newBase64 = "data:image/jpeg;base64," + result.assets[0].base64;
            setImagem(newBase64);
            handleInputChange('imagem', newBase64); 
            }
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
            if (data.imagem) {
                setImagem(data.imagem);
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Não foi possível buscar os dados.");
        }
    };
    const buscarCep = async () => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) {
            return;
        }
        setLoadingCep(true);
        setErrors(prev => ({ ...prev, cep: undefined }));
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();
            if (data.erro) {
                setErrors(prev => ({ ...prev, cep: 'CEP não encontrado.' }));
                setLogradouro(''); setBairro(''); setCidade(''); setUf('');
            } else {
                setLogradouro(data.logradouro); setBairro(data.bairro); setCidade(data.localidade); setUf(data.uf);
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            setErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP.' }));
        } finally {
            setLoadingCep(false);
        }
    };


    const validateForm = () => {
        const newErrors: { telefone?: string } = {};
        let isValid = true;
        if (rawTelefone.length > 0 && (rawTelefone.length < 10 || rawTelefone.length > 11)) {
            newErrors.telefone = 'Telefone inválido. Precisa ter 10 ou 11 dígitos.';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const salvarEdicao = async () => {
        if (!instituicao) return;
        if (!validateForm()) return;

        let enderecoFinal = instituicao.endereco;
        const newAddressParts = [logradouro, numero, bairro, cidade, uf, cep];
        const isNewAddressStarted = newAddressParts.some(part => part.trim() !== '');

        if (isNewAddressStarted) {
            if (!cep.trim() || !logradouro.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !uf.trim()) {
                Alert.alert("Erro de Endereço", "Para atualizar o endereço, por favor, preencha todos os campos correspondentes.");
                return;
            }
            enderecoFinal = `${logradouro}, ${numero} - ${bairro}, ${cidade} - ${uf}`;
        }

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
                    endereco: enderecoFinal,
                    telefone: rawTelefone,
                    imagem: instituicao.imagem,
                })
            });
            
            if (!res.ok) {
                Alert.alert("Erro", "Não foi possível atualizar.");
                return;
            }
            const atualizado = await res.json();
            setInstituicao(atualizado);
            setOriginalInstituicao(atualizado);
            setImagem(atualizado.imagem); 
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
                setImagem(originalInstituicao.imagem); 
            }
            setCep(''); setLogradouro(''); setNumero(''); setBairro(''); setCidade(''); setUf('');
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
         <SafeAreaView style={theme == "light" ? styles.safeArea : styles.safeAreaDark}>
            <HeaderComLogout />
            <View>
                <View style={theme == "light" ? styles.profileTop : styles.profileTopDark}><View style={styles.nameTag}><Text style={styles.nameText}>{instituicao.nome}</Text></View></View>
                <TouchableOpacity 
                    style={styles.profilePicWrapper} 
                    onPress={editando ? pickImage : undefined} 
                    activeOpacity={editando ? 0.7 : 1} 
                >
                    <Image
                        source={
                            imagem ? { uri: imagem } : require("../../assets/foto_perfil.png")
                        }
                        style={styles.perfilSemFoto}
                    />
                    {editando && (  
                        <View style={styles.editIconContainer}>
                            <FontAwesome5 name="pencil-alt" size={16} color="#000" />
                        </View>
                    )}
                </TouchableOpacity> 
                <View style={theme == "light" ? styles.profileBottom : styles.profileBottomDark}>
                    <TouchableOpacity style={styles.editBtn} onPress={handleEditCancel}>
                        <Text style={styles.editText}>{editando ? 'Cancelar' : 'Editar perfil'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Text style={theme == "light" ? styles.label : styles.labelDark}>Nome:</Text>
                <TextInput 
                    style={[
                        theme === "light" ? styles.input : styles.inputDark,
                        editando && styles.inputDisabled
                    ]} 
                    value={instituicao.nome} 
                    editable={false} 
                />                
                <Text style={theme == "light" ? styles.label : styles.labelDark}>Email:</Text>
                <TextInput 
                    style={[
                        theme === "light" ? styles.input : styles.inputDark,
                        editando && styles.inputDisabled
                    ]} 
                    value={instituicao.email} 
                    editable={false} 
                />                 
                <Text style={theme == "light" ? styles.label : styles.labelDark}>Endereço:</Text>
                {editando ? (
                    <>
                        <View style={styles.cepContainer}>
                            <TextInputMask
                                style={[styles.input ,{flex: 1},
                                    errors.cep && styles.inputError
                                ]}
                                type={'zip-code'}
                                placeholder="Digite o CEP"
                                placeholderTextColor="#000"
                                value={cep}
                                onChangeText={setCep}
                                onBlur={buscarCep}
                                keyboardType="numeric"
                            />
                            {loadingCep && <ActivityIndicator style={{ marginLeft: 10 }} color="#522a91" />}
                        </View>
                        {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}

                        <TextInput style={styles.input} placeholderTextColor="#000" placeholder="Logradouro (Rua, Av...)" value={logradouro} onChangeText={setLogradouro} />
                        <TextInput style={styles.input} placeholderTextColor="#000" placeholder="Número" value={numero} onChangeText={setNumero} keyboardType="numeric" />
                        <TextInput style={styles.input} placeholderTextColor="#000" placeholder="Bairro" value={bairro} onChangeText={setBairro} />
                        <TextInput style={styles.input} placeholderTextColor="#000" placeholder="Cidade" value={cidade} onChangeText={setCidade} />
                        <TextInput style={styles.input} placeholderTextColor="#000" placeholder="UF" value={uf} onChangeText={setUf} maxLength={2} autoCapitalize="characters" />
                    </>
                ) : (
                    <TextInput style={theme == "light" ? styles.input : styles.inputDark} value={instituicao.endereco} editable={false} />
                )}
                <Text style={theme == "light" ? styles.label : styles.labelDark}>CNPJ:</Text>
                <TextInput 
                    style={[
                        theme === "light" ? styles.input : styles.inputDark,
                        editando && styles.inputDisabled
                    ]} 
                    value={instituicao.cnpj} 
                    editable={false} 
                />                 
                <Text style={theme == "light" ? styles.label : styles.labelDark}>Telefone para contato:</Text>
                <TextInputMask
                    style={[
                        editando? 
                        styles.input:
                        theme === "light" ? styles.input : styles.inputDark,
                        errors.telefone && styles.inputError 
                    ]}
                    type={'cel-phone'}
                    options={{ maskType: 'BRL', withDDD: true, dddMask: '(99) ' }}
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
                <Text style={theme == "light" ? styles.label : styles.labelDark}>Plano:</Text>
                <TextInput 
                    style={[
                        theme === "light" ? styles.input : styles.inputDark,
                        editando && styles.inputDisabled
                    ]} 
                    value={instituicao.plano === 'S' ? 'Semestral' : 'Anual'} 
                    editable={false} 
                />                 
                {editando && <TouchableOpacity style={theme == "light" ? styles.saveBtn : styles.saveBtnDark} onPress={salvarEdicao}><Text style={styles.saveText}>Salvar Alterações</Text></TouchableOpacity>}
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(`PreCadastroResponsavel`)}><Text style={styles.buttonText}>Cadastro de responsáveis</Text></TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(`PreCadastroAluno`)}><Text style={styles.buttonText}>Cadastro de alunos</Text></TouchableOpacity>
            </ScrollView>
            <FooterComIcones nav={navigation} />
        </SafeAreaView>
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
    profileTop: {
        backgroundColor: '#FFBE31',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 60,
    },
    profileTopDark:{
        backgroundColor: '#8a62bbff',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 60,
    },
    profileBottom: {
        backgroundColor: '#FCD28D',
        alignItems: 'center',
        paddingTop: 80,
    },
    profileBottomDark:{
        backgroundColor: '#522a91',
        alignItems: 'center',
        paddingTop: 80,
    },
    profilePicWrapper: {
        display: 'flex',
        justifyContent: 'center',
        position: 'absolute',
        backgroundColor: '#D9D9D9',
        borderRadius: 100,
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
    labelDark: {
        width: '85%',
        fontFamily: 'PoppinsBold',
        fontSize: 14,
        color: 'white',
        marginTop: 10,
    },
    input: {
        width: '85%',
        minHeight: 45,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginVertical: 8,
        justifyContent: 'center',
        fontFamily: 'PoppinsRegular',
        color: '#000',
        borderWidth: 1,
        borderColor: '#ddd',
        paddingVertical: 10,
    },
    inputDark:{
        width: '85%',
        minHeight: 45,
        backgroundColor: '#B9B9B9',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginVertical: 8,
        justifyContent: 'center',
        fontFamily: 'PoppinsRegular',
        color: '#000',
        borderWidth: 1,
        borderColor: '#555',
        paddingVertical: 10,
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
    saveBtnDark:{
        backgroundColor: '#BB86FC',
        borderRadius: 20,
        paddingHorizontal: 30,
        paddingVertical: 10,
        marginTop: 20,
    },
    saveText: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
        color: 'white',
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
        backgroundColor: '#B9B9B9',
        color: '#3c3c3cff',
    },
    inputError: {
        borderColor: '#d9534f',
    },
    cepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '85%',
    },
    perfilSemFoto: {
        width: 120,
        height: 120,
        borderRadius: '50%',
        borderWidth: 3,
        borderColor: "#f1c40f",
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFBE31',
        borderRadius: 20,
        padding: 8,
        borderWidth: 2,
        borderColor: '#FFF',    
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
