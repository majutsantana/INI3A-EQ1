import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, SafeAreaView, Text, Appearance } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


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
     <TouchableOpacity onPress={() => setVisible(true)}>
       <Icon name="plus-circle-outline" size={26} color={'#212121'} />
     </TouchableOpacity>
     <Modal transparent visible={visible}>
       <SafeAreaView
         style={{ flex: 1}}
         onTouchStart={() => setVisible(false)}>
         <View style={styles.popup}>
           {options.map((op, i) => (
             <TouchableOpacity style={styles.option} key={i} onPress={() => op.action}>
               <Text>{op.title}</Text>
               <FontAwesome name={op.icon} size={22} color={'#212121'} style={{marginLeft: 10,}} />
             </TouchableOpacity>
           ))}
         </View>
       </SafeAreaView>
     </Modal>
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
   popup: {
     borderRadius: 8,
     borderColor: '#333',
     borderWidth: 1,
     backgroundColor: '#fff',
     paddingHorizontal: 10,
     position: 'absolute',
     top: 76,
     right: 20,
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

