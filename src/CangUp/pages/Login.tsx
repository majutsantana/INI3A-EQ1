import { Image, StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import FooterSemIcones from '../components/FooterSemIcones';
import { Picker } from '@react-native-picker/picker';

type _perfil = {
  rotulo: string,
  nome: string,
  id: number
}

export default function Login({ navigation }) { //bug, não está dando erro 
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [username, setusername] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [tipoDeLogin, setTipoDeLogin] = useState<string>('');
  const [perfis, setPerfis] = useState<_perfil[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');

  const toggleSenhaVisibilidade = () => {
    setSenhaVisivel(!senhaVisivel);
  };

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
        body: JSON.stringify({ login: username, senha, perfil: tipoDeLogin })
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
        if (tipoDeLogin === "inst")
          navigation.navigate("PerfilInstituicao");
        else if (tipoDeLogin === "alun")
          navigation.navigate("PerfilAluno");
        else
          navigation.navigate("PerfilResponsavel");
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
    fetch("http://127.0.0.1:8000/api/perfis", {
      method: 'GET'
    }).then(r => r.json())
      .then(r => setPerfis(r))
  }, []);

  function getDados() {
    setModalVisible(true);
  }

  const renderPerfis = () => {
    return perfis.map(p =>
      <Picker.Item key={p.id} label={p.nome} value={p.rotulo} />
    )
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
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={tipoDeLogin}
            onValueChange={(itemValue) => setTipoDeLogin(itemValue)}
            style={[
              styles.picker,
              { color: tipoDeLogin === '' ? '#888' : '#000' }
            ]}
          >
            <Picker.Item label="Selecione o tipo de Login" value="" />
            {renderPerfis()}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setusername}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Senha"
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

      {/* MODAL DE ESQUECI MINHA SENHA */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            width: '85%',
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <Text style={{ fontSize: 18, fontFamily: 'PoppinsBold', marginBottom: 10 }}>
              Recuperar Senha
            </Text>

            <TextInput
              style={{
                width: '100%',
                backgroundColor: '#d9d9d9',
                padding: 12,
                borderRadius: 10,
                fontFamily: 'PoppinsRegular',
                marginBottom: 15
              }}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#888"
              value={emailRecuperacao}
              onChangeText={setEmailRecuperacao}
            />

            <TouchableOpacity
              style={{
                backgroundColor: '#FFBE31',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
                width: '100%',
                alignItems: 'center',
                marginBottom: 10,
              }}
              onPress={() => {
                fetch("/api/recuperar-senha", { method: "post", body: emailRecuperacao });
                Alert.alert("Solicitação enviada", "Se o e-mail existir, você receberá instruções.");
                setModalVisible(false);
                setEmailRecuperacao('');
              }}
            >
              <Text style={{ fontFamily: 'PoppinsBold', color: '#000' }}>Enviar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ fontFamily: 'PoppinsRegular', color: '#522a91' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FooterSemIcones />
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
    fontFamily: 'PoppinsBold',
  },
  input: {
    backgroundColor: '#d9d9d9',
    width: '90%',
    padding: '5%',
    borderRadius: 30,
    marginTop: '10%',
    paddingLeft: '5%',
    fontFamily: 'PoppinsRegular',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9d9d9',
    width: '90%',
    borderRadius: 30,
    marginTop: '10%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  passwordInput: {
    flex: 1,
    padding: '5%',
    paddingLeft: '5%',
    fontFamily: 'PoppinsRegular',
    color: '#000',
  },
  eyeIcon: {
    paddingRight: '5%',
  },
  button: {
    backgroundColor: '#FFBE31',
    paddingVertical: '5%',
    paddingHorizontal: '10%',
    width: '60%',
    borderRadius: 20,
    marginTop: '10%',
    marginBottom: '10%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
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
  },
  inputgroup: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '5%',
  },
  iconButton: {
    padding: 5,
    fontFamily: 'PoppinsRegular',
    flexDirection: 'row',
    columnGap: 10,
    fontSize: 14,
    alignItems: 'center',
    color: '#888',
  },
  picker: {
    width: '100%',
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    backgroundColor: '#d9d9d9',
    borderWidth: 0,
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
});
