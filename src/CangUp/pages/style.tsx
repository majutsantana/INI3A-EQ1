import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Importe o hook useTheme

const styles = () => {
  // Use o hook para acessar o tema e as cores
  const { theme, colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#FFD992' : '#522a91', // Cor de fundo principal
    },
    header: {
      height: '25%',
      backgroundColor: theme === 'light' ? '#BEACDE' : '#BEACDE', // Cor do cabeçalho
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
      margin: '10%',
      backgroundColor: colors.background,
      borderRadius: 30,
      padding: '5%',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.text,
      shadowOffset: { width: 2, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 4.65,
      elevation: 1,
    },
    title: {
      fontSize: 20,
      fontFamily: 'PoppinsBold',
      color: colors.text,
    },
    input: {
      backgroundColor: theme === 'light' ? '#d9d9d9' : '#555555',
      color: colors.text,
      width: '90%',
      padding: '5%',
      borderRadius: 30,
      marginTop: '10%',
      paddingLeft: '5%',
      fontFamily: 'PoppinsRegular',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#d9d9d9' : '#555555',
      width: '90%',
      borderRadius: 30,
      marginTop: '10%',
      shadowColor: colors.text,
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
      color: colors.text,
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
      marginTop: '10%',
      marginBottom: '10%',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    buttonText: {
      color: colors.text,
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
      backgroundColor: theme === 'light' ? '#BEACDE' : '#522a91',
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
      backgroundColor: theme === 'light' ? '#d9d9d9' : '#555555',
      borderWidth: 0,
      color: colors.text,
    },
    pickerWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: '5%',
      paddingVertical: '5%',
      borderRadius: 25,
      overflow: 'hidden',
      backgroundColor: theme === 'light' ? '#d9d9d9' : '#555555',
      shadowColor: colors.text,
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
      color: colors.text,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
    },
  });
};

export default styles;