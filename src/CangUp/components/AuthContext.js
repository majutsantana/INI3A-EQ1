import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = async (token, perfil) => {
        setIsLoading(true);
        setUserToken(token);
        setUserProfile(perfil);
        await AsyncStorage.setItem('jwt', token);
        await AsyncStorage.setItem('perfil', perfil);
        setIsLoading(false);
    };

    const logout = async () => {
        console.log("Função de logout no AuthContext foi chamada!");
        setIsLoading(true);
        setUserToken(null);
        setUserProfile(null);
        await AsyncStorage.removeItem('jwt');
        await AsyncStorage.removeItem('perfil');
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('jwt');
            const perfil = await AsyncStorage.getItem('perfil');

            if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
                const response = await fetch(url + "/api/usuario", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/json"
                    }
                });

                if (response.ok) {
                    setUserToken(token);
                    setUserProfile(perfil);
                } else {
                    await AsyncStorage.removeItem("jwt");
                    await AsyncStorage.removeItem("perfil");
                    setUserToken(null);
                    setUserProfile(null);
                }
            } else {
                setUserToken(null);
                setUserProfile(null);
            }
        } catch (e) {
            console.log(`Erro ao verificar login: ${e}`);
            setUserToken(null);
            setUserProfile(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, userToken, userProfile, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
