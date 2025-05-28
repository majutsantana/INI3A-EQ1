import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function CadastroAluno() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [sexo, setSexo] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const navigation = useNavigation();

  const loadFonts = async () => {
    await Font.loadAsync({
      'PoppinsRegular': require('../assets/fonts/PoppinsRegular.ttf'),
      'PoppinsBold': require('../assets/fonts/PoppinsBold.ttf'),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#B9A6DA" barStyle="dark-content" />
      <View style={styles.header} />

      <View style={styles.content}>
        <View style={styles.formContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {['Nome', 'CPF', 'RA', 'Email', 'Endereço'].map((label, index) => (
              <View key={index} style={styles.inputGroup}>
                <Text style={styles.label}>{label}:</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Digite o ${label.toLowerCase()}`}
                  placeholderTextColor="#888"
                />
              </View>
            ))}

            {/* Picker de Sexo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sexo:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={sexo}
                  onValueChange={(itemValue) => setSexo(itemValue)}
                  style={[
                    styles.picker,
                    { color: sexo === '' ? '#888' : '#000' } // preto para placeholder, cinza para os demais
                  ]}
                >
                  <Picker.Item label="Selecione o sexo" value="" />
                  <Picker.Item label="Masculino" value="Masculino" />
                  <Picker.Item label="Feminino" value="Feminino" />
                  <Picker.Item label="Neutro" value="Neutro" />
                  <Picker.Item label="Prefiro não informar" value="Prefiro não informar" />
                </Picker>
              </View>
            </View>

            {/* Picker de Instituição */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instituição:</Text>
              <View style={styles.pickerWrapper}>
                  <Picker
                  selectedValue={instituicao}
                  onValueChange={(itemValue) => setInstituicao(itemValue)}
                  style={[
                    styles.picker,
                    { color: instituicao === '' ? '#888' : '#000' } // preto para placeholder, cinza para os demais
                  ]}
                >
                  <Picker.Item label="Selecione a instituição" value="" />
                  <Picker.Item label="Instituto Federal" value="IF" />
                  <Picker.Item label="Universidade Estadual" value="UE" />
                  <Picker.Item label="Universidade Federal" value="UF" />
                </Picker>
              </View>
            </View>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  footer: {
    backgroundColor: '#B9A6DA',
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    padding: 20,
    flex: 1,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 1,
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
    fontFamily: 'PoppinsRegular',
  },
  input: {
    backgroundColor: '#d9d9d9',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
  },
  pickerWrapper: {
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#EDEDED',
  },
  picker: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 0,
    backgroundColor: '#d9d9d9',
  },
  button: {
    backgroundColor: '#FFC222',
    paddingVertical: 15,
    borderRadius: 40,
    alignItems: 'center',
    width: '80%',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },
  seta:{
    height:'15%',
  },
  backButton: {
    alignSelf: 'flex-start',
  }
});
