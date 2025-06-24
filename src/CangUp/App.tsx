import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './pages/Login';
import TipoCadastro from './pages/TipoCadastro';
import CadastroAluno from './pages/CadastroAluno';
import PerfilInstituicao from './pages/PerfilInstituicao';
import PerfilAluno from './pages/PerfilAluno';
import PerfilResponsavel from './pages/PerfilResponsavel';
import CadastroInstituicao from './pages/CadastroInstituicao';
import CadastroResponsavel from './pages/CadastroResponsavel';

const Stack = createNativeStackNavigator();

export default function App() {
  //Direciona a tela que será aberta  
  return <NavigationContainer>
    <Stack.Navigator initialRouteName='Login'>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TipoCadastro"
        component={TipoCadastro}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CadastroAluno"
        component={CadastroAluno}
        options={{ headerShown: false }} // MUDAR DIRECIONAMENTO
      />
      <Stack.Screen
        name="CadastroInstituicao"
        component={CadastroInstituicao}
        options={{ headerShown: false }} // MUDAR DIRECIONAMENTO
      />
      <Stack.Screen
        name="CadastroResponsavel"
        component={CadastroResponsavel}
        options={{ headerShown: false }} // MUDAR DIRECIONAMENTO
      />
      <Stack.Screen
        name="PerfilInstituicao"
        component={PerfilInstituicao}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PerfilAluno"
        component={PerfilAluno}
        options={{ headerShown: false }}
      /><Stack.Screen
        name="PerfilResponsavel"
        component={PerfilResponsavel}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </NavigationContainer>
}

// Fazer para o PerfilResponsavel depois
