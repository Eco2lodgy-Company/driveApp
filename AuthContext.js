import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(
        `http://195.35.24.128:8081/api/authenticate?username=${email}&password=${password}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data?.data?.userInfo) {
        const userData = {
          id: data.data.userInfo.id,
          nom: data.data.userInfo.nom,
          prenom: data.data.userInfo.prenom,
          email: data.data.userInfo.email,
          role: data.data.userInfo.role,
          token: data.data.token,
        };

        await AsyncStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        return { success: true, user: userData };
      } else {
        return { success: false, message: data?.message || "Identifiants incorrects" };
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      return { success: false, message: "Impossible de se connecter au serveur" };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
