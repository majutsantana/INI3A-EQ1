import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useRoute } from '@react-navigation/native';
import useApi from '../hooks/useApi';

export default function RedefinirSenha({ navigation }: any) { //Navigation não está dando erro, é bug
  const route = useRoute();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Ler parâmetros da URL quando a tela é aberta
  useEffect(() => {
    const params = route.params as any;
    if (params?.email) {
      setEmail(params.email);
    }
    if (params?.token) {
      setToken(params.token);
    }
  }, [route.params]);
  

  const handleRedefinirSenha = async () => {
    if (!email || !token || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    try {
      let {url} = useApi();
      const response = await fetch(url+'/api/redefinir-senha', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          token,
          senha,
          senha_confirmation: confirmarSenha
        })
      });

      // Verificar se a resposta tem conteúdo antes de tentar parsear JSON
      const responseText = await response.text();
      let data = null;
      if (responseText && responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.warn("Resposta não é JSON válido:", responseText);
        }
      }

      if (!response.ok) {
        Alert.alert('Erro', data?.detail || data?.error || 'Erro ao redefinir a senha.');
        return;
      }

      Alert.alert('Sucesso', 'Senha redefinida com sucesso!');
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível redefinir a senha.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redefinir Senha</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Token de recuperação"
        placeholderTextColor="#888"
        onChangeText={setToken}
        value={token}
      />
      <TextInput
        style={styles.input}
        placeholder="Nova senha"
        placeholderTextColor="#888"
        secureTextEntry
        onChangeText={setSenha}
        value={senha}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar nova senha"
        placeholderTextColor="#888"
        secureTextEntry
        onChangeText={setConfirmarSenha}
        value={confirmarSenha}
      />

      <TouchableOpacity style={styles.button} onPress={handleRedefinirSenha}>
        <Text style={styles.buttonText}>Redefinir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD992',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'PoppinsBold',
    color: '#522a91',
  },
  input: {
    width: '100%',
    backgroundColor: '#d9d9d9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontFamily: 'PoppinsRegular',
  },
  button: {
    backgroundColor: '#FFBE31',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontFamily: 'PoppinsBold',
    color: '#000',
  },
});
