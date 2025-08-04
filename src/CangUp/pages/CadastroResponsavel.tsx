import {
  ActivityIndicator,
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
import Header from '../components/Header';
import FooterSemIcones from '../components/FooterSemIcones';
import { Feather} from '@expo/vector-icons';
 
 
 export default function CadastroAluno({navigation}) { //Não é erro, é só o vscode dando trabalho
   const [fontsLoaded, setFontsLoaded] = useState(false);
   const [nome, setNome] = useState('');
   const [cpf, setCpf] = useState('');
   const [email, setEmail] = useState('');
   const [senha, setSenha] = useState('');
   const [confSenha, setconfSenha] = useState('');
   const [sexo, setSexo] = useState(''); 
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
         navigation.navigate('Login');
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
 
     if (!nome.trim()) {
       newErrors.nome = 'Nome é obrigatório.';
       isValid = false;
     }
 
     if (!cpf.trim()) {
       newErrors.cpf = 'CPF é obrigatório.';
       isValid = false;
     } else if (!/^\d{11}$/.test(cpf)) {
       newErrors.cpf = 'CPF inválido. Deve conter 11 dígitos numéricos.';
       isValid = false;
     }
 
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
 
     if (!sexo) {
       newErrors.sexo = 'Selecione o sexo.';
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
      'PoppinsRegular': require('../assets/fonts/PoppinsRegular.ttf'),
      'PoppinsBold': require('../assets/fonts/PoppinsBold.ttf'),
    });
    setFontsLoaded(true);
  };
 
 
  useEffect(() => {
    loadFonts();
  }, []);
 
  const getDados = async () => {
   try{
     const response = await fetch('http://localhost:8000/api/cadastrar', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({nome, cpf, email, senha, confSenha, sexo, check }),
     });
      const dados = await response.json();
   } catch(error){
     console.error('Erro ao cadastrar responsável:', error);
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
 