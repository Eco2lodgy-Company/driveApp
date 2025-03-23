import React, { useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWindowDimensions } from 'react-native';
import { AuthContext } from "../AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from 'twrnc'; // Assurez-vous d'avoir installé twrnc : npm install twrnc

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      return userData !== null ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
      return null;
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await login(email, password);
      
      if (response?.message) {
        setError(response.message);
      } else {
        const userRole = await getUserData();
        
        if (userRole && userRole.role) {
          setSuccess('Connexion réussie ! Redirection en cours...');
          
          setTimeout(() => {
            if (userRole.role === "Vendeur") {
              router.push("/vendeurs/home");
            } else if (userRole.role === "Client") {
              router.push("/clients/home");
            } else if (userRole.role === "Livreur") {
              router.push("/deliverer/home");
            }
          }, 2000);
        } else {
          setError("Erreur : Identifants incorrects");
        }
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la connexion");
      console.error("Erreur de connexion :", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1`}
    >
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
        style={tw`flex-1 w-full h-full`}
      >
        <LinearGradient
          colors={['rgba(255, 98, 0, 0.9)', 'rgba(255, 140, 0, 0.85)', 'rgba(255, 167, 38, 0.8)']}
          style={tw`flex-1 items-center justify-center py-10`}
        >
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View style={tw`items-center mb-12 mt-16`}>
            <Text style={tw`text-4xl md:text-5xl font-extrabold text-white uppercase tracking-wide shadow-md`}>
              drive.re
            </Text>
            <Text style={tw`text-sm md:text-base text-white opacity-80 italic mt-2`}>
              Shopping nouvelle génération
            </Text>
          </View>

          {/* Form Container */}
          <View style={tw`bg-white/95 rounded-3xl p-6 w-11/12 max-w-md shadow-xl border border-gray-100`}>
            {error ? (
              <Text style={tw`text-red-600 text-center mb-4 text-sm font-medium`}>
                {error}
              </Text>
            ) : null}
            {success ? (
              <Text style={tw`text-green-500 text-center mb-4 text-sm font-bold`}>
                {success}
              </Text>
            ) : null}

            {/* Inputs */}
            <TextInput
              style={tw`bg-gray-50 rounded-xl p-4 mb-4 text-base text-gray-800 border border-gray-200 shadow-sm`}
              placeholder="Adresse email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={tw`bg-gray-50 rounded-xl p-4 mb-4 text-base text-gray-800 border border-gray-200 shadow-sm`}
              placeholder="Mot de passe"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Forgot Password */}
            <TouchableOpacity style={tw`self-end mb-6`}>
              <Text style={tw`text-orange-500 text-sm font-medium underline`}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={tw`bg-orange-500 rounded-xl py-4 items-center shadow-lg`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`text-white text-lg font-bold tracking-wide`}>
                  Connexion
                </Text>
              )}
            </TouchableOpacity>

            {/* Signup Link */}
            <TouchableOpacity style={tw`mt-6 items-center`}>
              <Text style={tw`text-gray-600 text-sm`}>
                Nouveau client ?{' '}
                <Text style={tw`text-orange-500 font-semibold underline`}>
                  Créer un compte
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;