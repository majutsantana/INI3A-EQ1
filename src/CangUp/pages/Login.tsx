import { Image, StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator} from 'react-native';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  function handleLinkPress(arg0: string): void {
    throw new Error('Function not implemented.');
  }
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
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
  
    if (!fontsLoaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

  return (
    <View style={styles.container}>
      {/*HEADER COM IMAGEM*/}
      <View style={styles.header}> 
      <Image
          source={require('../assets/logocangUp-horizontal-claro.png')}
          style={styles.image}
        />
      </View>

      {/*BODY*/}
      <View style={styles.body}> 
        <Text style={styles.title}>Bem-vindo de volta!</Text>
        <TextInput style={styles.input} placeholder="Email / CPF / CNPJ" /> 
        <TextInput style={styles.input} placeholder="Senha" secureTextEntry />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleLinkPress('')}>
          <Text style={styles.linkText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          Não tem uma conta? 
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate('OpUsuario')}>
            <Text style={styles.linkText}> Criar conta</Text>
          </TouchableOpacity>
      </View>

      {/*FOOTER*/}
      <View style={styles.footer}> 
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD992',
  },
  header: {
    height:'25%',
    backgroundColor: '#BEACDE',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  body: {
    flex:1,
    margin: 40,
    backgroundColor: '#f3f3f3',
    borderRadius: 30,
    padding: 20,
    justifyContent:'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 1,    
  },
  title: {
    fontSize: 20,
    marginBottom: 30,
    fontFamily: 'PoppinsBold',
  },
  input: {
    backgroundColor: '#d9d9d9',
    width: '90%',
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
    paddingLeft: 20,
    fontFamily: 'PoppinsRegular',
    color:'#999',
  },
  button: {
    backgroundColor: '#FFBE31',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'PoppinsRegular',
  },
  linkText: {
    color: '#522a91', 
    fontFamily: 'PoppinsBold',
    textAlign: 'center', 
  },
  registerText: {
    marginTop: 5,
    textAlign: 'center',
    fontFamily: 'PoppinsRegular',
    display: 'flex',
    alignItems: 'center',
  },
  footer: {
    height:'8%',
    backgroundColor: '#BEACDE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  image:{
    width: '80%',
    height: '100%',
  }
});