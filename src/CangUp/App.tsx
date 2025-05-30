import {NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './pages/Login';
import TipoCadastro from './pages/TipoCadastro';
import CadastroAluno from './pages/CadastroAluno';
import PerfilInstituicao from './pages/PerfilInstituicao';

const Stack = createNativeStackNavigator();

export default function App() {
  
  return <NavigationContainer>
      <Stack.Navigator>
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
          name="PerfilInstituicao"
          component={PerfilInstituicao}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
}
