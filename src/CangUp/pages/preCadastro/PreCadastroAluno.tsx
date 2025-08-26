import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/Header';
import FooterComIcones from '../../components/FooterComIcones';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInputMask } from 'react-native-masked-text'; //Pacote instalado 
import useApi from '../../hooks/useApi';
import HeaderComLogout from '../../components/HeaderComLogout';

type errorType ={ 
  nome : string | undefined,
  RA : string | undefined,
  CPF : string | undefined
};

type Instituicao = {
    id: number;
} 

export default function PreCadastroAluno({ navigation }) { 
    
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [errors, setErrors] = useState<errorType>({nome:undefined, CPF:undefined, RA:undefined});
    const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
    const [nome, setNome] = useState('');
    const [RA, setRA] = useState('');
    const [CPF, setCPF] = useState('');
    const { url } = useApi();

    const validateForm = () => {
     let newErrors : errorType = {nome:undefined, CPF:undefined, RA:undefined};
     let isValid = true;
 
     if (!nome.trim()) {
       newErrors.nome = 'Nome é obrigatório.';
       isValid = false;
     }
 
     if (!RA.trim()) {
       newErrors.RA = 'O número de matrícula é obrigatório.';
       isValid = false;
     }

     if (!CPF.trim()) {
       newErrors.CPF = 'CPF é obrigatório.';
       isValid = false;
     } else if (CPF.length < 14) {
       newErrors.CPF = 'CPF inválido. Deve conter 11 dígitos numéricos.';
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
       loadFonts();
       fetchInstituicao();
     }, []);

    const fetchInstituicao = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt");
        if (!token) {
          Alert.alert("Erro", "Você precisa estar logado.");
          navigation.navigate("Login");
          return;
        }
        
        const id_inst = await AsyncStorage.getItem("id_instituicao");
        if (!id_inst) {
            Alert.alert("Erro", "ID da instituição não encontrado. Por favor, faça o login novamente.");
            navigation.navigate("Login");
            return;
        }
        const res = await fetch(`${url}/api/instituicoes/${id_inst}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
  
        if (!res.ok) {
          Alert.alert("Erro", "Falha ao carregar dados.");
          return;
        }
  
        const data = await res.json();
        setInstituicao(data);
      }catch (err) {
        console.error(err);
        Alert.alert("Erro", "Não foi possível buscar os dados.");
      }
    }; 

    const handlePreCadastro  = async () => {
        if (validateForm()) {
        try {
            await getDados();
            navigation.navigate('PerfilInstituicao');
        } catch (error) {
            console.error("Erro no processo de cadastro (handlePreCadastro):", error);
        }
        } else {
        console.log('Formulário inválido, corrigindo erros:', errors);
        }
    };

    const getDados = async () => {
        try{
            let token = AsyncStorage.getItem('jwt');
            let {url} = useApi();
            const response = await fetch(url+'/api/preCadastrarAluno', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+token
            },
            body: JSON.stringify({nome, RA, CPF}),
            });
            const text = await response.text();
            console.log('Resposta da API (texto):', text);
        } catch(error){
            console.error('Erro ao cadastrar aluno:', error);
        }
    };
    
    return(
      <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#B9A6DA" barStyle="dark-content" />
      <HeaderComLogout/>

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
               <Text style={styles.label}>Número de matrícula/RA:</Text>
               <TextInput
                 style={styles.input}
                 placeholder="Digite o número de matrícula"
                 placeholderTextColor="#888"
                 value={RA}
                 onChangeText={setRA}
               />
               {errors.RA && <Text style={styles.errorText}>{errors.RA}</Text>}
              </View>
              <View style={styles.inputGroup}>
               <Text style={styles.label}>CPF:</Text>
               <TextInputMask
                 type={'cpf'}
                 value={CPF}
                 onChangeText={text => setCPF(text)}
                 placeholder="000.000.000-00"
                 style={styles.input}
                 placeholderTextColor="#888"
               />
               {errors.CPF && <Text style={styles.errorText}>{errors.CPF}</Text>}
              </View>
          </ScrollView>
        </View>
 
        <TouchableOpacity style={styles.button}
          onPress= {handlePreCadastro}>
          <Text style={styles.buttonText}>Cadastrar Aluno</Text>
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
    