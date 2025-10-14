import {React} from 'react';
import { View, StyleSheet, TouchableOpacity} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Feather, FontAwesome } from '@expo/vector-icons';

const Header = () => {
 const {theme, toggleTheme} = useTheme();


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

