import React, { createContext,useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import { JWT_SECRET } from "./credentials";
import { use } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`http://195.35.24.128:8081/api/authenticate?username=${email}&password=${password}`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json" 
        },
       // body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id:data.data.userInfo.id,
          nom: data.data.userInfo.nom,
          prenom: data.data.userInfo.prenom,
          email: data.data.userInfo.email,
          role : data.data.userInfo.role,
          token : data.data.token,
          
        };
        
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        
        setUser(userData);
        
      } else {
        console.error("Erreur de connexion", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la connexion", error);
    }
  };

  const userDetail = async (userData) =>{

  };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData !== null) {
        return JSON.parse(userData); // Convertir la chaîne JSON en objet
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
      return null;
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
