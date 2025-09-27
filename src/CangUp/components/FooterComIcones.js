import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const FooterComIcones = () => {
  const {theme} = useTheme();
  return (
    <View style={theme == 'light' ? styles.footer : styles.footerDark}>
      <TouchableOpacity>
        <Ionicons name="person-circle-outline" size={35} color="#fff"/>
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="home-outline" size={30} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="time-outline" size={30} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Entypo name="menu" size={35} color="#fff" />
      </TouchableOpacity>
    </View>
  );
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