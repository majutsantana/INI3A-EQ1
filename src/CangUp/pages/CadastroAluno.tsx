import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFD88D',
  },
  header: {
    backgroundColor: '#B9A6DA',
    height: 90,
  },
  footer: {
    backgroundColor: '#B9A6DA',
    height: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  formContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    padding: 20,
    flex: 1,
    marginBottom: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#EDEDED',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FFC222',
    paddingVertical: 15,
    borderRadius: 40,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});