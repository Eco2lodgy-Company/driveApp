import React, { useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Platform, StatusBar, View } from 'react-native';
import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  Layout,
  Text,
  Input,
  Button,
  Spinner,
} from '@ui-kitten/components';
import { useWindowDimensions } from 'react-native';
import { AuthContext } from "../../AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons from @expo/vector-icons

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
  
      if (!response.success) {
        setError(response.message);
      } else {
        const userRole = response.user.role;
  
        setSuccess("Connexion réussie ! Redirection en cours...");
  
        setTimeout(() => {
          if (userRole === "Vendeur") {
            router.push("/vendeurs/home");
          } else if (userRole === "Client") {
            router.push("/clients/home");
          } else if (userRole === "Livreur") {
            router.push("/deliverer/home");
          }
        }, 2000);
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la connexion");
      console.error("Erreur de connexion :", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header with Logo and Welcome Text */}
        <Layout style={styles.header} level="1">
          <Ionicons name="cart-outline" size={70} color="#38B2AC" />
          <Text category="h4" style={styles.headerTitle}>
            Se connecter
          </Text>
          <Text category="p2" style={styles.headerSubtitle}>
            Allez, commencons
          </Text>
        </Layout>

        {/* Form Container */}
        <Layout style={styles.formContainer}>
          {error ? (
            <Text category="p1" status="danger" style={styles.message}>
              {error}
            </Text>
          ) : null}
          {success ? (
            <Text category="p1" status="success" style={styles.message}>
              {success}
            </Text>
          ) : null}

          {/* Inputs */}
          <Input
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            textStyle={styles.inputText}
            placeholderTextColor="#A0AEC0"
            accessoryLeft={() => (
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={24} color="#38B2AC" />
              </View>
            )}
          />
          <Input
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textStyle={styles.inputText}
            placeholderTextColor="#A0AEC0"
            accessoryLeft={() => (
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={24} color="#38B2AC" />
              </View>
            )}
          />

          {/* Forgot Password */}
          <Button
            appearance="ghost"
            status="primary"
            style={styles.forgotButton}
            onPress={() => {} /* Ajoute ici la logique pour mot de passe oublié */}
          >
            mot de passe oublier ?
          </Button>

          {/* Login Button */}
          <Button
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
            accessoryLeft={isLoading ? () => <Spinner size="small" /> : null}
          >
            {!isLoading && 'SE CONNECTER'}
          </Button>

          {/* Signup Link */}
          <Layout style={styles.signupContainer}>
            <Text category="p2" appearance="hint">
              Pas encore de compte ?{' '}
              <Text
                category="p2"
                status="primary"
                onPress={() => {router.push("choix")} /* Ajoute ici la navigation vers l'inscription */}
              >
               S'inscrire
              </Text>
            </Text>
          </Layout>
        </Layout>
      </Layout>
    </ApplicationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    color: '#2D3748',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  headerSubtitle: {
    color: '#718096',
    marginTop: 8,
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: 'transparent',
    width: '90%',
    maxWidth: 400,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 20,
    borderRadius: 10,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 12, // Ajouté pour augmenter l'espace intérieur verticalement
    // paddingTop:25,
    // paddingBottom:25,
    borderWidth: 1,
  },
  inputText: {
    fontSize: 16,
    color: '#2D3748',
  },
  iconContainer: {
    marginRight: 8,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    color: '#E53E3E',
  },
  loginButton: {
    backgroundColor: '#38B2AC',
    borderColor: '#38B2AC',
    borderRadius: 10,
    paddingVertical: 12,
    height: 50,
    shadowColor: '#38B2AC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  signupContainer: {
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: 'transparent',
  },
});

export default LoginScreen;