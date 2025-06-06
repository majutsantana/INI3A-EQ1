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
import { CheckBox } from 'react-native-elements';


export default function CadastroAluno({navigation}) { //Não é erro, é só o vscode dando trabalho
 const [fontsLoaded, setFontsLoaded] = useState(false);
 const [nome, setNome] = useState('');
 const [cpf, setCpf] = useState('');
 const [email, setEmail] = useState('');
 const [senha, setSenha] = useState('');
 const [confSenha, setconfSenha] = useState('');
 const [sexo, setSexo] = useState(''); 
 const [check, setCheck] = useState(false);


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

 const getDados = async () => {
  try{
    const response = await fetch('http://localhost:8000/api/cadastrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({nome, cpf, email, senha, confSenha, sexo, check }),
    });
     const dados = await response.json();
  } catch(error){
    console.error('Erro ao cadastrar aluno:', error);
  }
 };


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
              <Text style={styles.label}>Senha:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite a sua senha"
                placeholderTextColor="#888"
                value={senha}
                onChangeText={setSenha}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Redigite a senha:</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirme a sua senha"
                placeholderTextColor="#888"
                value={confSenha}
                onChangeText={setconfSenha}
              />
            </View>
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

           <View style={styles.check}>
              <CheckBox
              checked={check}
              onPress={() => setCheck(!check)}/> 
              <TouchableOpacity> {/*Direcionar para os termos de uso*/}
                <Text style={styles.textCheck}>Termos de uso</Text>
              </TouchableOpacity>
              
           </View>
         </ScrollView>
       </View>


       <TouchableOpacity style={styles.button}
         onPress= {() => {getDados(); navigation.navigate('Login');}}>
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
 },
 check:{
  display: 'flex',
  flexDirection:'row',
  alignItems:'center',
  justifyContent:'flex-start',
 },
 CheckBox:{
  padding:-10,
 },
 textCheck:{
  fontSize: 14,
  fontFamily: 'PoppinsRegular',
  color: '#522a91', 
 }
});
