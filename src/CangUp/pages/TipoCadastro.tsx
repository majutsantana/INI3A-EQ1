import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image,  ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons'; // use isso com Expo
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

export default function OpUsuario({navigation}) {
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
      <View style={styles.header}> {/*HEADER COM IMAGEM*/}
        <Image
          source={require('../assets/logocangUp-horizontal-claro.png')}
          style={styles.image}
        />
      </View>

      <View style={styles.body}> {/*CORPO*/}
        {/* Botão de voltar dentro do body*/}
        <View style={styles.seta}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.opcoes}>
          <Text style={styles.title}>Selecione o tipo de usuário:</Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Instituição</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CadastroAluno')}>
            <Text style={styles.buttonText}>Aluno</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Responsável</Text>
          </TouchableOpacity>
        </View>
        
      </View>

      {/*FOOTER*/}
      <View style={styles.footer}></View> 
    </View>
  );
}

const styles = StyleSheet.create({
  opcoes:{
    justifyContent:'center',
    alignItems:'center',
    height:'85%',
  },
  seta:{
    height:'15%',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFD992',
  },
  header: {
    height: '25%',
    backgroundColor: '#beacde',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '80%',
    height: '100%',
  },
  body: {
    flex: 1,
    margin: '10%',
    backgroundColor: '#f3f3f3',
    borderRadius: 30,
    padding: '5%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    
  },
  button: {
    backgroundColor: '#FFBE31',
    paddingVertical: '5%',
    paddingHorizontal: '10%',
    borderRadius: 20,
    marginTop: '2%',
    marginBottom:'5%',
    width: '90%',
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
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'PoppinsRegular',
  },
  title: {
    textAlign:'center',
    fontSize: 25,
    marginBottom: 30,
    fontFamily: 'PoppinsRegular',
  },
  footer: {
    backgroundColor: '#beacde',
    alignItems: 'center',
    justifyContent: 'center',
    height: '8%',
  },
});
