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
import HeaderComLogout from '../../components/HeaderComLogout';
import FooterComIcones from '../../components/FooterComIcones';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useApi from '../../hooks/useApi';
import { TextInputMask } from 'react-native-masked-text';

type Aluno = {
    id: number;
    nome: string;
    ra: string;
    cpf: string;
    email: string;
    telefone: string;
    endereco: string;
    sexo: string;
}

export default function PerfilAluno({ navigation }) {
    const [originalAluno, setOriginalAluno] = useState<Aluno | null>(null);
    const [aluno, setAluno] = useState<Aluno | null>(null);
    const [rawTelefone, setRawTelefone] = useState('');
    const [editando, setEditando] = useState(false);
    const [errors, setErrors] = useState<{ telefone?: string, cep?: string }>({});
    const { url } = useApi();
    const [fontsLoaded, setFontsLoaded] = useState(false);

    // --- ESTADOS PARA EDIÇÃO DO ENDEREÇO ---
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');
    const [loadingCep, setLoadingCep] = useState(false);

    const loadFonts = async () => {
        await Font.loadAsync({
            'PoppinsRegular': require('../../assets/fonts/PoppinsRegular.ttf'),
            'PoppinsBold': require('../../assets/fonts/PoppinsBold.ttf'),
        });
        setFontsLoaded(true);
    };

    const fetchAluno = async () => {
        try {
            const token = await AsyncStorage.getItem("jwt");
            if (!token) {
                Alert.alert("Erro", "Você precisa estar logado.");
                return;
            }
            const id = await AsyncStorage.getItem("id_aluno");
            if (!id) {
                Alert.alert("Erro", "ID do aluno não encontrado.");
                return;
            }
            const res = await fetch(`${url}/api/alunos/${id}`, {
                method: "GET", headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) {
                Alert.alert("Erro", "Falha ao carregar dados.");
                return;
            }
            const data = await res.json();
            setAluno(data);
            setOriginalAluno(data);
            if (data.telefone) {
                setRawTelefone(data.telefone.replace(/\D/g, ''));
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Não foi possível buscar os dados.");
        }
    }

    // --- FUNÇÃO PARA BUSCAR O ENDEREÇO PELO CEP ---
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
        if (!aluno) return;
        if (!validateForm()) return;
        
        let enderecoFinal = aluno.endereco;
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
            const res = await fetch(`${url}/api/alunos/${aluno.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: aluno.nome,
                    ra: aluno.ra,
                    cpf: aluno.cpf,
                    email: aluno.email,
                    telefone: rawTelefone,
                    endereco: enderecoFinal,
                    sexo: aluno.sexo
                })
            });
            if (!res.ok) {
                Alert.alert("Erro", "Não foi possível atualizar.");
                return;
            }
            const atualizado = await res.json();
            setAluno(atualizado);
            setOriginalAluno(atualizado);
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
            if (originalAluno) {
                setAluno(originalAluno);
                setRawTelefone(originalAluno.telefone.replace(/\D/g, ''));
            }
            setCep(''); setLogradouro(''); setNumero(''); setBairro(''); setCidade(''); setUf('');
        }
        setEditando(!editando);
        setErrors({});
    };

    useEffect(() => {
        loadFonts();
        fetchAluno();
    }, []);

    const handleInputChange = (field: keyof Aluno, value: string) => {
        if (aluno) {
            setAluno({ ...aluno, [field]: value });
        }
    };

    if (!fontsLoaded || !aluno) {
        return <ActivityIndicator size="large" style={{ flex: 1 }} />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <HeaderComLogout />
            <View style={styles.profileTop}><View style={styles.nameTag}><Text style={styles.nameText}>{aluno.nome}</Text></View></View>
            <View style={styles.profilePicWrapper}><View style={styles.profilePic}><Text style={styles.picText}>Foto de perfil</Text></View></View>
            <View style={styles.profileBottom}>
                <TouchableOpacity style={styles.editBtn} onPress={handleEditCancel}>
                    <Text style={styles.editText}>{editando ? 'Cancelar' : 'Editar perfil'}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Text style={styles.label}>Nome:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={aluno.nome} editable={false} />
                
                <Text style={styles.label}>RA:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={aluno.ra} editable={false} />
                
                <Text style={styles.label}>Email:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={aluno.email} editable={false} />
                
                <Text style={styles.label}>Endereço:</Text>
                 {editando ? (
                    <>
                        <View style={styles.cepContainer}>
                            <TextInputMask
                                style={[styles.input, { flex: 1 }, errors.cep && styles.inputError]}
                                type={'zip-code'}
                                placeholder="Digite o CEP"
                                placeholderTextColor="#888"
                                value={cep}
                                onChangeText={setCep}
                                onBlur={buscarCep}
                                keyboardType="numeric"
                            />
                            {loadingCep && <ActivityIndicator style={{ marginLeft: 10 }} color="#522a91" />}
                        </View>
                        {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}

                        <TextInput style={styles.input} placeholder="Logradouro (Rua, Av...)" value={logradouro} onChangeText={setLogradouro} />
                        <TextInput style={styles.input} placeholder="Número" value={numero} onChangeText={setNumero} keyboardType="numeric" />
                        <TextInput style={styles.input} placeholder="Bairro" value={bairro} onChangeText={setBairro} />
                        <TextInput style={styles.input} placeholder="Cidade" value={cidade} onChangeText={setCidade} />
                        <TextInput style={styles.input} placeholder="UF" value={uf} onChangeText={setUf} maxLength={2} autoCapitalize="characters" />
                    </>
                ) : (
                    <TextInput style={[styles.input, styles.viewingModeInput]} value={aluno.endereco} editable={false} />
                )}

                <Text style={styles.label}>CPF:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={aluno.cpf} editable={false} />
                
                <Text style={styles.label}>Telefone para contato:</Text>
                <TextInputMask
                    style={[styles.input, !editando && styles.viewingModeInput, errors.telefone && styles.inputError]}
                    type={'cel-phone'}
                    options={{ maskType: 'BRL', withDDD: true, dddMask: '(99) ' }}
                    placeholder="(99) 99999-9999"
                    placeholderTextColor="#888"
                    value={aluno.telefone}
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
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={aluno.sexo} editable={false} />

                {editando && <TouchableOpacity style={styles.saveBtn} onPress={salvarEdicao}><Text style={styles.saveText}>Salvar Alterações</Text></TouchableOpacity>}
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
    },
    label: {
        width: '85%',
        fontFamily: 'PoppinsBold',
        fontSize: 14,
        color: '#333',
        marginTop: 10,
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
    input: {
        width: '85%',
        minHeight: 45,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginVertical: 8,
        justifyContent: 'center',
        fontFamily: 'PoppinsRegular',
        paddingVertical: 10,
        color: '#000'
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
    inputDisabled: {
        backgroundColor: '#E0E0E0',
        color: '#888',
    },
    viewingModeInput: {
      backgroundColor: '#F5F5F5',
      color: '#000'
    },
    cepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '85%',
    },
});

