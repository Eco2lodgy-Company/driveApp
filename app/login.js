import React, { useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWindowDimensions } from 'react-native';
import { AuthContext } from "../AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { width, height } = useWindowDimensions();
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
      style={styles.container}
    >
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(255, 98, 0, 0.85)', 'rgba(255, 140, 0, 0.85)', 'rgba(255, 167, 38, 0.85)']}
          style={styles.gradient}
        >
          <StatusBar barStyle="light-content" />

          <View style={[styles.header, { marginTop: height * 0.1 }]}>
            <Text style={styles.appName}>drive.re</Text>
            <Text style={styles.tagline}>Shopping nouvelle génération</Text>
          </View>

          <View style={[styles.formContainer, { width: width * 0.9, maxWidth: 400 }]}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>{success}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Adresse email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Connexion</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.signupButton}>
              <Text style={styles.signupText}>
                Nouveau client ?{' '}
                <Text style={styles.signupLink}>Créer un compte</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: Dimensions.get('window').width > 600 ? 48 : 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: Dimensions.get('window').width > 600 ? 18 : 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
    fontStyle: 'italic',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#ff6200',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#ff6200',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  signupButton: {
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#ff6200',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  successText: {
    color: '#2ecc71',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;