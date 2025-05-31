import React from 'react';
import {
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
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#B9A6DA" barStyle="dark-content" />

      <View style={styles.header} />

      <View style={styles.content}>
        <View style={styles.formContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {['Nome', 'CPF', 'Sexo', 'RA', 'Email', 'Instituição', 'Endereço'].map(
              (label, index) => (
                <View key={index} style={styles.inputGroup}>
                  <Text style={styles.label}>{label}:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`Digite o ${label.toLowerCase()}`}
                    placeholderTextColor="#888"
                  />
                </View>
              )
            )}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </SafeAreaView>
  );
}