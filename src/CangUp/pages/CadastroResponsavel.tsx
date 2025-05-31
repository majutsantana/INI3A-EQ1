import React from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import styles from './style';

export default function App() {
  const handleTermsPress = () => {
    Alert.alert(
      'Termos de Uso',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#B9A6DA" barStyle="dark-content" />

      <View style={styles.header} />

      <View style={styles.content}>
        <View style={[styles.formContainer, { flex: 1 }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {[
              'Nome',
              'E-mail',
              'CPF',
              'Senha de acesso',
              'Telefone p/contato',
            ].map((label, index) => (
              <View key={index} style={styles.inputGroup}>
                <Text style={styles.label}>{label}:</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Digite o ${label.toLowerCase()}`}
                  placeholderTextColor="#888"
                  secureTextEntry={label === 'Senha de acesso'}
                />
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={handleTermsPress}
            style={[styles.input, { marginTop: 16, marginBottom: 12 }]}
          >
            <Text style={{ textAlign: 'center', color: '#333', fontSize: 14 }}>
              Li e estou de acordo com os termos de uso e de segurança
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer} />
    </SafeAreaView>
  );
}