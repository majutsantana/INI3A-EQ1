import React, { useContext, useEffect, useState } from 'react';
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
    Image
} from 'react-native';
import * as Font from 'expo-font';
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import useApi from '../../hooks/useApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInputMask } from 'react-native-masked-text';
import { useTheme } from '../../context/ThemeContext';
import { AuthContext } from '../../components/AuthContext';
import * as ImagePicker from "expo-image-picker";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

type Responsavel = {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    genero: string;
    endereco: string;
    imagem: string;
}

export default function PerfilResponsavel({ navigation }) { //Navigation não está dando erro, é apenas o vs code
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [responsavel, setResponsavel] = useState<Responsavel | null>(null);
    const [originalResponsavel, setOriginalResponsavel] = useState<Responsavel | null>(null);
    const [rawTelefone, setRawTelefone] = useState('');
    const [editando, setEditando] = useState(false);
    const [errors, setErrors] = useState<{ telefone?: string, cep?: string }>({});
    const { url } = useApi();
    const {logout} = useContext(AuthContext);
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');
    const [loadingCep, setLoadingCep] = useState(false);
    const [imagem, setImagem] = useState<string | null>(null);
    const { theme} = useTheme();

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

    const fetchResponsavel = async () => {
        try {
            const token = await AsyncStorage.getItem("jwt");
            if (!token) {
                Alert.alert("Erro", "Você precisa estar logado.");
                logout();
                return;
            }
            const id = await AsyncStorage.getItem("id_responsavel");
            if (!id) {
                Alert.alert("Erro", "ID do responsável não encontrado.");
                logout();
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
        if (!responsavel) return;
        if (!validateForm()) return;

        let enderecoFinal = responsavel.endereco;
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
                    genero: responsavel.genero,
                    endereco: enderecoFinal,
                    imagem: responsavel.imagem,
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
            setCep(''); setLogradouro(''); setNumero(''); setBairro(''); setCidade(''); setUf('');
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
        <SafeAreaView style={theme == "light" ? styles.safeArea : styles.safeAreaDark}>
            <HeaderComLogout />
            <View>
                <View style={theme == "light" ? styles.profileTop : styles.profileTopDark}><View style={styles.nameTag}><Text style={styles.nameText}>{responsavel.nome}</Text></View></View>
                <TouchableOpacity 
                    style={styles.profilePicWrapper} 
                    onPress={editando ? pickImage : undefined} 
                    activeOpacity={editando ? 0.7 : 1} 
                >
                    <Image
                        source={
                            imagem ? { uri: imagem } : require("../../assets/images/FotoPerfil.png")
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
                        value={responsavel.nome} 
                        editable={false} 
                    />                
                    <Text style={theme == "light" ? styles.label : styles.labelDark}>Email:</Text>
                    <TextInput 
                        style={[
                            theme === "light" ? styles.input : styles.inputDark,
                            editando && styles.inputDisabled
                        ]} 
                        value={responsavel.email} 
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
                    <TextInput style={theme == "light" ? styles.input : styles.inputDark} value={responsavel.endereco} editable={false} />
                )}

                <Text style={theme == "light" ? styles.label : styles.labelDark}>CPF:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={responsavel.cpf} editable={false} />

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

                <Text style={theme == "light" ? styles.label : styles.labelDark}>Gênero:</Text>
                <TextInput style={[theme === "light" ? styles.input : styles.inputDark, editando && styles.inputDisabled]} value={responsavel.genero} editable={false} />

                {editando && <TouchableOpacity style={theme == "light" ? styles.saveBtn : styles.saveBtnDark} onPress={salvarEdicao}><Text style={styles.saveText}>Salvar Alterações</Text></TouchableOpacity>}
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CadastroVeiculo')}><Text style={styles.buttonText}>Cadastro de veículo</Text></TouchableOpacity>
            </ScrollView>
            <FooterComIcones nav={navigation}/>
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
        borderColor: "#BEACDE",
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

