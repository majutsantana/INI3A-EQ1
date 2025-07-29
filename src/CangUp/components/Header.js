import React from 'react';
import { View, StyleSheet} from 'react-native';


const Header = () => {
  return (
    <View style={styles.header}/>
  );
};


const styles = StyleSheet.create({
    header: {
        backgroundColor: '#B9A6DA',
        height: '10%',
    },
});


export default Header;