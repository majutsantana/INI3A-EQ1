import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image,  ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons'; // retirar a opção instituição pro usuário
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import Header from '../../components/Header';
import FooterSemIcones from '../../components/FooterSemIcones';
import { useTheme } from '../../context/ThemeContext';

export default function TipoCadastro({navigation}) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      'PoppinsRegular': require('../../assets/fonts/PoppinsRegular.ttf'),
      'PoppinsBold': require('../../assets/fonts/PoppinsBold.ttf'),
    });
    setFontsLoaded(true);
  };
  const {theme} = useTheme();

  const global = 
  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header/>

      <View style={theme == "ligth" ? styles.body : styles.bodyDark}>
        <View style={theme == "light" ? styles.seta : styles.setaDark}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={theme == "light" ? styles.backButton : styles.backButtonDark}>
            <MaterialIcons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={theme == "light" ? styles.opcoes : styles.opcoesDark}>
          <Text style={theme == "ligth" ? styles.title : styles.titleDark}>Selecione o tipo de usuário:</Text>

          <TouchableOpacity style={theme == "light" ? styles.button : styles.buttonDark} onPress={() => navigation.navigate('EfetivacaoAluno')}>
            <Text style={theme == "light" ? styles.buttonText : styles.buttonTextDark}>Aluno</Text>
          </TouchableOpacity>

          <TouchableOpacity style={theme == "light" ? styles.button : styles.buttonDark} onPress={() => navigation.navigate('EfetivacaoResponsavel')}>
            <Text style={theme == "light" ? styles.buttonText : styles.buttonTextDark}>Responsável</Text>
          </TouchableOpacity>
        </View>
        
      </View>
      <FooterSemIcones/> 
    </View>
  );
}

const styles = StyleSheet.create({
  opcoes:{
    justifyContent:'center',
    alignItems:'center',
    height:'85%',
  },
  opcoesDark:{
    justifyContent:'center',
    alignItems:'center',
    height:'85%',
  },
  seta:{
    height:'15%',
  },
  setaDark:{
    height:'15%',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFD992',
  },
  image: {
    width: '80%',
    height: '100%',
  },
  body: {
    flex: 1,
    marginHorizontal: '10%',
    marginVertical: '30%',
    backgroundColor: '#f3f3f3',
    borderRadius: 30,
    padding: '5%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 1,
  },
  bodyDark: {
    flex: 1,
    marginHorizontal: '10%',
    marginVertical: '30%',
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
  backButtonDark: {
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
  buttonDark: {
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
  buttonTextDark: {
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
  titleDark: {
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
