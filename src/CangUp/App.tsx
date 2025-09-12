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
import ListaUsuarios from './pages/funcionalidades/ListaUsuarios';
import CadastroVeiculo from './pages/cadastro/CadastroVeiculo';
import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext, AuthProvider } from './components/AuthContext';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
    <Stack.Screen name="TipoCadastro" component={TipoCadastro} options={{ headerShown: false }} />
    <Stack.Screen name="CadastroAluno" component={CadastroAluno} options={{ headerShown: false }} />
    <Stack.Screen name="CadastroInstituicao" component={CadastroInstituicao} options={{ headerShown: false }} />
    <Stack.Screen name="CadastroResponsavel" component={CadastroResponsavel} options={{ headerShown: false }} />
    <Stack.Screen name="RedefinirSenha" component={EsqueciSenha} options={{ title: 'Redefinir Senha' }} />
    <Stack.Screen name="EfetivacaoAluno" component={EfetivacaoAluno} options={{ headerShown: false }} />
    <Stack.Screen name="EfetivacaoResponsavel" component={EfetivacaoResponsavel} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const AppStack = () => {

  const { userProfile} = useContext(AuthContext);

  const getInitialRoute = () => {
    if (userProfile === "inst") return "ListaUsuarios";
    if (userProfile === "alun") return "PerfilAluno";
    if (userProfile === "resp") return "PerfilResponsavel";
  };

  return (
    <Stack.Navigator initialRouteName={getInitialRoute()}>
      <Stack.Screen name="PerfilInstituicao" component={PerfilInstituicao} options={{ headerShown: false }} />
      <Stack.Screen name="PerfilAluno" component={PerfilAluno} options={{ headerShown: false }} />
      <Stack.Screen name="PerfilResponsavel" component={PerfilResponsavel} options={{ headerShown: false }} />
      <Stack.Screen name="PreCadastroAluno" component={PreCadastroAluno} options={{ headerShown: false }} />
      <Stack.Screen name="PreCadastroResponsavel" component={PreCadastroResponsavel} options={{ headerShown: false }} />
      <Stack.Screen name="FuncionalidadesAlunoResponsavel" component={FuncionalidadesAlunoResponsavel} options={{ headerShown: false }} />
      <Stack.Screen name="CadastroVeiculo" component={CadastroVeiculo} options={{ headerShown: false }} />
      <Stack.Screen name="ListaUsuarios" component={ListaUsuarios} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#B9A6DA" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

// Fazer para o PerfilResponsavel depois