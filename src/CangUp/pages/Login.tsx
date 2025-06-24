import { Image, StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) { //navigation não está dando erro, é só o vscode bugando

  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [username, setusername] = useState<string>('');
  const [senha, setsenha] = useState<string>('');


  const login = async () => {
    if (!username || !senha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }


    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, senha })
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Erro", errorData.detail || "Falha no login");
        return;
      }

      const data = await response.json();
      const token = data.token;

      if (token) {
        await AsyncStorage.setItem("jwt", token);
        navigation.navigate("Home"); // Troque "Home" pelo nome real da sua tela
      } else {
        Alert.alert("Erro", "Token não recebido.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
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
    // fetch("http://127.0.0.1:8000/")
    //   .then(r=> r.json())
    //   .then(r=> {alert(r.Hello); Alert.alert(r.Hello)})
  }, []);

  async function getDados() {
    // let r = await fetch("http://localhost:8000/cadastrar");
    // let dados =  await r.json();
    // alert(dados.Hello);

    navigation.navigate("ForgotPswdScreen");
  }

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
        <TextInput
          style={styles.input}
          placeholder="Email / CPF / CNPJ"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setusername}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888"
          secureTextEntry
          value={senha}
          onChangeText={setsenha}
        />

        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={getDados}>
          <Text style={styles.linkText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          Não tem uma conta?
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate('TipoCadastro')}>
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
    height: '25%',
    backgroundColor: '#BEACDE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    margin: '10%',
    backgroundColor: '#f3f3f3',
    borderRadius: 30,
    padding: '5%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: '5%',
    fontFamily: 'PoppinsBold',
  },
  input: {
    backgroundColor: '#d9d9d9',
    width: '90%',
    padding: '5%',
    borderRadius: 30,
    marginBottom: '10%',
    paddingLeft: '5%',
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
    paddingHorizontal: '10%',
    width: '60%',
    borderRadius: 20,
    marginBottom: '10%',
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
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'PoppinsRegular',
  },
  linkText: {
    color: '#522a91',
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
  },
  registerText: {
    textAlign: 'center',
    fontFamily: 'PoppinsRegular',
    display: 'flex',
    alignItems: 'center',
  },
  footer: {
    height: '8%',
    backgroundColor: '#BEACDE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5%',
  },
  image: {
    width: '80%',
    height: '100%',
  }
});