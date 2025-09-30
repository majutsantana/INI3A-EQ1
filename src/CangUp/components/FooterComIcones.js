import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons} from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const FooterComIcones = () => {
  const {theme} = useTheme();

  let perfil = localStorage.getItem('perfil');
  let footer;

  switch(perfil){
    case 'inst':
      footer = (
        <>
          <TouchableOpacity onPress={() => navigation.navigate(`PerfilInstituicao`)}>
            <Ionicons name="person-circle-outline" size={35} color="#fff"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate(`ListaUsuarios`)}>
            <Ionicons name="home-outline" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate(`FuncionalidadesInsituicao`)}>
            <Ionicons name="time-outline" size={30} color="#fff" />
          </TouchableOpacity>
        </>
      );
      break;
      case 'alun':
        footer = (
          <>
            <TouchableOpacity onPress={() => navigation.navigate(`PerfilAluno`)}>
              <Ionicons name="person-circle-outline" size={35} color="#fff"/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate(`PerfilAluno`)}>
              <Ionicons name="home-outline" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate(`FuncionalidadesAlunoResponsavel`)}> 
              <Ionicons name="time-outline" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate(`PerfilAluno`)}> 
              <Ionicons name="car-outline" size={35} color="#fff" />
            </TouchableOpacity>
          </>);
      break;
      case 'resp':
        footer = (
          <>
             <TouchableOpacity onPress={() => navigation.navigate(`PerfilResponsavel`)}>
              <Ionicons name="person-circle-outline" size={35} color="#fff"/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate(`PerfilAluno`)}>
              <Ionicons name="home-outline" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate(`FuncionalidadesAlunoResponsavel`)}> 
              <Ionicons name="time-outline" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate(`PerfilAluno`)}> 
              <Ionicons name="car-outline" size={35} color="#fff" />
            </TouchableOpacity>
          </>
        );
      break;

  }
  return (<View style={theme == 'light' ? styles.footer : styles.footerDark}> {footer} </View>);
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#BEACDE',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 0,
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