import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, StatusBar, View } from 'react-native';
import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  Layout,
  Text,
  Input,
  Button,
  Spinner,
} from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { LocationContext } from "../../LocationContext";

const userSignupScreen = () => {
  const router = useRouter();
  const { location } = useContext(LocationContext);

  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    role: 'Client',
    password: '',
    confirmPassword: '',
    longitude: location ? location.longitude : 'string',
    latitude: location ? location.latitude : 'string',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (location) {
      setFormData((prevData) => ({
        ...prevData,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    }
  }, [location]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStart = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        setIsLoading(false);
        return;
      }

      // Create FormData object with specified order, excluding shop fields
      const dataToSend = new FormData();
      dataToSend.append('telephone', formData.telephone);
      dataToSend.append('prenom', formData.prenom);
      dataToSend.append('latitude', formData.latitude);
      dataToSend.append('nom', formData.nom);
      dataToSend.append('adresse', formData.adresse);
      dataToSend.append('longitude', formData.longitude);
      dataToSend.append('role', formData.role);
      dataToSend.append('confirmPassword', formData.confirmPassword);
      dataToSend.append('password', formData.password);
      dataToSend.append('email', formData.email);

      console.log("données envoyées :", Object.fromEntries(dataToSend));

      const response = await fetch('http://195.35.24.128:8081/api/user/new', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
        body: dataToSend,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du compte');
      }

      setSuccess("Inscription réussie ! Redirection en cours...");
      setTimeout(() => {
        router.push('/clients/home');
      }, 2000);

    } catch (error) {
      setError("Une erreur est survenue lors de l'inscription");
      console.error("Erreur d'inscription :", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <Layout style={styles.header} level="1">
          <Ionicons name="person-add-outline" size={70} color="#38B2AC" />
          <Text category="h4" style={styles.headerTitle}>
            Sign Up as Client
          </Text>
          <Text category="p2" style={styles.headerSubtitle}>
            Join us today!
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
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
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
            placeholder="Last Name"
            value={formData.nom}
            onChangeText={(text) => handleChange('nom', text)}
            autoCapitalize="words"
            textStyle={styles.inputText}
            placeholderTextColor="#A0AEC0"
            accessoryLeft={() => (
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={24} color="#38B2AC" />
              </View>
            )}
          />
          <Input
            style={styles.input}
            placeholder="First Name"
            value={formData.prenom}
            onChangeText={(text) => handleChange('prenom', text)}
            autoCapitalize="words"
            textStyle={styles.inputText}
            placeholderTextColor="#A0AEC0"
            accessoryLeft={() => (
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={24} color="#38B2AC" />
              </View>
            )}
          />
          <Input
            style={styles.input}
            placeholder="Phone Number"
            value={formData.telephone}
            onChangeText={(text) => handleChange('telephone', text)}
            keyboardType="phone-pad"
            textStyle={styles.inputText}
            placeholderTextColor="#A0AEC0"
            accessoryLeft={() => (
              <View style={styles.iconContainer}>
                <Ionicons name="call-outline" size={24} color="#38B2AC" />
              </View>
            )}
          />
          <Input
            style={styles.input}
            placeholder="Address"
            value={formData.adresse}
            onChangeText={(text) => handleChange('adresse', text)}
            textStyle={styles.inputText}
            placeholderTextColor="#A0AEC0"
            accessoryLeft={() => (
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={24} color="#38B2AC" />
              </View>
            )}
          />
          <Input
            style={styles.input}
            placeholder="Password"
            value={formData.password}
            onChangeText={(text) => handleChange('password', text)}
            secureTextEntry
            textStyle={styles.inputText}
            placeholderTextColor="#A0AEC0"
            accessoryLeft={() => (
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={24} color="#38B2AC" />
              </View>
            )}
          />
          <Input
            style={styles.input}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
            secureTextEntry
            textStyle={styles.inputText}
            placeholderTextColor="#A0AEC0"
            accessoryLeft={() => (
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={24} color="#38B2AC" />
              </View>
            )}
          />

          {/* Signup Button */}
          <Button
            style={styles.signupButton}
            onPress={handleStart}
            disabled={isLoading}
            accessoryLeft={isLoading ? () => <Spinner size="small" /> : null}
          >
            {!isLoading && 'SIGN UP'}
          </Button>

          {/* Login Link */}
          <Layout style={styles.loginContainer}>
            <Text category="p2" appearance="hint">
              Already have an account?{' '}
              <Text
                category="p2"
                status="primary"
                onPress={() => router.push('/')}
              >
                Sign In
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
    paddingVertical: 12,
    borderWidth: 1,
  },
  inputText: {
    fontSize: 16,
    color: '#2D3748',
  },
  iconContainer: {
    marginRight: 8,
  },
  signupButton: {
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
  loginContainer: {
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: 'transparent',
  },
});

export default userSignupScreen;