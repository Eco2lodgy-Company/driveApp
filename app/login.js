import React, { useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Platform, StatusBar } from 'react-native';
import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  Layout,
  Text,
  Input,
  Button,
  Spinner,
  Card,
} from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWindowDimensions } from 'react-native';
import { AuthContext } from "../AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageBackground } from 'react-native';

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
    <ApplicationProvider {...eva} theme={eva.light} icons={EvaIconsPack}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(255, 98, 0, 0.9)', 'rgba(255, 140, 0, 0.85)', 'rgba(255, 167, 38, 0.8)']}
          style={styles.gradient}
        >
          <StatusBar barStyle="light-content" />
          
          {/* Header */}
          <Layout style={styles.header} level="1">
            <Text category="h1" style={styles.headerTitle}>
              drive.re
            </Text>
            <Text category="p2" appearance="hint" style={styles.headerSubtitle}>
              Shopping nouvelle génération
            </Text>
          </Layout>

          {/* Form Container */}
          <Card style={styles.formContainer}>
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
              placeholder="Adresse email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Forgot Password */}
            <Button
              appearance="ghost"
              status="primary"
              style={styles.forgotButton}
              onPress={() => {} /* Ajoute ici la logique pour mot de passe oublié */}
            >
              Mot de passe oublié ?
            </Button>

            {/* Login Button */}
            <Button
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              accessoryLeft={isLoading ? () => <Spinner size="small" /> : null}
            >
              {!isLoading && 'Connexion'}
            </Button>

            {/* Signup Link */}
            <Layout style={styles.signupContainer}>
              <Text category="p2" appearance="hint">
                Nouveau client ?{' '}
                <Text
                  category="p2"
                  status="primary"
                  onPress={() => {} /* Ajoute ici la navigation vers l'inscription */}
                >
                  Créer un compte
                </Text>
              </Text>
            </Layout>
          </Card>
        </LinearGradient>
      </ImageBackground>
    </ApplicationProvider>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 64,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: '#fff',
    opacity: 0.8,
    fontStyle: 'italic',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EDEFF2',
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    borderRadius: 12,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#FF6200',
    borderColor: '#FF6200',
    borderRadius: 12,
    paddingVertical: 12,
  },
  signupContainer: {
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: 'transparent',
  },
});

export default LoginScreen;