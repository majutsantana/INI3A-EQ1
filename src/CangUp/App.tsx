import {NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './pages/Login';
import OpUsuario from './pages/OpUsuario';
import CadastroAluno from './pages/CadastroAluno';
import PerfilInstituicao from './pages/PerfilInstituicao';
import PerfilAluno from './pages/PerfilAluno';

const Stack = createNativeStackNavigator();

export default function App() {
  //Direciona a tela que será aberta  
  return <NavigationContainer> 
      <Stack.Navigator initialRouteName='PerfilAluno'> 
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
            name="OpUsuario" 
            component={OpUsuario}
            options={{ headerShown: false }}
          />
        <Stack.Screen
          name="CadastroAluno"
          component={CadastroAluno}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PerfilAluno"
          component={PerfilAluno}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PerfilInstituicao"
          component={PerfilInstituicao}
          options={{ headerShown: false }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
}

// Fazer para o PerfilResponsavel depois
