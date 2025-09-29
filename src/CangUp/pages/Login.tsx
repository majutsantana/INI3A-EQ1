import { Image, StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import * as Font from 'expo-font';
import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, FontAwesome } from '@expo/vector-icons';
import FooterSemIcones from '../components/FooterSemIcones';
import { Picker } from '@react-native-picker/picker';
import useApi from '../hooks/useApi';
import { AuthContext } from '../components/AuthContext';
import { Switch } from 'react-native-elements';
import { useTheme } from '../context/ThemeContext';
import getStyles from './style'; // Importe a função que retorna os estilos

type _perfil = {
  rotulo: string,
  nome: string,
  id: number
}

export default function Login({ navigation }) {
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [username, setusername] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [tipoDeLogin, setTipoDeLogin] = useState<string>('');
  const [perfis, setPerfis] = useState<_perfil[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const { login: contextLogin } = useContext(AuthContext);
  const { theme, toggleTheme, colors } = useTheme();

  // Chame a função getStyles dentro do componente para obter o objeto de estilos
  const styles = getStyles();

  const toggleSenhaVisibilidade = () => {
    setSenhaVisivel(!senhaVisivel);
  };

  const login = async () => {
    if (!username || !senha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      let { url } = useApi();
      const response = await fetch(url + "/api/login", {
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
      const IdInst = data.id_instituicao;
      const IdAlun = data.id_aluno;
      const IdResp = data.id_responsavel;

      if (token) {
        await contextLogin(token, tipoDeLogin);
        if (tipoDeLogin === "inst" && IdInst) {
          await AsyncStorage.setItem("id_instituicao", IdInst);
        }
        else if (tipoDeLogin === "alun"){
          await AsyncStorage.setItem("id_aluno", IdAlun);
        }
        else{
          await AsyncStorage.setItem("id_responsavel", IdResp);
        }
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
    let { url } = useApi();
    loadFonts();
    fetch(url + "/api/perfis", {
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
          source={theme == "light" ? require('../assets/logocangUp-horizontal-claro.png') : require('../assets/logocangUp-horizontal-escuro.png')} //deixar as fotos centralizadas
          style={styles.image}
        />
      </View>

      {/*BODY*/}
      <View style={styles.body}>
          <View style={styles.olivia}>
            <Text style={styles.title}>Bem-vindo de volta!</Text>
            <TouchableOpacity onPress={toggleTheme} style={{marginLeft: 10}}>
              {theme === 'dark' ? (
                <FontAwesome name="moon-o" size={28} color={colors.text} />
              ) : (
                <Feather name="sun" size={28} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={tipoDeLogin}
            onValueChange={(itemValue) => setTipoDeLogin(itemValue)}
            style={[
              styles.picker,
              { color: tipoDeLogin === '' ? '#5B5B5B' : '#000' }
            ]}
          >
            <Picker.Item label="Selecione o tipo de Login" value="" />
            {renderPerfis()}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#5B5B5B"
          value={username}
          onChangeText={setusername}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Senha"
            placeholderTextColor="#5B5B5B"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!senhaVisivel}
          />
          <TouchableOpacity onPress={toggleSenhaVisibilidade} style={styles.eyeIcon}>
            <Feather
              name={senhaVisivel ? 'eye' : 'eye-off'}
              size={20}
              color="#5B5B5B"
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
            backgroundColor: colors.background, // Cor do modal agora é dinâmica
            borderRadius: 20,
            padding: 20,
            alignItems: 'center',
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <Text style={{ fontSize: 18, fontFamily: 'PoppinsBold', marginBottom: 10, color: colors.text }}>
              Recuperar Senha
            </Text>

            <TextInput
              style={{
                width: '100%',
                backgroundColor: theme === 'light' ? '#d9d9d9' : '#555555',
                color: colors.text,
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
                backgroundColor: theme === 'light' ? '#FFBE31' : '#E8A326',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
                width: '100%',
                alignItems: 'center',
                marginBottom: 10,
              }}
              onPress={() => {
                fetch("http://localhost:8000/api/recuperar-senha", { method: "post", body: emailRecuperacao });
                Alert.alert("Solicitação enviada", "Se o e-mail existir, você receberá instruções.");
                setModalVisible(false);
                setEmailRecuperacao('');
              }}
            >
              <Text style={{ fontFamily: 'PoppinsBold', color: colors.text }}>Enviar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ fontFamily: 'PoppinsRegular', color: theme === 'light' ? '#522a91' : '#BB86FC' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FooterSemIcones />
    </View>
  );
}
