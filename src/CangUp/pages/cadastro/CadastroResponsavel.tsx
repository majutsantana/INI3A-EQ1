import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { CheckBox } from 'react-native-elements';
import Header from '../../components/Header';
import FooterComIcones from '../../components/FooterComIcones';
import { Feather } from '@expo/vector-icons';
import useApi from '../../hooks/useApi';
import { TextInputMask } from 'react-native-masked-text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';


export default function CadastroResponsavel({ navigation }) { //Não é erro, é só o vscode dando trabalho
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confSenha, setconfSenha] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cpf, setCpf] = useState('');
    const [genero, setGenero] = useState('');
    const [check, setCheck] = useState(false);
    const [errors, setErrors] = useState({});
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const [confSenhaVisivel, setConfSenhaVisivel] = useState(false);
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');
    const [loadingCep, setLoadingCep] = useState(false); // Para mostrar indicador de carregamento
    const { theme} = useTheme();

    const toggleSenhaVisibilidade = () => {
        setSenhaVisivel(!senhaVisivel);
    };

    const toggleConfSenhaVisibilidade = () => {
        setConfSenhaVisivel(!confSenhaVisivel);
    };

    // --- FUNÇÃO PARA BUSCAR O ENDEREÇO PELO CEP ---
    const buscarCep = async () => {
        const cepLimpo = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
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
                setLogradouro('');
                setBairro('');
                setCidade('');
                setUf('');
            } else {
                setLogradouro(data.logradouro);
                setBairro(data.bairro);
                setCidade(data.localidade);
                setUf(data.uf);
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            setErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP. Verifique sua conexão.' }));
        } finally {
            setLoadingCep(false);
        }
    };

    const handleCadastro = async () => {
        if (validateForm()) {
            try {
                await getDados();
                navigation.navigate('Login'); //implemetar direcionamento para ir pra tela funcionalidadesAlunoResponsavel 
            } catch (error) {
                console.error("Erro no processo de cadastro (handleCadastro):", error);
            }
        } else {
            console.log('Formulário inválido, corrigindo erros:', errors);
        }
    };

    const validateForm = () => {
        let newErrors = {};
        let isValid = true;

        if (!email.trim()) {
            newErrors.email = 'Email é obrigatório.';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email inválido.';
            isValid = false;
        }

        if (!senha.trim()) {
            newErrors.senha = 'Senha é obrigatória.';
            isValid = false;
        } else if (senha.length < 6) {
            newErrors.senha = 'A senha deve ter pelo menos 6 caracteres.';
            isValid = false;
        }

        if (!confSenha.trim()) {
            newErrors.confSenha = 'Confirmação de senha é obrigatória.';
            isValid = false;
        } else if (senha !== confSenha) {
            newErrors.confSenha = 'As senhas não coincidem.';
            isValid = false;
        }
        if (!telefone.trim()) {
            newErrors.telefone = 'Telefone é obrigatório.';
            isValid = false;
        }
        else {
            const onlyNumbers = telefone.replace(/\D/g, '');
            if (onlyNumbers.length < 10 || onlyNumbers.length > 11) {
                newErrors.telefone = 'Telefone inválido. Deve conter DDD + número.';
                isValid = false;
            }
        }
        if (!genero) {
            newErrors.genero = 'Selecione o gênero.';
            isValid = false;
        }

        // --- VALIDAÇÃO DOS CAMPOS DE ENDEREÇO ---
        if (!cep.trim()) {
            newErrors.cep = 'CEP é obrigatório.';
            isValid = false;
        }
        if (!logradouro.trim()) {
            newErrors.logradouro = 'Logradouro é obrigatório.';
            isValid = false;
        }
        if (!numero.trim()) {
            newErrors.numero = 'Número é obrigatório.';
            isValid = false;
        }
        if (!bairro.trim()) {
            newErrors.bairro = 'Bairro é obrigatório.';
            isValid = false;
        }
        if (!cidade.trim()) {
            newErrors.cidade = 'Cidade é obrigatória.';
            isValid = false;
        }
        if (!uf.trim()) {
            newErrors.uf = 'UF é obrigatório.';
            isValid = false;
        }

        if (!check) {
            newErrors.check = 'Você deve aceitar os termos de uso.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const loadFonts = async () => {
        await Font.loadAsync({
            'PoppinsRegular': require('../../assets/fonts/PoppinsRegular.ttf'),
            'PoppinsBold': require('../../assets/fonts/PoppinsBold.ttf'),
        });
        setFontsLoaded(true);
    };


    useEffect(() => {
        fetchResponsavel();
        loadFonts();
    }, []);

    let { url } = useApi();
    const getDados = async () => {
        // --- MONTA O ENDEREÇO COMPLETO ANTES DE ENVIAR ---
        const enderecoCompleto = `${logradouro}, ${numero} - ${bairro}, ${cidade} - ${uf}`;

        try {
            const response = await fetch(url + '/api/cadastrarResponsavel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ cpf, email, senha, endereco: enderecoCompleto, genero, telefone }),
            });
            console.log("Status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("Resposta JSON:", data);
                Alert.alert('Sucesso', 'Responsavel cadastrado com sucesso!');
                navigation.navigate('Login'); 
            } else {
                const errorText = await response.text();
                console.error("Erro na resposta do servidor:", errorText);
                Alert.alert('Erro', `Falha ao cadastrar. Resposta do servidor: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erro ao cadastrar responsavel:', error);
            Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
        }
    };

    const fetchResponsavel = async () => {
        try {
            const cpfValue = await AsyncStorage.getItem("cpf");
            if (!cpfValue) {
                Alert.alert("Erro", "CPF não encontrado...");
                navigation.goBack();
                return;
            }
            setCpf(cpfValue);
        } catch (err) {
            console.error("Erro ao buscar CPF do AsyncStorage:", err);
        }
    };


    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaProvider style={theme == "light" ? styles.safeArea : styles.safeAreaDark}>
            <StatusBar backgroundColor="#B9A6DA" barStyle="dark-content" />
            <Header/>


            <View style={styles.content}>
                <View style={theme == "light" ? styles.formContainer : styles.formContainerDark}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={28} style={theme == "light" ? styles.icon : styles.iconDark}/>
                    </TouchableOpacity>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >

                        <View style={styles.inputGroup}>
                            <Text style={theme == "light" ? styles.label : styles.labelDark}>Email:</Text>
                            <TextInput
                                style={theme == "light" ? styles.input : styles.inputDark}
                                placeholder="Digite o email"
                                placeholderTextColor="#5b5b5b"
                                value={email}
                                onChangeText={setEmail}
                            />
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={theme == "light" ? styles.label : styles.labelDark}>Endereço</Text>
                            <View style={styles.cepContainer}>
                                <TextInputMask
                                    style={[theme == "light" ? styles.input : styles.inputDark, { flex: 1 }]}
                                    type={'zip-code'}
                                    placeholder="Digite o CEP"
                                    placeholderTextColor="#5b5b5b"
                                    value={cep}
                                    onChangeText={setCep}
                                    onBlur={buscarCep}
                                    keyboardType="numeric"
                                />
                                {loadingCep && <ActivityIndicator style={{ marginLeft: 10 }} color="#522a91" />}
                            </View>
                            {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <TextInput
                                style={theme == "light" ? styles.input : styles.inputDark}
                                placeholder="Logradouro (Rua, Av...)"
                                placeholderTextColor="#5b5b5b"
                                value={logradouro}
                                onChangeText={setLogradouro}
                            />
                            {errors.logradouro && <Text style={styles.errorText}>{errors.logradouro}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <TextInput
                                style={theme == "light" ? styles.input : styles.inputDark}
                                placeholder="Número"
                                placeholderTextColor="#5b5b5b"
                                value={numero}
                                onChangeText={setNumero}
                                keyboardType="numeric"
                            />
                            {errors.numero && <Text style={styles.errorText}>{errors.numero}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <TextInput
                                style={theme == "light" ? styles.input : styles.inputDark}
                                placeholder="Bairro"
                                placeholderTextColor="#5b5b5b"
                                value={bairro}
                                onChangeText={setBairro}
                            />
                            {errors.bairro && <Text style={styles.errorText}>{errors.bairro}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <TextInput
                                style={theme == "light" ? styles.input : styles.inputDark}
                                placeholder="Cidade"
                                placeholderTextColor="#5b5b5b"
                                value={cidade}
                                onChangeText={setCidade}
                            />
                            {errors.cidade && <Text style={styles.errorText}>{errors.cidade}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <TextInput
                                style={theme == "light" ? styles.input : styles.inputDark}
                                placeholder="UF"
                                placeholderTextColor="#5b5b5b"
                                value={uf}
                                onChangeText={setUf}
                                maxLength={2}
                                autoCapitalize="characters"
                            />
                            {errors.uf && <Text style={styles.errorText}>{errors.uf}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={theme == "light" ? styles.label : styles.labelDark}>Gênero:</Text>
                            <View style={theme == "light" ? styles.pickerWrapper : styles.pickerWrapperDark}>
                                <Picker
                                    selectedValue={genero}
                                    onValueChange={(itemValue) => setGenero(itemValue)}
                                    style={[
                                        theme == "light" ? styles.picker : styles.pickerDark,
                                        { color: genero === '' ? '#5b5b5b' : '#000' } // preto para placeholder, cinza para os demais
                                    ]}
                                >
                                    <Picker.Item label="Selecione o gênero" value="" />
                                    <Picker.Item label="Masculino" value="Masculino" />
                                    <Picker.Item label="Feminino" value="Feminino" />
                                    <Picker.Item label="Neutro" value="Neutro" />
                                    <Picker.Item label="Prefiro não informar" value="Prefiro não informar" />
                                </Picker>
                            </View>
                            {errors.genero && <Text style={styles.errorText}>{errors.genero}</Text>}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={theme == "light" ? styles.label : styles.labelDark}>Telefone:</Text>
                            <TextInputMask
                                style={theme == "light" ? styles.input : styles.inputDark}
                                type={'cel-phone'}
                                options={{
                                    maskType: 'BRL',
                                    withDDD: true,
                                    dddMask: '(99) '
                                }}
                                placeholder="(99) 99999-9999"
                                placeholderTextColor="#5b5b5b"
                                value={telefone}
                                onChangeText={setTelefone}
                            />
                            {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={theme == "light" ? styles.label : styles.labelDark}>Senha:</Text>
                            <View style={theme == "light" ? styles.passwordContainer : styles.passwordContainerDark}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Digite a senha"
                                    placeholderTextColor="#5b5b5b"
                                    value={senha}
                                    onChangeText={setSenha}
                                    secureTextEntry={!senhaVisivel}
                                />
                                <TouchableOpacity onPress={toggleSenhaVisibilidade} style={styles.eyeIcon}>
                                    <Feather
                                        name={senhaVisivel ? 'eye' : 'eye-off'}
                                        size={20}
                                        color="#5b5b5b"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={theme == "light" ? styles.label : styles.labelDark}>Confirme a senha:</Text>
                            <View style={theme == "light" ? styles.passwordContainer : styles.passwordContainerDark}>

                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Redigite a senha"
                                    placeholderTextColor="#5b5b5b"
                                    value={confSenha}
                                    onChangeText={setconfSenha}
                                    secureTextEntry={!confSenhaVisivel}
                                />
                                <TouchableOpacity onPress={toggleConfSenhaVisibilidade} style={styles.eyeIcon}>
                                    <Feather
                                        name={confSenhaVisivel ? 'eye' : 'eye-off'}
                                        size={20}
                                        color="#5b5b5b"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.confSenha && <Text style={styles.errorText}>{errors.confSenha}</Text>}
                        </View>
                        <View style={styles.check}>
                            <CheckBox
                                checked={check}
                                onPress={() => setCheck(!check)} />
                            <TouchableOpacity>
                                <Text style={theme == "light" ? styles.textCheck : styles.textCheckDark}>Termos de uso</Text>
                            </TouchableOpacity>
                        </View>
                        {errors.check && <Text style={styles.errorText}>{errors.check}</Text>}
                    </ScrollView>
                </View>

                <TouchableOpacity style={styles.button}
                    onPress={handleCadastro}>
                    <Text style={styles.buttonText}>Cadastrar</Text>
                </TouchableOpacity>
            </View>
            <FooterComIcones nav={navigation}/>
        </SafeAreaProvider>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFD88D',
    },
    safeAreaDark: {
        flex: 1,
        backgroundColor: '#522a91',
    },
    content: {
        flex: 1,
        paddingHorizontal: '5%',
        paddingTop: '10%',
        paddingBottom: '10%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 30,
        padding: '5%',
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 4.65,
        elevation: 1,
    },
    formContainerDark: {
        flex: 1,
        backgroundColor: '#333',
        borderRadius: 30,
        padding: '5%',
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 4.65,
        elevation: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: '2%',
        margin: '5%',
    },
    inputGroup: {
        padding: '1%',
        marginBottom: '2%',
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: '2%',
        fontFamily: 'PoppinsRegular',
        color:'#000'
    },
    labelDark: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: '2%',
        fontFamily: 'PoppinsRegular',
        color:'#fff'
    },
    input: {
        backgroundColor: '#d9d9d9',
        borderRadius: 25,
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        fontSize: 16,
        fontFamily: 'PoppinsRegular',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    inputDark: {
        backgroundColor: '#b9b9b9',
        borderRadius: 25,
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        fontSize: 16,
        fontFamily: 'PoppinsRegular',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d9d9d9',
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    passwordContainerDark: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#b9b9b9',
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    passwordInput: {
        fontSize: 16,
        flex: 1,
        padding: '5%',
        paddingLeft: '5%',
        fontFamily: 'PoppinsRegular',
        color: '#000',
    },
    eyeIcon: {
        paddingRight: '5%',
    },
    pickerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: '#d9d9d9',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    pickerWrapperDark: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: '#b9b9b9',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    picker: {
        width: '100%',
        fontSize: 16,
        fontFamily: 'PoppinsRegular',
        backgroundColor: '#d9d9d9',
        borderWidth: 0,
    },
    pickerDark: {
        width: '100%',
        fontSize: 16,
        fontFamily: 'PoppinsRegular',
        backgroundColor: '#b9b9b9',
        borderWidth: 0,
    },
    button: {
        backgroundColor: '#FFBE31',
        paddingVertical: '5%',
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
        fontSize: 18,
        fontFamily: 'PoppinsRegular',
    },
    seta: {
        height: '15%',
    },
    icon:{
        color: '#000'
    },
    iconDark:{
        color: '#fff'
    },
    backButton: {
        alignSelf: 'flex-start',
    },
    check: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    CheckBox: {
        padding: -10,
    },
    textCheck: {
        fontSize: 14,
        fontFamily: 'PoppinsRegular',
        color: '#522a91',
    },
    textCheckDark: {
        fontSize: 14,
        fontFamily: 'PoppinsRegular',
        color: '#BB86FC',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
        fontFamily: 'PoppinsRegular',
    },
    iconButton: {
        padding: 5,
        fontFamily: 'PoppinsRegular',
        flexDirection: 'row',
        columnGap: 10,
        fontSize: 14,
        alignItems: 'center',
        color: '#5b5b5b',
    },
    cepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});
