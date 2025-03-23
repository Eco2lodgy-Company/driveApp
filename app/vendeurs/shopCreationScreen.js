// ShopCreationScreen.js
import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import BottomNavigation from '../clients/components/BottomNavigation';

const ShopCreationScreen = () => {
  const router = useRouter();
    const [userGetData, setUserGetData] = useState(null);

    useEffect(() => {
      const fetchUserData = async () => {
          try {
              const storedUserData = await AsyncStorage.getItem("userDetails");
              if (storedUserData) {
                  setUserGetData(JSON.parse(storedUserData));
              } else {
                  console.log("Aucune donnée reçue !");
              }
          } catch (error) {
              console.error("Erreur lors de la récupération des données :", error);
          }
      };

      fetchUserData();
  }, []); // ✅ Exécute `useEffect` une seule fois au montage du composant

  console.log(JSON.stringify(userGetData));

  // État pour les champs du formulaire
  const [shopData, setShopData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    bannerImage: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Gestion des changements dans les champs texte
  const handleChange = (field, value) => {
    setShopData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Gestion de l'upload de l'image de bannière
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erreur', 'Permission refusée pour accéder à la galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setShopData((prev) => ({
        ...prev,
        bannerImage: result.assets[0].uri,
      }));
    }
  };

  // Gestion de la création de la boutique
  const handleCreateShop = async () => {
    const { name, description, phone, email, address, bannerImage } = shopData;

    // Validation de base
    if (!name || !description || !phone || !email || !address || !bannerImage) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs et uploader une bannière.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide.');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide (10 chiffres).');
      return;
    }

    setIsLoading(true);
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Succès', 'Boutique créée avec succès !');
      router.push('/sellers/dashboard');
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Échec de la création de la boutique.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Créer une boutique</Text>
          <Text style={styles.subtitle}>Configurez votre espace de vente</Text>

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Nom de la boutique */}
            <View style={styles.inputContainer}>
              <Icon name="shopping-bag" size={20} color="#38A169" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={shopData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Nom de la boutique"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Icon name="edit-2" size={20} color="#38A169" style={styles.icon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={shopData.description}
                onChangeText={(text) => handleChange('description', text)}
                placeholder="Description de la boutique"
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Numéro de téléphone */}
            <View style={styles.inputContainer}>
              <Icon name="phone" size={20} color="#38A169" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={shopData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                placeholder="Numéro de téléphone"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Icon name="mail" size={20} color="#38A169" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={shopData.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="Email de la boutique"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Adresse */}
            <View style={styles.inputContainer}>
              <Icon name="map-pin" size={20} color="#38A169" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={shopData.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Adresse de la boutique"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            {/* Bannière */}
            <Text style={styles.label}>Bannière de la boutique</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Icon name="image" size={20} color="#fff" style={styles.uploadIcon} />
              <Text style={styles.uploadButtonText}>
                {shopData.bannerImage ? 'Changer l’image' : 'Uploader une bannière'}
              </Text>
            </TouchableOpacity>
            {shopData.bannerImage && (
              <Image
                source={{ uri: shopData.bannerImage }}
                style={styles.bannerPreview}
                resizeMode="cover"
              />
            )}

            <TouchableOpacity
              style={[styles.createButton, isLoading && styles.createButtonDisabled]}
              onPress={handleCreateShop}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Créer la boutique</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* <BottomNavigation /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Espace pour BottomNavigation
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'left',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDEFF2',
  },
  icon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#38A169',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bannerPreview: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDEFF2',
  },
  createButton: {
    backgroundColor: '#38A169',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#95C9A6',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ShopCreationScreen;