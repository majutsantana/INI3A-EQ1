import React from 'react';
import { 
    SafeAreaView, 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity,
    Alert
} from 'react-native';
import { Icon } from 'react-native-elements';

const PaginaInstituicao = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                
                <View style={styles.header} />

                
                <View style={styles.profileSection}>
                    
                    <View style={styles.profileTop}>
                        <Text style={styles.institutionName}>Nome da Instituicao</Text>
                        <View style={styles.profilePic}>
                            <Text>Foto de Perfil</Text>
                        </View>
                        <TouchableOpacity style={styles.editBtn} onPress={() => {
                            Alert.alert("Funcao de edicao ainda sera implementada.");
                        }}>
                            <Text>Editar perfil</Text>
                        </TouchableOpacity>
                    </View>

                    
                    <View style={styles.formFields}>
                        <TextInput 
                            placeholder="Nome da Instituicao:" 
                            style={styles.input}
                        />
                        <TextInput 
                            placeholder="Endereco:" 
                            style={styles.input}
                        />
                        <TextInput 
                            placeholder="Horarios de Funcionamento:" 
                            style={styles.input}
                        />
                        <TextInput 
                            placeholder="Telefone para Contato:" 
                            style={styles.input}
                        />
                        
                        <TouchableOpacity style={[styles.mainBtn, { backgroundColor: '#fff' }]}>
                            <Text>Cadastro de responsaveis</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[styles.mainBtn, { backgroundColor: '#fff' }]}>
                            <Text>Cadastro de alunos interessados</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                
                <View style={styles.footer}>
    <TouchableOpacity>
        <Icon 
            name="perm_identity" 
            type="material" 
            color="#800080" // roxo
        />
    </TouchableOpacity>
    
    <TouchableOpacity>
        <Icon 
            name="home" 
            type="material" 
            color="#800080" // roxo
        />
    </TouchableOpacity>
    
    <TouchableOpacity>
        <Icon 
            name="list" 
            type="material" 
            color="#800080" // roxo
        />
    </TouchableOpacity>
</View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fefefe',
    },
    container: {
        flex: 1,
    },
    header: {
        height: 60,
        backgroundColor: '#c9aee3',
    },
    profileSection: {
        flex: 1,
        paddingTop: 0,
        backgroundColor: '#fcd28d',
        borderColor: '#ccc',
    },
    profileTop: {
        backgroundColor: '#fcb933',
        padding: 10,
        width: '100%',
        alignItems: 'center',
    },
    institutionName: {
        fontSize: 12,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    profilePic: {
        width: 125,
        height: 125,
        backgroundColor: '#d9d9d9',
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 12,
        color: '#555',
    },
    editBtn: {
        marginTop: 10,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#fcb933',
        borderRadius: 10,
        alignItems: 'center',
    },
    formFields: {
        flex: 1,
        marginTop: 20,
        padding: 10,
        gap: 10,
    },
    input: {
        padding: 8,
        fontSize: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    mainBtn: {
        padding: 10,
        fontSize: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        backgroundColor: '#c9aee3',
        paddingVertical: 8,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    footerBtn: {
        fontSize: 20,
        color: '#333',
    },
    activeFooterBtn: {
        color: '#fff',
    }
});

export default PaginaInstituicao;