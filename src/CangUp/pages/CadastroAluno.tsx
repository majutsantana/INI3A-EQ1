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

<<<<<<< HEAD
export default function CadastroAluno({navigation}) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [ra, setRa] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [sexo, setSexo] = useState('');
  const [instituicao, setInstituicao] = useState('');

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

  async function getDados(){
    try{
      const r = await fetch("http://localhost:8000/cadastrar", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, ra, email, endereco, sexo, instituicao }),
      });

      const dados = await r.json();

      if (r.ok) {
        setNome('');
        setRa('');
        setEmail('');
        setEndereco('');
        setSexo('');
        setInstituicao('');
      }
    } catch (error) {
      console.error('Erro na requisição: ', error);
    }
  }

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
=======
import styles from './style';
>>>>>>> 56e2873a0a9dd6868cd0db4d7811ab806a0fa521

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#B9A6DA" barStyle="dark-content" />

      <View style={styles.header} />

      <View style={styles.content}>
        <View style={styles.formContainer}>
<<<<<<< HEAD
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
=======
>>>>>>> 56e2873a0a9dd6868cd0db4d7811ab806a0fa521
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
<<<<<<< HEAD
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o nome"
                placeholderTextColor="#888"
                value={nome}
                onChangeText={setNome}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o CPF"
                placeholderTextColor="#888"
                value={cpf}
                onChangeText={setCpf}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>RA:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o RA"
                placeholderTextColor="#888"
                value={ra}
                onChangeText={setRa}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Endereço:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o endereço"
                placeholderTextColor="#888"
                value={endereco}
                onChangeText={setEndereco}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sexo:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={sexo}
                  onValueChange={setSexo}
                  style={[
                    styles.picker,
                    { color: sexo === '' ? '#888' : '#000' }
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instituição:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={instituicao}
                  onValueChange={setInstituicao}
                  style={[
                    styles.picker,
                    { color: instituicao === '' ? '#888' : '#000' }
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

        <TouchableOpacity style={styles.button} onPress={getDados}>
=======
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
>>>>>>> 56e2873a0a9dd6868cd0db4d7811ab806a0fa521
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </SafeAreaView>
  );
<<<<<<< HEAD
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFD88D',
  },
  header: {
    backgroundColor: '#B9A6DA',
    height: '10%',
  },
  footer: {
    backgroundColor: '#B9A6DA',
    height: '8%',
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
    paddingTop: '10%',
    paddingBottom: '10%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    padding: '5%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: '2%',
    margin: '5%',
  },
  inputGroup: {
    padding:'1%',
    marginBottom:'2%',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: '2%',
    fontFamily: 'PoppinsRegular',
  },
  input: {
    backgroundColor: '#d9d9d9',
    borderRadius: 25,
    paddingHorizontal: '5%',
    paddingVertical: '5%',
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  pickerWrapper: {
    alignItems: 'center',
    justifyContent:'center',
    paddingHorizontal: '5%',
    paddingVertical: '5%',
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#d9d9d9',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  picker: {
    width:'100%',
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    backgroundColor: '#d9d9d9',
    borderWidth:0,
  },
  button: {
    backgroundColor: '#FFBE31',
    paddingVertical: '5%',
    width:'60%',
    borderRadius: 20,
    alignItems: 'center',
    marginTop: '10%',
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
    fontFamily: 'PoppinsRegular',
  },
  seta:{
    height:'15%',
  },
  backButton: {
    alignSelf: 'flex-start',
  }
});
 
=======
}
>>>>>>> 56e2873a0a9dd6868cd0db4d7811ab806a0fa521
