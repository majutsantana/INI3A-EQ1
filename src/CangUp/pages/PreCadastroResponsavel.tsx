import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
 } from 'react-native';
 import * as Font from 'expo-font';
 import { useEffect, useState } from 'react';
 import { MaterialIcons } from '@expo/vector-icons';
 import Header from '../components/Header';
 import FooterComIcones from '../components/FooterComIcones';

export default function PreCadastroAluno({ navigation }) {
    
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [errors, setErrors] = useState({});
    const [nome, setNome] = useState('');
    const [CPF, setCPF] = useState('');

    const validateForm = () => {
     let newErrors = {};
     let isValid = true;
 
     if (!nome.trim()) {
       newErrors.nome = 'Nome é obrigatório.';
       isValid = false;
     }

     if (!CPF.trim()) {
       newErrors.CPF = 'CPF é obrigatório.';
       isValid = false;
     } else if (!/^\d{11}$/.test(CPF)) {
       newErrors.CPF = 'CPF inválido. Deve conter 11 dígitos numéricos.';
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

    const getDados = async () => {
        try{
            const response = await fetch('http://localhost:8000/api/cadastrarResponsavel', { // luiza e maghu arrumem
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({nome, CPF}),
            });
            const text = await response.text();
            console.log('Resposta da API (texto):', text);
        } catch(error){
            console.error('Erro ao cadastrar responsáveis:', error);
        }
    };
    
    return(
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
               <Text style={styles.label}>Nome:</Text>
               <TextInput
                 style={styles.input}
                 placeholder="Digite o nome"
                 placeholderTextColor="#888"
                 value={nome}
                 onChangeText={setNome}
               />
               {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
             </View>
              <View style={styles.inputGroup}>
               <Text style={styles.label}>CPF:</Text>
               <TextInput
                 style={styles.input}
                 placeholder="Digite o CPF"
                 placeholderTextColor="#888"
                 value={CPF}
                 onChangeText={setCPF}
               />
               {errors.CPF && <Text style={styles.errorText}>{errors.CPF}</Text>}
              </View>
          </ScrollView>
        </View>
 
        <TouchableOpacity style={styles.button}
          onPress= {handleCadastro}>
          <Text style={styles.buttonText}>Cadastrar Responsável</Text>
        </TouchableOpacity>
      </View>
      <FooterComIcones/>
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
    paddingBottom: '25%',
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
  button: {
    backgroundColor: '#FFBE31',
    paddingVertical: '5%',
    width:'70%',
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
 