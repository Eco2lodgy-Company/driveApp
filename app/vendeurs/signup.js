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
    userLat: null,
  userLong: location ? location.longitude : null,
    role: 'Vendeur',
    password: '',
    confirmPassword: '',
  });

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
    console.log('Données à envoyer:', formData);

    // Convertir l'objet en JSON encodé
    const encodedData = encodeURIComponent(JSON.stringify(formData));

    // Lancer l'animation avant la redirection
    setShowSuccess(true);
    Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
    }).start(() => {
        setTimeout(() => {
            // Redirection en incluant les données dans l'URL
            router.push(`/sellers/ShopCreationScreen?data=${encodedData}`);
        }, 1500);
    });
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
    paddingHorizontal: '5%', // Utilisation de pourcentage au lieu de valeur fixe
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: '10%', // Utilisation de pourcentage relatif
  },
  title: {
    fontSize: Platform.select({
      ios: 36,
      android: 32,
    }), // Tailles différentes selon la plateforme
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Platform.select({
      ios: 18,
      android: 16,
    }),
    color: '#D1FAE5',
    marginTop: 8,
    fontWeight: '500',
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 480, // Augmentation légère pour grands écrans
    alignItems: 'center',
    paddingHorizontal: '2%',
  },
  inputCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    padding: '5%', // Padding relatif
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: Platform.select({
      android: 12,
      ios: 8,
    }),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: '4%', // Espacement relatif
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 50, // Hauteur minimale pour petits écrans
  },
  inputIcon: {
    marginLeft: '3%',
    marginRight: '2%',
  },
  input: {
    flex: 1,
    paddingVertical: Platform.select({
      ios: 14,
      android: 12,
    }),
    paddingHorizontal: 12,
    fontSize: Platform.select({
      ios: 16,
      android: 14,
    }),
    color: '#111827',
    minHeight: 48,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    padding: '4%',
    borderRadius: 12,
    marginVertical: '5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
  },
  successText: {
    color: '#fff',
    fontSize: Platform.select({
      ios: 16,
      android: 14,
    }),
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: '7%',
    paddingHorizontal: '10%',
  },
  signupButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  buttonGradient: {
    paddingVertical: Platform.select({
      ios: 16,
      android: 14,
    }),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    color: '#fff',
    fontSize: Platform.select({
      ios: 18,
      android: 16,
    }),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '6%',
    marginBottom: '5%',
  },
  footerText: {
    fontSize: Platform.select({
      ios: 15,
      android: 14,
    }),
    color: '#fff',
    opacity: 0.8,
  },
  footerLink: {
    fontSize: Platform.select({
      ios: 15,
      android: 14,
    }),
    color: '#FCD34D',
    fontWeight: '700',
    marginLeft: 6,
  },
  auroraEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '25%', // Hauteur relative
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
});

export default SellerSignupScreen;