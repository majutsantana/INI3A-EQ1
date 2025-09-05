import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
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
import FooterSemIcones from '../../components/FooterSemIcones';
import { Feather} from '@expo/vector-icons';
import useApi from '../../hooks/useApi';
import { TextInputMask } from 'react-native-masked-text';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
 
 export default function CadastroResponsavel({navigation}) { //Não é erro, é só o vscode dando trabalho
   const [fontsLoaded, setFontsLoaded] = useState(false);
   const [email, setEmail] = useState('');
   const [senha, setSenha] = useState('');
   const [confSenha, setconfSenha] = useState('');
   const [telefone, setTelefone] = useState('');
   const [cpf, setCpf] = useState('');
   const [sexo, setSexo] = useState(''); 
   const [endereco, setEndereco] = useState('');
   const [check, setCheck] = useState(false);
   const [errors, setErrors] = useState({});
   const [senhaVisivel, setSenhaVisivel] = useState(false);
   const [confSenhaVisivel, setConfSenhaVisivel] = useState(false);
   
   const toggleSenhaVisibilidade = () => {
     setSenhaVisivel(!senhaVisivel);
   };
 
   const toggleConfSenhaVisibilidade = () => {
     setConfSenhaVisivel(!confSenhaVisivel);
   };
 
   const handleCadastro  = async () => {
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
     if (!sexo) {
       newErrors.sexo = 'Selecione o sexo.';
       isValid = false;
     }

     if (!endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório.';
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
   try{
     let {url} = useApi();
     const response = await fetch(url+'/api/cadastrarResponsavel', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Accept': 'application/json',
       },
       body: JSON.stringify({ cpf, email, senha, endereco, sexo, telefone}),
     });
      console.log("Status:", response.status);
      
      // Verificação se a resposta foi bem-sucedida (status 200-299)
      if (response.ok) {
        // Tenta parsear a resposta como JSON
        const data = await response.json();
        console.log("Resposta JSON:", data);
        Alert.alert('Sucesso', 'Responsavel cadastrado com sucesso!');
        navigation.navigate('Login'); // Navegar após sucesso
      } else {
        // Se a resposta não for 2xx, tenta obter o texto do erro
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#B9A6DA" barStyle="dark-content" />
      <Header/>
 
 
      <View style={styles.content}>
        <View style={styles.formContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

             <View style={styles.inputGroup}>
               <Text style={styles.label}>Email:</Text>
               <TextInput
                 style={styles.input}
                 placeholder="Digite o email"
                 placeholderTextColor="#888"
                 value={email}
                 onChangeText={setEmail}
               />
               {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
             </View>
             <View style={styles.inputGroup}>
                <Text style={styles.label}>Endereço:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o endereço"
                  placeholderTextColor="#888"
                  value={endereco}
                  onChangeText={setEndereco}
                />
                {errors.endereco && <Text style={styles.errorText}>{errors.endereco}</Text>}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sexo:</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={sexo}
                    onValueChange={(itemValue) => setSexo(itemValue)}
                    style={[
                      styles.picker,
                      { color: sexo === '' ? '#888' : '#000' } // preto para placeholder, cinza para os demais
                    ]}
                  >
                    <Picker.Item label="Selecione o sexo" value="" />
                    <Picker.Item label="Masculino" value="Masculino" />
                    <Picker.Item label="Feminino" value="Feminino" />
                    <Picker.Item label="Neutro" value="Neutro" />
                    <Picker.Item label="Prefiro não informar" value="Prefiro não informar" />
                  </Picker>
                </View>
                {errors.sexo && <Text style={styles.errorText}>{errors.sexo}</Text>}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefone:</Text>
                <TextInputMask
                  style={styles.input}
                  type={'cel-phone'}
                  options={{
                    maskType: 'BRL',
                    withDDD: true,
                    dddMask: '(99) '
                  }}
                  placeholder="(99) 99999-9999" 
                  placeholderTextColor="#888"
                  value={telefone}
                  onChangeText={setTelefone}
                />
                {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha:</Text>
                <View style={styles.passwordContainer}>
                
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite a senha"
                  placeholderTextColor="#888"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!senhaVisivel}
                />
                <TouchableOpacity onPress={toggleSenhaVisibilidade} style={styles.eyeIcon}>
                  <Feather
                    name={senhaVisivel ? 'eye' : 'eye-off'}
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
                </View>
                {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirme a senha:</Text>
                <View style={styles.passwordContainer}>
                
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Redigite a senha"
                  placeholderTextColor="#888"
                  value={confSenha}
                  onChangeText={setconfSenha}
                  secureTextEntry={!confSenhaVisivel}
                />
                <TouchableOpacity onPress={toggleConfSenhaVisibilidade} style={styles.eyeIcon}>
                  <Feather
                    name={confSenhaVisivel ? 'eye' : 'eye-off'}
                    size={20}
                    color="#888"
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
                  <Text style={styles.textCheck}>Termos de uso</Text>
                </TouchableOpacity>
              </View>
              {errors.check && <Text style={styles.errorText}>{errors.check}</Text>}
          </ScrollView>
        </View>
 
        <TouchableOpacity style={styles.button}
          onPress= {handleCadastro}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>
      <FooterSemIcones/>
    </SafeAreaView>
  );
 }
 
 
 const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFD88D',
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: '2%',
    margin: '5%',
  },
  inputGroup: {
    padding:'1%',
    marginBottom:'2%',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: '2%',
    fontFamily: 'PoppinsRegular',
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
  passwordInput: {
    fontSize:16,
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
    justifyContent:'center',
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
  picker: {
    width:'100%',
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    backgroundColor: '#d9d9d9',
    borderWidth:0,
  },
  button: {
    backgroundColor: '#FFBE31',
    paddingVertical: '5%',
    width:'60%',
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
  seta:{
    height:'15%',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  check:{
   display: 'flex',
   flexDirection:'row',
   alignItems:'center',
   justifyContent:'flex-start',
  },
  CheckBox:{
   padding:-10,
  },
  textCheck:{
   fontSize: 14,
   fontFamily: 'PoppinsRegular',
   color: '#522a91', 
  },
  errorText: {
     color: 'red',
     fontSize: 12,
     marginTop: 5,
     fontFamily: 'PoppinsRegular',
   },
   iconButton: {
     padding:5,
     fontFamily: 'PoppinsRegular',
     flexDirection:'row',
     columnGap: 10,
     fontSize: 14,
     alignItems:'center',
     color:'#888',
   },
 });
 