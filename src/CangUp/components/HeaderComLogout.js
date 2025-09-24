import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AuthContext } from './AuthContext';

const HeaderComLogout = () => {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    if (window.confirm("Você deseja mesmo sair?")) { //nao funciona em mobile
      logout();
    }
  };

  const handleModeChange = () => {
    alert('Mudar modo');
  };

  return (
    <View style={styles.header}>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={handleModeChange}>
          <FontAwesome name="moon-o" size={25} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleLogout}>
          <Icon name="logout" size={25} color="#000" />
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
    paddingRight: '5%',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HeaderComLogout;