import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';

/**
 * Componente principal da tela de efetivação do aluno.
 * Ele gerencia o estado dos campos de formulário e a lógica do botão.
 */
const EfetivacaoAluno = () => {
  // Hooks de Estado para gerenciar os valores dos inputs
  // useState('') inicializa cada campo com uma string vazia.
  const [instituicao, setInstituicao] = useState('');
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [cpf, setCpf] = useState('');

  const handleProseguir = () => {
    // Exemplo: Imprime os dados no console.
    console.log('Dados submetidos:', { instituicao, nome, matricula, cpf });
    
  };

  // Renderização da Interface do Usuário 
  return (
    // SafeAreaView garante que o conteúdo não seja sobreposto pela barra de status, etc.
    <SafeAreaView style={styles.container}>
      {/* StatusBar configura o estilo da barra de status (ex: cor dos ícones) */}
      <StatusBar barStyle="dark-content" />
      
      {/* View para a faixa superior roxa da tela*/}
      <View style={styles.header} />

      {/* View que atua como o container principal do formulário, 
          centralizando os campos de input */}
      <View style={styles.formContainer}>
        
        {/* Cada View `inputGroup` agrupa um TextInput com espaçamento inferior */}
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Instituição:"
            value={instituicao}
            onChangeText={setInstituicao} // Atualiza o estado 'instituicao' a cada digitação
          />
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Nome:"
            value={nome}
            onChangeText={setNome} // Atualiza o estado 'nome'
          />
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Ra/nº da matrícula:"
            value={matricula}
            onChangeText={setMatricula} // Atualiza o estado 'matricula'
            keyboardType="numeric" // Exibe o teclado numérico para este campo
          />
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="CPF:"
            value={cpf}
            onChangeText={setCpf} // Atualiza o estado 'cpf'
            keyboardType="numeric" // Exibe o teclado numérico para este campo
          />
        </View>
      </View>

      {/* View para a área do rodapé onde o botão está localizado */}
      <View style={styles.footer}>
        {/* TouchableOpacity cria um botão com feedback de toque (opacidade) */}
        <TouchableOpacity style={styles.button} onPress={handleProseguir}>
          {/* Text para o rótulo do botão */}
          <Text style={styles.buttonText}>Prosseguir</Text>
        </TouchableOpacity>
      </View>
      {/* Adicionando a nova faixa roxa no final */}
      <View style={styles.footerBand} />
    </SafeAreaView>
  );
};

// Objeto de Estilos usando StyleSheet para otimização
const styles = StyleSheet.create({
  // Estilos para o container principal da tela
  container: {
    flex: 1, // Ocupa todo o espaço disponível
    backgroundColor: '#FFD992', // Cor de fundo amarela/creme principal
  },
  // Estilos para a faixa superior
  header: {
    backgroundColor: '#BEACDE', // Cor da faixa superior (roxa)
    height: 60,
    width: '100%',
  },
  // Estilos para o container do formulário
  formContainer: {
    flex: 1, // Ocupa o restante do espaço entre o header e o footer
    padding: 20,
    justifyContent: 'center', // Centraliza o conteúdo verticalmente
  },
  // Estilos para cada grupo de input
  inputGroup: {
    marginBottom: 20, // Espaçamento entre os campos de input
  },
  // Estilos para os componentes TextInput
  input: {
    backgroundColor: '#FFFFFF', // Fundo branco
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    // Propriedades de sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Propriedade de sombra para Android
    elevation: 3,
  },
  // Estilos para o rodapé
  footer: {
    backgroundColor: '#FFD992', //cor de fundo atrás do botão (bege, mesma da principal)
    padding: 20,
    alignItems: 'center', // Centraliza o botão horizontalmente
  },
  // Estilos para o botão
  button: {
    backgroundColor: '#FFCC66', // Cor do botão (laranja)
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '80%', // Ocupa 80% da largura do container
    alignItems: 'center',
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Sombra para Android
    elevation: 5,
  },
  // Estilos para o texto do botão
  buttonText: {
    color: '#black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilo para a nova faixa roxa no rodapé
  footerBand: {
    backgroundColor: '#BEACDE', // Cor roxa
    height: 40, // Altura da faixa
    width: '100%',
  },
});

// Exporta o componente para que ele possa ser importado em outros arquivos
export default EfetivacaoAluno;