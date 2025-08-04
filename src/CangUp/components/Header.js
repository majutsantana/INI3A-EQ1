import React from 'react';
import { View, StyleSheet, TouchableOpacity} from 'react-native';
import { Entypo } from '@expo/vector-icons';

const Header = () => {
  return (
    <View style={styles.header}>
      <TouchableOpacity> 
        <Entypo name="menu" size={35} color="#fff" />
      </TouchableOpacity>
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
});


export default Header;