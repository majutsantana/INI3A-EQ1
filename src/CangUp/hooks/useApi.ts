function useApi(){
    // Para desenvolvimento local com Expo Go:
    // - Dispositivo físico Android/iOS: use o IP da sua máquina na rede local
    // Para produção, use: "https://eq1.ini3a.projetoscti.com.br"
    
    // DESENVOLVIMENTO - Expo Go (dispositivo físico):
    //return {url: "http://192.168.1.106:8000"}; // IP da sua máquina na rede local
    
    // PRODUÇÃO - Descomente a linha abaixo quando for usar o servidor (FileZilla):
    return {url: "https://eq1.ini3a.projetoscti.com.br"};
}
export default useApi;