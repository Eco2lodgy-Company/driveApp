// SellerSignupScreen.js
import React, { useContext, useState, useRef, useEffect } from 'react';
//import { JWT_SECRET } from '../../credentials';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import { LocationContext } from "../../LocationContext";

const SellerSignupScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const { location, errorMsg } = useContext(LocationContext);
  const [formData, setFormData] = useState({
    name: '',
    prenom: '',
    phone: '',
    adress: '',
    email: '',
    role: 'Vendeur',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    try {
      setIsLoading(true);
      console.log('Données à envoyer:', formData);

      const response = await fetch(`http://195.35.24.128:8081/api/user/new`, {
        method: 'POST',
        headers: {
        //   'Authorization': `Bearer ${JWT_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Réponse API:', data);

      if (response.ok) {
        setIsLoading(false);
        setShowSuccess(true);

        Animated.timing(successAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            router.push('/sellers/ShopCreationScreen');
          }, 1500);
        });
      }

    } catch (error) {
      console.error('Erreur lors de la requête POST:', error);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
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
                <Text style={styles.title}>Lancez Votre Boutique</Text>
                <Text style={styles.subtitle}>Inscrivez-vous et vendez dès maintenant</Text>
              </Animated.View>

              <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                <View style={styles.inputCard}>
                  <View style={styles.inputWrapper}>
                    <Icon name="user" size={22} color="#10B981" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.name}
                      onChangeText={(text) => handleChange('name', text)}
                      placeholder="Votre nom"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Icon name="user" size={22} color="#10B981" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.prenom}
                      onChangeText={(text) => handleChange('prenom', text)}
                      placeholder="Votre prénom"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Icon name="phone" size={22} color="#10B981" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.phone}
                      onChangeText={(text) => handleChange('phone', text)}
                      placeholder="Numéro de téléphone"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Icon name="map-pin" size={22} color="#10B981" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.adress}
                      onChangeText={(text) => handleChange('adress', text)}
                      placeholder="Votre adresse"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Icon name="mail" size={22} color="#10B981" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.email}
                      onChangeText={(text) => handleChange('email', text)}
                      placeholder="Votre email"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Icon name="lock" size={22} color="#10B981" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.password}
                      onChangeText={(text) => handleChange('password', text)}
                      placeholder="Mot de passe"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Icon name="lock" size={22} color="#10B981" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.confirmPassword}
                      onChangeText={(text) => handleChange('confirmPassword', text)}
                      placeholder="Confirmez"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                    />
                  </View>
                </View>

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
                    <Icon name="check-circle" size={24} color="#fff" />
                    <Text style={styles.successText}>Inscription réussie !</Text>
                  </Animated.View>
                )}

                <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonScale }] }]}>
                  <TouchableOpacity
                    style={styles.signupButton}
                    onPress={handleStart}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#FCD34D', '#F59E0B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>C’est parti !</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Déjà inscrit ?</Text>
                  <TouchableOpacity onPress={() => router.push('/sellers/home')}>
                    <Text style={styles.footerLink}>Connexion</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>

          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'transparent']}
            style={styles.auroraEffect}
          />
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayGradient: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#D1FAE5',
    marginTop: 8,
    fontWeight: '500',
    opacity: 0.9,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  inputCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 28,
  },
  signupButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.8,
  },
  footerLink: {
    fontSize: 15,
    color: '#FCD34D',
    fontWeight: '700',
    marginLeft: 6,
  },
  auroraEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
});

export default SellerSignupScreen;