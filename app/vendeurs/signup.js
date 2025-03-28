import React, { useContext, useState, useRef, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { LocationContext } from "../../LocationContext";
import { AuthContext } from '../../AuthContext';
import AsyncStorage from "@react-native-async-storage/async-storage";

const SellerSignupScreen = () => {
  const router = useRouter();
  const { location } = useContext(LocationContext);
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    prenom: '',
    phone: '',
    adress: '',
    email: '',
    userLat: null,
    userLong: location ? location.longitude : null,
    role: 'Vendeur',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (location) {
      setFormData((prevData) => ({
        ...prevData,
        userLat: location.latitude,
        userLong: location.longitude,
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
      // Simuler une validation ou une API call ici si nécessaire
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
      } else {
        await AsyncStorage.setItem("userDetails", JSON.stringify(formData));
        setSuccess("Inscription réussie ! Redirection en cours...");
        setTimeout(() => {
          router.push('/vendeurs/shopCreationScreen');
        }, 2000);
      }
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
          <Ionicons name="storefront-outline" size={70} color="#38B2AC" />
          <Text category="h4" style={styles.headerTitle}>
            Sign Up as Seller
          </Text>
          <Text category="p2" style={styles.headerSubtitle}>
            Start selling today!
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
            placeholder="Last Name"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
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
            value={formData.phone}
            onChangeText={(text) => handleChange('phone', text)}
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
            value={formData.adress}
            onChangeText={(text) => handleChange('adress', text)}
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
                onPress={() => router.push('/login')}
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

export default SellerSignupScreen;