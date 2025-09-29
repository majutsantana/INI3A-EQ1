import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { AuthContext } from './AuthContext';
import { useTheme } from '../context/ThemeContext';

const HeaderComLogout = () => {
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    if (window.confirm("Você deseja mesmo sair?")) { //nao funciona em mobile
      logout();
    }
  }
  return (
    <View style={theme === "light" ? styles.header : styles.headerDark}>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 20 }}> 
          {theme === 'light' ? (
            <Feather name="sun" size={28} color='#000'/>
          ) : (
            <FontAwesome name="moon-o" size={28} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Icon name="logout" size={28} color={theme === "light" ? "#000" : "white"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#B9A6DA',
    height: '10%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  headerDark: {
    backgroundColor: '#251541',
    height: '10%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HeaderComLogout;
