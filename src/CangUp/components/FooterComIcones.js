import React, { use, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons} from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FooterComIcones = (props) => {
  const {theme} = useTheme();
  const [perfil, setPerfil] = React.useState('');

  async function getProfile(){
    setPerfil(await AsyncStorage.getItem('perfil'));
  }

  useEffect(() => {
    getProfile();
  }, []);

  let footer;

  switch(perfil){
    case 'inst':
      footer = (
        <>
          <TouchableOpacity onPress={() => props.nav.navigate(`PerfilInstituicao`)}>
            <Ionicons name="person-circle-outline" size={35} color="#fff"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => props.nav.navigate(`ListaUsuarios`)}>
            <Ionicons name="home-outline" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => props.nav.navigate(`HorariosInstituicao`)}>
            <Ionicons name="time-outline" size={30} color="#fff" />
          </TouchableOpacity>
        </>
      );
      break;
      case 'alun':
        footer = (
          <>
            <TouchableOpacity onPress={() => props.nav.navigate(`PerfilAluno`)}>
              <Ionicons name="person-circle-outline" size={35} color="#fff"/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => props.nav.navigate(`PerfilAluno`)}>
              <Ionicons name="home-outline" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => props.nav.navigate(`HorariosAlunoResponsavel`)}> 
              <Ionicons name="time-outline" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => props.nav.navigate(`PerfilAluno`)}> 
              <Ionicons name="car-outline" size={35} color="#fff" />
            </TouchableOpacity>
          </>);
      break;
      case 'resp':
        footer = (
          <>
             <TouchableOpacity onPress={() => props.nav.navigate(`PerfilResponsavel`)}>
              <Ionicons name="person-circle-outline" size={35} color="#fff"/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => props.nav.navigate(`PerfilAluno`)}>
              <Ionicons name="home-outline" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => props.nav.navigate(`HorariosAlunoResponsavel`)}> 
              <Ionicons name="time-outline" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => props.nav.navigate(`PerfilAluno`)}> 
              <Ionicons name="car-outline" size={35} color="#fff" />
            </TouchableOpacity>
          </>
        );
      break;

  }
  return (<View style={theme == 'light' ? styles.footer : styles.footerDark}>{footer}</View>);
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#BEACDE',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  footerDark: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#251541',
    paddingVertical: 12,
    position: 'absolute', 
    bottom: 0,
    width: '100%',
  },
});

export default FooterComIcones;