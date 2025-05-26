import {NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './pages/Login';
import OpUsuario from './pages/OpUsuario';
import CadastroAluno from './pages/CadastroAluno';

const Stack = createNativeStackNavigator();

export default function App() {
  
  return <NavigationContainer>
      <Stack.Navigator>
        {/*<Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
            name="OpUsuario" 
            component={OpUsuario}
            options={{ headerShown: false }}
          />*/}
        <Stack.Screen
          name="CadastroAluno"
          component={CadastroAluno}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
}
