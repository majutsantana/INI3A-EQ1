import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from './AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Feather, FontAwesome} from '@expo/vector-icons';

const HeaderComLogout = () => {
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Você deseja mesmo sair da sua conta?", 
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Sair", 
          onPress: () => logout(), 
          style: 'destructive'
        }
      ]
    );
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
          <Feather name="log-out" size={28} color={theme === "light" ? "#000" : "white"} />
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
