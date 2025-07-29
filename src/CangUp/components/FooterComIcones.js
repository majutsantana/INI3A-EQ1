import React from 'react';
import { View, StyleSheet } from 'react-native';


const FooterComIcones = () => {
  return (
    <View style={styles.footer}>
        <TouchableOpacity>
            <Ionicons name="person-circle-outline" size={35} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
            <Ionicons name="home-outline" size={30} color="#fff" />
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
});


export default FooterComIcones;