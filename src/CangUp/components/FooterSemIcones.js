import React from 'react';
import { View } from 'react-native';
import getStyles from '../pages/style';
import { useTheme } from '../context/ThemeContext';

const FooterSemIcones = () => {
  const { theme, colors } = useTheme(); 
  const styles = getStyles(theme, colors); 

  return (
    <View style={styles.footer}/>
  );
};

export default FooterSemIcones;