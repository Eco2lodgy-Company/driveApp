import React, { useContext, useState, useRef, useEffect } from 'react';
import { StyleSheet, Platform, Animated } from 'react-native';
import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  Layout,
  Text,
  Input,
  Button,
  Card,
  Spinner,
} from '@ui-kitten/components';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { LocationContext } from "../../LocationContext";
import { AuthContext } from '../../AuthContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Importation de Feather

const SellerSignupScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
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
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (location) {
      console.log("Mise à jour de la position :", location);
      setFormData((prevData) => ({
        ...prevData,
        userLat: location.latitude,
        userLong: location.longitude,
      }));
    }
  }, [location]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(titleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleStart = async () => {
    console.log('Données à envoyer:', formData);
    setShowSuccess(true);

    Animated.timing(successAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(async () => {
      setTimeout(async () => {
        try {
          await AsyncStorage.setItem("userDetails", JSON.stringify(formData));
          router.push('/vendeurs/shopCreationScreen');
        } catch (error) {
          console.error("Erreur lors de la sauvegarde des données :", error);
        }
      }, 1500);
    });
  };

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <ImageBackground
        source={{ uri: 'https://plus.unsplash.com/premium_photo-1686156706249-f513395fa099?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.7)', 'rgba(4, 120, 87, 0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overlayGradient}
        >
          <Layout style={styles.safeContainer}>
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: titleAnim,
                  transform: [
                    {
                      translateY: titleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text category="h2" style={styles.title}>
                Lancez Votre Boutique
              </Text>
              <Text category="p2" appearance="hint" style={styles.subtitle}>
                Inscrivez-vous et vendez dès maintenant
              </Text>
            </Animated.View>

            <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
              <Card style={styles.inputCard}>
                <Input
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => handleChange('name', text)}
                  placeholder="Votre nom"
                  accessoryLeft={() => <Icon name="user" size={22} color="#10B981" />}
                  autoCapitalize="words"
                />
                <Input
                  style={styles.input}
                  value={formData.prenom}
                  onChangeText={(text) => handleChange('prenom', text)}
                  placeholder="Votre prénom"
                  accessoryLeft={() => <Icon name="user" size={22} color="#10B981" />}
                  autoCapitalize="words"
                />
                <Input
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => handleChange('phone', text)}
                  placeholder="Numéro de téléphone"
                  accessoryLeft={() => <Icon name="phone" size={22} color="#10B981" />}
                  keyboardType="phone-pad"
                />
                <Input
                  style={styles.input}
                  value={formData.adress}
                  onChangeText={(text) => handleChange('adress', text)}
                  placeholder="Votre adresse"
                  accessoryLeft={() => <Icon name="map-pin" size={22} color="#10B981" />}
                />
                <Input
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                  placeholder="Votre email"
                  accessoryLeft={() => <Icon name="mail" size={22} color="#10B981" />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => handleChange('password', text)}
                  placeholder="Mot de passe"
                  accessoryLeft={() => <Icon name="lock" size={22} color="#10B981" />}
                  secureTextEntry
                />
                <Input
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleChange('confirmPassword', text)}
                  placeholder="Confirmez"
                  accessoryLeft={() => <Icon name="lock" size={22} color="#10B981" />}
                  secureTextEntry
                />
              </Card>

              {showSuccess && (
                <Animated.View
                  style={[
                    styles.successMessage,
                    {
                      opacity: successAnim,
                      transform: [
                        {
                          scale: successAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Icon name="check-circle" size={24} color="#fff" style={styles.successIcon} />
                  <Text category="p1" style={styles.successText}>
                    Inscription réussie !
                  </Text>
                </Animated.View>
              )}

              <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonScale }] }]}>
                <Button
                  style={styles.signupButton}
                  onPress={handleStart}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={isLoading}
                  accessoryLeft={isLoading ? () => <Spinner size="small" /> : null}
                >
                  {!isLoading && 'C’est parti !'}
                </Button>
              </Animated.View>

              <Layout style={styles.footer}>
                <Text category="p2" appearance="hint">
                  Déjà inscrit ?{' '}
                  <Text
                    category="p2"
                    status="primary"
                    onPress={() => router.push('/login')}
                  >
                    Connexion
                  </Text>
                </Text>
              </Layout>
            </Animated.View>

            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'transparent']}
              style={styles.auroraEffect}
            />
          </Layout>
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
  overlayGradient: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: '5%',
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  title: {
    color: '#fff',
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    color: '#D1FAE5',
    marginTop: 8,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
  },
  inputCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 8,
  },
  input: {
    marginBottom: 16,
    borderRadius: 12,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    width: '100%',
  },
  successIcon: {
    marginRight: 10,
  },
  successText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 28,
    paddingHorizontal: '10%',
  },
  signupButton: {
    backgroundColor: '#FCD34D',
    borderColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  auroraEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '25%',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
});

export default SellerSignupScreen;