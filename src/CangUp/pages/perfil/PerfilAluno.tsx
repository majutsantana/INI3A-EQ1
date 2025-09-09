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
import { Picker } from '@react-native-picker/picker';
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

export default function PerfilAluno({navigation}) {
    const [originalAluno, setOriginalAluno] = useState<Responsavel | null>(null);
    const [aluno, setAluno] = useState <Aluno | null>(null);
    const [rawTelefone, setRawTelefone] = useState('');
    const [editando, setEditando] = useState(false);
    const [errors, setErrors] = useState<{ telefone?: string }>({});
    const { url } = useApi();
    const [fontsLoaded, setFontsLoaded] = useState(false);

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
        if (!aluno) return;
        if (!validateForm()) return;

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
                    endereco: aluno.endereco,
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
            <HeaderComLogout/>
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
                <TextInput style={styles.input} value={aluno.endereco} editable={editando} onChangeText={(text) => handleInputChange('endereco', text)} />
                <Text style={styles.label}>CPF:</Text>
                <TextInput style={[styles.input, editando && styles.inputDisabled]} value={aluno.cpf} editable={false} />
                <Text style={styles.label}>Telefone para contato:</Text>
                <TextInputMask
                    style={[styles.input, errors.telefone && styles.inputError]}
                    type={'cel-phone'}
                    options={{ withDDD: true }}
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
        fontFamily: 'PoppinsRegular',
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
});



