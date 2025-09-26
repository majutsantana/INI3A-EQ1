import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, SafeAreaView, Text, Appearance } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';


const Header = () => {
 const [visible, setVisible] = useState(false);
 const options = [
   {
     title: 'Mudar modo',
     icon: 'moon-o',
     action: () => alert('publicar'),
   }
 ];

 return (
   <View style={styles.header}>
      <View style={styles.popup}>
        <TouchableOpacity style={styles.option}>
          <FontAwesome name="moon-o" size={25} color="#000" />
        </TouchableOpacity>
      </View>
   </View>
 );
};




const styles = StyleSheet.create({
   header: {
     backgroundColor: '#B9A6DA',
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

