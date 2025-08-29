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
  import * as Font from 'expo-font';
  import { useEffect, useState } from 'react';
  import { useNavigation } from '@react-navigation/native';
  import { MaterialIcons } from '@expo/vector-icons';
  import Header from '../../components/Header';
  import FooterSemIcones from '../../components/FooterSemIcones';
  import useApi from '../../hooks/useApi';
  import { TextInputMask } from 'react-native-masked-text';
  
  // Componente personalizado para substituir o NumericInput
  const CustomNumericInput = ({ value, onChange, minValue, maxValue }) => {
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
        <TextInput
          style={styles.customNumericInput}
          value={String(value)}
          keyboardType="numeric"
          textAlign="center"
          editable={false} // Impede a digitação direta para simplificar
        />
        <TouchableOpacity onPress={handleIncrement} style={styles.customNumericButton}>
          <Text style={styles.customNumericButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  
  export default function CadastroVeiculo({ navigation }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [modelo, setModelo] = useState('');
    const [placa, setPlaca] = useState('');
    const [cor, setCor] = useState('');
    const [assentos, setAssentos] = useState(1);
    const [errors, setErrors] = useState({});
  
    const handleCadastro = async () => {
      if (validateForm()) {
        try {
          await getDados();
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
  
      const numAssentos = Number(assentos);
      if (isNaN(numAssentos) || numAssentos < 1) {
        newErrors.assentos = 'O carro deve ter pelo menos 1 assento.';
        isValid = false;
      } else if (numAssentos > 7) {
        newErrors.assentos = 'Um carro tem no máximo 7 assentos.';
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
  
    const getDados = async () => {
      try {
        let { url } = useApi();
        const response = await fetch(url + '/api/cadastrar', { // mudar rota
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ modelo, placa, cor, assentos }),
        });
        const dados = await response.json();
  
        navigation.navigate("PerfilResponsavel");
      } catch (error) {
        console.error('Erro ao cadastrar veículo:', error);
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.tituloAba}>Veículo</Text>
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
                        mask: placa.length > 7 ? 'XXX-1234' : 'XXX-1X23' //OLIVIA ARRUMAR
                    }}
                    placeholder="XXX-1234 / XXX-1X23"
                    placeholderTextColor="#888"
                    value={placa}
                    onChangeText={setPlaca}
                />
                {errors.placa && <Text style={styles.errorText}>{errors.placa}</Text>}
              </View>
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
                <Text style={styles.label}>Assentos:</Text>
                <CustomNumericInput
                  value={assentos}
                  onChange={setAssentos}
                  minValue={1}
                  maxValue={7}
                />
                {errors.assentos && <Text style={styles.errorText}>{errors.assentos}</Text>}
              </View>
  
            </ScrollView>
          </View>
  
          <TouchableOpacity style={styles.button}
            onPress={handleCadastro}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
  
        <FooterSemIcones />
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
      padding: '1%',
      marginBottom: '2%',
    },
    label: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: '5%',
      fontFamily: 'PoppinsRegular',
      textAlign: 'center',
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
      fontSize: 16,
      color: '#3D3D3D',
      textAlign: 'center',
      marginBottom: 20,
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
    // Estilos para o novo componente customizado
    customNumericContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: '#d9d9d9',
      borderRadius: 25,
      height: 50,
      width: 200,
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
      width: 60,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    customNumericButtonText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#3D3D3D',
    },
    customNumericInput: {
      flex: 1,
      height: '100%',
      fontSize: 20,
      fontFamily: 'PoppinsBold',
      color: '#3D3D3D',
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: '#c4c4c4'
    },
  });
  