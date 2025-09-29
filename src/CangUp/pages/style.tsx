import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Importe o hook useTheme

const styles = () => {
  const { theme, colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#FFD992' : '#4F2E89', // Cor de fundo principal
    },
    header: {
      height: '25%',
      backgroundColor: theme === 'light' ? '#BEACDE' : '#251541', // Cor do cabeçalho
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
      margin: '10%',
      backgroundColor: theme === 'light' ? '#F3F3F3' : '#313233',
      borderRadius: 30,
      paddingVertical: '8%', 
      paddingHorizontal: '5%',
      justifyContent: 'space-around', 
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 4.65,
      elevation: 1,
    },
    title: {
      fontSize: 20,
      fontFamily: 'PoppinsBold',
      color: theme === 'light' ? '#000' : '#EEEEEE',
    },
    input: {
      backgroundColor: theme === 'light' ? '#d9d9d9' : '#B9B9B9',
      color: '#202020ff',
      width: '90%',
      padding: '5%',
      borderRadius: 30,
      paddingLeft: '5%',
      fontFamily: 'PoppinsRegular',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#d9d9d9' : '#B9B9B9',
      width: '90%',
      borderRadius: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    passwordInput: {
      flex: 1,
      padding: '5%',
      paddingLeft: '5%',
      fontFamily: 'PoppinsRegular',
      color: '#202020ff',
    },
    eyeIcon: {
      paddingRight: '5%',
      color: colors.text,
    },
    button: {
      backgroundColor: theme === 'light' ? '#FFBE31' : '#E8A326',
      paddingVertical: '5%',
      paddingHorizontal: '10%',
      width: '60%',
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    buttonText: {
      color: '#000',
      fontSize: 18,
      textAlign: 'center',
      fontFamily: 'PoppinsRegular',
    },
    linkText: {
      color: theme === 'light' ? '#522a91' : '#BB86FC',
      fontFamily: 'PoppinsBold',
      textAlign: 'center',
    },
    registerText: {
      textAlign: 'center',
      fontFamily: 'PoppinsRegular',
      display: 'flex',
      alignItems: 'center',
      color: colors.text,
    },
    footer: {
      height: '8%',
      backgroundColor: theme === 'light' ? '#BEACDE' : '#251541',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5%',
    },
    image: {
      width: '80%',
      height: '100%',
    },
    inputgroup: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: '5%',
    },
    iconButton: {
      padding: 5,
      fontFamily: 'PoppinsRegular',
      flexDirection: 'row',
      columnGap: 10,
      fontSize: 14,
      alignItems: 'center',
      color: colors.text,
    },
    picker: {
      width: '100%',
      fontSize: 16,
      fontFamily: 'PoppinsRegular',
      backgroundColor: theme === 'light' ? '#d9d9d9' : '#B9B9B9',
      borderWidth: 0,
      color: '#202020ff', 
    },
    pickerWrapper: {
      paddingHorizontal: '6.6%',
      paddingVertical: '4.2%',
      borderRadius: 25,
      overflow: 'hidden',
      backgroundColor: theme === 'light' ? '#d9d9d9' : '#B9B9B9',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    text: {
      fontSize: 20,
      marginBottom: 20,
      color: '#202020ff',
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: '1%',
    },
    olivia:{
      flexDirection: 'row',
      marginBottom: '5%',
    }
  });
};

export default styles;