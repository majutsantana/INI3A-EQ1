import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';

// 1. Criação do Contexto
const ThemeContext = createContext();

// 2. Criação do Provider
export const ThemeProvider = ({ children }) => {
  // Use o hook useColorScheme do React Native para obter o tema do sistema
  const systemTheme = useColorScheme();

  // Estado para armazenar o tema atual da aplicação (light ou dark)
  const [theme, setTheme] = useState(systemTheme || 'light');

  // useEffect para sincronizar o tema do app com o tema do sistema
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Atualiza o estado do tema sempre que o tema do sistema mudar
      setTheme(colorScheme || 'light');
    });

    // Limpeza da assinatura para evitar vazamento de memória
    return () => subscription.remove();
  }, []);

  // Função para alternar entre os temas
  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  // 3. O valor que será disponibilizado para os componentes filhos
  const value = {
    theme,
    toggleTheme,
    // Você pode adicionar mais dados, como cores baseadas no tema
    colors: theme === 'dark' ? {
      background: '#121212', //Fundo do preenchimento de informações (atualmente está um cinza bem escuro)
      text: '#FFFFFF',
      primary: '#BB86FC',
    } : {
      background: '#FFFFFF',
      text: '#000000',
      primary: '#6200EE',
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Criação de um hook customizado para facilitar o uso do contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};