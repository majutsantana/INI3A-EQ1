import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, SafeAreaView, Text, Appearance } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';


const Header = () => {
 const [visible, setVisible] = useState(false);
 const {theme, toggleTheme} = useTheme();
 const options = [
   {
     title: 'Mudar modo',
     icon: 'moon-o',
     action: () => alert('publicar'),
   }
 ];

 return (
   <View style={theme == "light" ? styles.header : styles.headerDark}>
      <View style={styles.popup}> 
      <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 20 }}> 
          {theme === 'light' ? (
            <Feather name="sun" size={28} color='#000'/>
          ) : (
            <FontAwesome name="moon-o" size={28} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
   </View>
 );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#beacde',
    height: '10%',
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: '5%',
  },
  headerDark: {
    backgroundColor: '#251541',
    height: '10%',
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: '5%',
  },
   option: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingVertical: 7,
     borderBottomColor: '#ccc',
   },
});


export default Header;

