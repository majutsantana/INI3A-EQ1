import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './pages/Login';
import EsqueciSenha from './pages/EsqueciSenha';
import TipoCadastro from './pages/cadastro/TipoCadastro';
import CadastroAluno from './pages/cadastro/CadastroAluno';
import PerfilInstituicao from './pages/perfil/PerfilInstituicao';
import PerfilAluno from './pages/perfil/PerfilAluno';
import PerfilResponsavel from './pages/perfil/PerfilResponsavel';
import PreCadastroAluno from './pages/preCadastro/PreCadastroAluno';
import PreCadastroResponsavel from './pages/preCadastro/PreCadastroResponsavel';
import CadastroInstituicao from './pages/cadastro/CadastroInstituicao';
import CadastroResponsavel from './pages/cadastro/CadastroResponsavel';
import EfetivacaoAluno from './pages/efetivacao/EfetivacaoAluno';
import EfetivacaoResponsavel from './pages/efetivacao/EfetivacaoResponsavel';
import FuncionalidadesAlunoResponsavel from './pages/funcionalidades/FuncionalidadesAlunoResponsavel';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CadastroVeiculo from './pages/cadastro/CadastroVeiculo';

const Stack = createNativeStackNavigator();

export default function App() {
  /*
  const [initialRoute, setInititalRoute] = useState("Login");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt");
        const perfil = await AsyncStorage.getItem("perfil");

        if (token && perfil) {
          if (perfil == "inst")
            setInititalRoute("PerfilInstituicao");
          else if (perfil == "alun")
            setInititalRoute("PerfilAluno");
          else if (perfil == "resp")
            setInititalRoute("PerfilResponsavel");
        }
      } catch (e) {
        console.error("Erro ao verificar autenticação: ", e);
        setInititalRoute("Login");
      } finally {
        setCarregando(false);
      }
    };
    checkAuth();
  }, []); 
  */

  //if (!carregando)
    return <NavigationContainer>
      <Stack.Navigator initialRouteName='CadastroVeiculo' /* initialRoute */> 
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
          name="PreCadastroAluno"
          component={PreCadastroAluno}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="PreCadastroResponsavel"
          component={PreCadastroResponsavel}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="CadastroAluno"
          component={CadastroAluno}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="CadastroInstituicao"
          component={CadastroInstituicao}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="CadastroResponsavel"
          component={CadastroResponsavel}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="CadastroVeiculo"
          component={CadastroVeiculo}
          options={{ headerShown: false }} 
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
        />
        <Stack.Screen
          name="PerfilResponsavel"
          component={PerfilResponsavel}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EfetivacaoAluno"
          component={EfetivacaoAluno}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EfetivacaoResponsavel"
          component={EfetivacaoResponsavel}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FuncionalidadesAlunoResponsavel"
          component={FuncionalidadesAlunoResponsavel}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="RedefinirSenha"
          component={EsqueciSenha}
          options={{ title: 'Redefinir Senha' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
}

// Fazer para o PerfilResponsavel depois
