import {
  ActivityIndicator,
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
import Header from '../../components/Header';
import { TextInputMask } from 'react-native-masked-text';
import { Picker } from '@react-native-picker/picker';
import FooterSemIcones from '../../components/FooterSemIcones';
import useApi from '../../hooks/useApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type errorType ={ 
  nome : string | undefined,
  CPF : string | undefined,
  instituicao : string | undefined,
};
type _inst = {
    id : number,
    nome: string,
}

export default function EfetivacaoAluno({ navigation }) { //Navigation não é erro
    
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [errors, setErrors] = useState<errorType>({CPF:undefined, instituicao:undefined, nome:undefined});
    const [instituicao, setInstituicao] = useState('');
    const [nome, setNome] = useState('');
    const [CPF, setCPF] = useState('');
    const [instituicoes, setInstituicoes] = useState<_inst[]>([]);
    const { url } = useApi();
    const {theme} = useTheme();

    const validateForm = () => {
     let newErrors : errorType = {CPF:undefined, instituicao:undefined, nome:undefined};
     let isValid = true;
 
      if (!instituicao.trim()) {
        newErrors.instituicao = 'Instituição é obrigatória.';
        isValid = false;
      }

     if (!nome.trim()) {
       newErrors.nome = 'Nome é obrigatório.';
       isValid = false;
     }

     if (!CPF.trim()) {
       newErrors.CPF = 'CPF é obrigatório.';
       isValid = false;
     } else if (CPF.length < 14) {
       newErrors.CPF = 'CPF inválido. Deve conter 14 dígitos numéricos.';
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
     }, []);

     
    const handleEfetivar = async () => {
    if (validateForm()) {
      try {
        const data = await getDados();
        if (data?.responsavel?.cpf) {
          await AsyncStorage.setItem("cpf", data.responsavel.cpf);
          navigation.navigate('CadastroResponsavel');
        } else {
          console.log("Dados do responsavel não encontrados.");
        }
      } catch (error) {
        console.error("Erro no processo de efetivacao (handleEfetivar):", error);
      }
    } else {
      console.log('Formulário inválido, corrigindo erros:', errors);
    }
  };
    const getDados = async () => {
        try{
            const response = await fetch(url+'/api/efetivarResponsavel', { // luiza e maghu arrumem
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json', 
            },
            body: JSON.stringify({nome,  cpf: CPF, id_inst: instituicao ? Number(instituicao) : null }),
            });
             if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Erro ao efetivar responsavel');
            }
            const data = await response.json();
            console.log('Responsavel efetivado:', data);
            return data;
        } catch (error) {
            console.error('Erro ao efetivar responsavel:', error);
            throw error;
      }
  };

    const renderInst = () => {
      return instituicoes.map(i => 
              <Picker.Item key={i.id} label={i.nome} value={i.id} />)
      } 
      useEffect(() => {
        loadFonts();
        fetch(`${url}/api/instituicoes`)
      .then(r => r.json())
      .then(r => {
        console.log("Instituições vindas da API:", r);
        setInstituicoes(r);
      })
      .catch(err => console.error("Erro no fetch:", err));
      }, []);
    
    return(
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
              <Text style={theme == "light" ? styles.label : styles.labelDark}>Instituição:</Text>
              <View style={theme == "light" ? styles.pickerWrapper : styles.pickerWrapperDark}>
                <Picker
                  selectedValue={instituicao}
                  onValueChange={(itemValue) => setInstituicao(itemValue)}
                  style={[
                    theme == "light" ? styles.picker : styles.pickerDark,
                    { color: instituicao === '' ? '#5b5b5b' : '#000' } 
                  ]}
                >
                  <Picker.Item label="Selecione a instituição" value="" />
                  {renderInst()}
                </Picker>
              </View>
              {errors.instituicao && <Text style={styles.errorText}>{errors.instituicao}</Text>}
            </View>
            <View style={styles.inputGroup}>
               <Text style={theme == "light" ? styles.label : styles.labelDark}>Nome:</Text>
               <TextInput
                 style={theme == "light" ? styles.input : styles.inputDark}
                 placeholder="Digite o nome"
                 placeholderTextColor="#5b5b5b"
                 value={nome}
                 onChangeText={setNome}
               />
               {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
             </View>
              <View style={styles.inputGroup}>
               <Text style={theme == "light" ? styles.label : styles.labelDark}>CPF:</Text>
               <TextInputMask
                 type={'cpf'}
                 value={CPF}
                 onChangeText={text => setCPF(text)}
                 placeholder="000.000.000-00"
                 placeholderTextColor="#5b5b5b" 
                 style={theme == "light" ? styles.input : styles.inputDark}
               />
               {errors.CPF && <Text style={styles.errorText}>{errors.CPF}</Text>}
              </View>
          </ScrollView>
        </View>
 
        <TouchableOpacity style={styles.button}
          onPress= {handleEfetivar}>
          <Text style={styles.buttonText}>Prosseguir</Text>
        </TouchableOpacity>
      </View>
      <FooterSemIcones/>
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
        paddingBottom: '5%',
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
        padding:'1%',
        marginBottom:'2%',
    },
    label: {
        fontSize: 16,
        marginBottom: '2%',
        fontFamily: 'PoppinsBold',
        color: 'black'
    },
    labelDark: {
        fontSize: 16,
        marginBottom: '2%',
        fontFamily: 'PoppinsBold',
        color: 'white'
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
    pickerWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: '5%',
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
      paddingVertical: '1%',
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
    icon:{
      color:'#000'
    },
    iconDark:{
      color:'#fff'
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
        width:'60%',
        borderRadius: 20,
        alignItems: 'center',
        marginTop: '5%',
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
        color:'#5b5b5b',
    },
});
    