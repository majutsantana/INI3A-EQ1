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
  import * as Font from 'expo-font';
  import { useContext, useEffect, useState } from 'react';
  import { useNavigation } from '@react-navigation/native';
  import { MaterialIcons } from '@expo/vector-icons';
  import Header from '../../components/Header';
  import FooterComIcones from '../../components/FooterSemIcones';
  import useApi from '../../hooks/useApi';
  import { TextInputMask } from 'react-native-masked-text';
  import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../components/AuthContext';

  type Responsavel = {
    id: number;
} 
  
   /*const CustomNumericInput = ({ value, onChange, minValue, maxValue }) => {
    const handleIncrement = () => {
      if (value < maxValue) {
        onChange(value + 1);
      }
    };
  
    const handleDecrement = () => {
      if (value > minValue) {
        onChange(value - 1);
      }
    };
  
    return (
      <View style={styles.customNumericContainer}>
        <TouchableOpacity onPress={handleDecrement} style={styles.customNumericButton}>
          <Text style={styles.customNumericButtonText}>-</Text>
        </TouchableOpacity>
        <View style={styles.customNumericInputView}>
          <Text style={styles.customNumericValueText}>{value}</Text>
        </View>
        </TouchableOpacity>
        </View>
    );
  };*/
  
  
  export default function CadastroVeiculo({ navigation }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [responsavel, setResponsavel] = useState<Responsavel | null>(null);
    const [modelo, setModelo] = useState('');
    const [placa, setPlaca] = useState('');
    const [placaMask, setPlacaMask] = useState('AAA-9999'); 
    const [cor, setCor] = useState('');
    const [qtde_assentos, setQtdeAssentos] = useState('');
    const [errors, setErrors] = useState({});
    const { url } = useApi();
    const { logout } = useContext(AuthContext);
  
    const handlePlacaChange = (maskedText, rawText) => {
        const text = rawText || '';
        // Verifica o 5º caractere para decidir entre o padrão antigo e o Mercosul
        if (text.length >= 5) {
            const fifthChar = text.charAt(4);
            if (/[a-zA-Z]/.test(fifthChar)) {
                // Se for letra, usa a máscara Mercosul
                setPlacaMask('AAA9A99');
            } else {
                // Se for número, usa a máscara antiga
                setPlacaMask('AAA-9999');
            }
        } else {
            // Volta para a máscara padrão se o texto for curto
            setPlacaMask('AAA-9999');
        }
        setPlaca(maskedText.toUpperCase()); // Armazena o valor com máscara e em maiúsculas
    };
  
    const validateForm = () => {
      let newErrors = {};
      let isValid = true;
  
      if (!modelo.trim()) {
        newErrors.modelo = 'Modelo é obrigatório.';
        isValid = false;
      }
  
      if (!placa.trim()) {
        newErrors.placa = 'Placa é obrigatória.';
        isValid = false;
      } else if (placa.replace(/-/g, '').length !== 7) {
        newErrors.placa = 'A placa deve ter 7 caracteres.';
        isValid = false;
      }
  
      if (!cor.trim()) {
        newErrors.cor = 'Cor é obrigatório.';
        isValid = false;
      }
  
      const numAssentos = Number(qtde_assentos);
      if (isNaN(numAssentos) || numAssentos < 1) {
        newErrors.qtde_assentos = 'O carro deve ter pelo menos 1 assento.';
        isValid = false;
      } else if (numAssentos > 7) {
        newErrors.qtde_assentos = 'Um carro tem no máximo 7 assentos.';
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
      fetchResponsavel();
    }, []);
  
    const fetchResponsavel = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt");
        if (!token) {
          Alert.alert("Erro", "Você precisa estar logado.");
          logout();
          return;
        }
        
        const id_resp = await AsyncStorage.getItem("id_responsavel");
        if (!id_resp) {
            Alert.alert("Erro", "ID do responsavel não encontrado. Por favor, faça o login novamente.");
            logout();
            return;
        }
        const res = await fetch(`${url}/api/responsaveis/${id_resp}`, {
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
        setResponsavel(data);
      }catch (err) {
        console.error(err);
        Alert.alert("Erro", "Não foi possível buscar os dados.");
      }
    }; 

    const handleCadastro  = async () => {
        if (validateForm()) {
        try {
            await getDados();
            navigation.navigate('PerfilResponsavel');
        } catch (error) {
            console.error("Erro no processo de cadastro (handleCadastro):", error);
        }
        } else {
        console.log('Formulário inválido, corrigindo erros:', errors);
        }
    };

    const getDados = async () => {
        try{
            const token = await AsyncStorage.getItem('jwt');
            const id_resp = await AsyncStorage.getItem("id_responsavel");
            let {url} = useApi();
            const response = await fetch(url+'/api/cadastrarVeiculo', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+token
            },
            body: JSON.stringify({modelo, placa, cor, qtde_assentos, id_resp}),
            });
            const text = await response.text();
            console.log('Resposta da API (texto):', text);
        } catch(error){
            console.error('Erro ao cadastrar veiculo:', error);
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
        <Header />
  
        <View style={styles.content}>
          <View style={styles.formContainer}>
            <View style={styles.topo}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={28} color="#000" />
              </TouchableOpacity>
              <Text style={styles.tituloAba}>Veículo</Text>
            </View>
            
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Modelo:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o modelo"
                  placeholderTextColor="#888"
                  value={modelo}
                  onChangeText={setModelo}
                />
                {errors.modelo && <Text style={styles.errorText}>{errors.modelo}</Text>}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Placa:</Text>
                <TextInputMask
                    style={styles.input}
                    type={'custom'}
                    options={{
                    // 'S' aceita letras e números, permitindo ambos os formatos de placa
                        mask: 'AAA-9S99' 
                      }}
                      placeholder="ABC-1234 ou ABC-1D23"
                      placeholderTextColor="#888"
                      value={placa}
                      onChangeText={text => setPlaca(text.toUpperCase())}
                      autoCapitalize="characters"
                />
              </View>
              {errors.placa && <Text style={styles.errorText}>{errors.placa}</Text>}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cor:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite a cor"
                  placeholderTextColor="#888"
                  value={cor}
                  onChangeText={setCor}
                />
                {errors.cor && <Text style={styles.errorText}>{errors.cor}</Text>}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Assentos Disponíveis:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite a quantidade de assentos:"
                  placeholderTextColor="#888"
                  value={qtde_assentos}
                  onChangeText={setQtdeAssentos}
                /> 
              </View>
              {errors.qtde_assentos && <Text style={styles.errorText}>{errors.qtde_assentos}</Text>}
  
            </ScrollView>
          </View>
  
          <TouchableOpacity style={styles.button}
            onPress={handleCadastro}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
  
        <FooterComIcones />
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
      marginBottom: '2%',
      padding:'1%'
    },
    label: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: '3%',
      fontFamily: 'PoppinsRegular',
      textAlign: 'center',
    },
    topo: {
      flexDirection:'row',
      gap: '24.6%',
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
    tituloAba: {
      fontFamily: 'PoppinsBold',
      fontSize: 20,
      color: '#333',
      marginBottom: 10,
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
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: 10,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 5,
      fontFamily: 'PoppinsRegular',
      textAlign: 'center',
    },
    customNumericContainer: {
  		flexDirection: 'row',
  		alignItems: 'center',
  		justifyContent: 'center',
  		alignSelf: 'center',
  		backgroundColor: '#d9d9d9',
  		borderRadius: 25,
  		height: 50,
  		width: '60%',
  		shadowColor: "#000",
  		shadowOffset: {
  			width: 0,
  			height: 3,
  		},
  		shadowOpacity: 0.27,
  		shadowRadius: 4.65,
  		elevation: 6,
  	},
  	customNumericButton: {
  		width: '40%',
  		height: '100%',
  		justifyContent: 'center',
  		alignItems: 'center',
  	},
  	customNumericButtonText: {
  		fontSize: 24,
  		fontWeight: 'bold',
  		color: '#3D3D3D',
  	},
  	customNumericInputView: {
  		height: '100%',
  		justifyContent: 'center',
      alignItems:'center'
  	},
  	customNumericValueText: {
  		fontSize: 20,
  		fontFamily: 'PoppinsBold',
  		color: '#3D3D3D',
  	},
  });
  