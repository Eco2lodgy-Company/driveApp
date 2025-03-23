import React, { useState, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system'; // Ajout de la bibliothèque pour gérer les fichiers

const ShopCreationScreen = () => {
  const router = useRouter();
  const [userGetData, setUserGetData] = useState(null);
  const [loginSessionData, setLoginSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [shopData, setShopData] = useState({
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    role: '',
    password: '',
    confirmPassword: '',
    longitude: '',
    latitude: '',
    shopNom: '',
    shopDescription: '',
    shopTelephone: '',
    shopAdresse: '',
    shopLongitude: '',
    shopLatitude: '',
    shopBanner: null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userDetails');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          console.log('Données récupérées de AsyncStorage :', parsedData);
          setUserGetData(parsedData);
          setLoginSessionData(parsedData);
        } else {
          console.log('Aucune donnée reçue dans AsyncStorage !');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (userGetData) {
      console.log('Mise à jour de shopData avec userGetData :', userGetData);
      setShopData((prev) => ({
        ...prev,
        email: userGetData.email || '',
        nom: userGetData.name || '',
        prenom: userGetData.prenom || '',
        telephone: userGetData.phone || '',
        adresse: userGetData.adress || '',
        role: userGetData.role || '',
        password: userGetData.password || '',
        confirmPassword: userGetData.confirmPassword || '',
        longitude: userGetData.userLong || '',
        latitude: userGetData.userLat || '',
      }));
    }
  }, [userGetData]);

  const handleChange = (field, value) => {
    setShopData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
      console.log('Image sélectionnée :', result.assets[0].uri);
      setShopData((prev) => ({
        ...prev,
        shopBanner: result.assets[0].uri,
      }));
    }
  };

  const handleCreateShop = async () => {
    console.log('État actuel de shopData avant validation :', shopData);
    const {
      email,
      nom,
      prenom,
      telephone,
      adresse,
      role,
      password,
      confirmPassword,
      longitude,
      latitude,
      shopNom,
      shopDescription,
      shopTelephone,
      shopAdresse,
      shopBanner,
    } = shopData;

    // Validation des champs obligatoires
    if (!shopNom || !shopDescription || !shopTelephone || !email || !shopAdresse || !shopBanner) {
      console.log('Champs manquants :', { shopNom, shopDescription, shopTelephone, email, shopAdresse, shopBanner });
      Alert.alert('Erreur', 'Veuillez remplir tous les champs et uploader une bannière.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      console.log('Email invalide :', email);
      Alert.alert('Erreur', 'Veuillez entrer un email valide.');
      return;
    }
    if (!/^\d{10}$/.test(shopTelephone)) {
      console.log('Téléphone invalide :', shopTelephone);
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide (10 chiffres).');
      return;
    }

    setIsLoading(true);
    let tempFileUri = null; // Variable pour stocker l'URI du fichier temporaire

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('nom', nom);
      formData.append('prenom', prenom);
      formData.append('telephone', telephone);
      formData.append('adresse', adresse);
      formData.append('role', role);
      formData.append('password', password);
      formData.append('confirmPassword', confirmPassword);
      formData.append('longitude', longitude);
      formData.append('latitude', latitude);
      formData.append('shopNom', shopNom);
      formData.append('shopDescription', shopDescription);
      formData.append('shopTelephone', shopTelephone);
      formData.append('shopAdresse', shopAdresse);
      formData.append('shopLongitude', shopData.shopLongitude || '');
      formData.append('shopLatitude', shopData.shopLatitude || '');

      if (shopBanner) {
        let fileUri;
        let filename = 'shopBanner.png'; // Nom par défaut
        let type = 'image/png'; // Type par défaut

        if (shopBanner.startsWith('data:image')) {
          // Cas 1 : Chaîne base64 -> Conversion en fichier
          const base64Data = shopBanner.split(',')[1]; // Extrait la partie base64
          fileUri = `${FileSystem.documentDirectory}shopBanner.png`;
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          type = shopBanner.split(';')[0].split(':')[1]; // Ex. "image/png"
          tempFileUri = fileUri; // Stocke pour suppression ultérieure
          console.log('Base64 converti en fichier :', { uri: fileUri, name: filename, type });
        } else if (shopBanner.startsWith('file://') || shopBanner.startsWith('content://')) {
          // Cas 2 : URI de fichier (ImagePicker)
          fileUri = shopBanner;
          filename = fileUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          type = match ? `image/${match[1]}` : 'image/jpeg';
          console.log('Fichier directement utilisé :', { uri: fileUri, name: filename, type });
        }

        // Ajout du fichier au FormData
        formData.append('shopBanner', {
          uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
          name: filename,
          type,
        });
      }

      // Log complet des données envoyées
      console.log('Données envoyées au serveur :', {
        email,
        nom,
        prenom,
        telephone,
        adresse,
        role,
        password,
        confirmPassword,
        longitude,
        latitude,
        shopNom,
        shopDescription,
        shopTelephone,
        shopAdresse,
        shopLongitude: shopData.shopLongitude,
        shopLatitude: shopData.shopLatitude,
        shopBanner: shopBanner ? shopBanner.substring(0, 50) + '...' : null,
      });

      const response = await fetch('http://195.35.24.128:8081/api/user/new', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Statut de la réponse :', response.status);
      const responseText = await response.text();
      console.log('Réponse brute du serveur :', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: 'Réponse non-JSON ou vide' };
        }
        throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.log('Impossible de parser la réponse en JSON');
        result = {};
      }

      console.log('Résultat parsé :', result);
      Alert.alert('Succès', 'Boutique créée avec succès !');
      console.log('Tentative de redirection vers /sellers/dashboard');
      router.push('/sellers/dashboard');
    } catch (error) {
      console.error('Erreur dans handleCreateShop :', error);
      Alert.alert('Erreur', error.message || 'Échec de la création de la boutique.');
    } finally {
      setIsLoading(false);
      // Nettoyage du fichier temporaire si créé
      if (tempFileUri) {
        await FileSystem.deleteAsync(tempFileUri).catch((err) =>
          console.log('Erreur lors de la suppression du fichier temporaire :', err)
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Créer une boutique</Text>
          <Text style={styles.subtitle}>Configurez votre espace de vente</Text>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Icon name="shopping-bag" size={20} color="#38A169" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={shopData.shopNom}
                onChangeText={(text) => handleChange('shopNom', text)}
                placeholder="Nom de la boutique"
                placeholderTextColor="#A0A0A0"
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="edit-2" size={20} color="#38A169" style={styles.icon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={shopData.shopDescription}
                onChangeText={(text) => handleChange('shopDescription', text)}
                placeholder="Description de la boutique"
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={4}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="phone" size={20} color="#38A169" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={shopData.shopTelephone}
                onChangeText={(text) => handleChange('shopTelephone', text)}
                placeholder="Numéro de téléphone"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
              />
            </View>
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
            <View style={styles.inputContainer}>
              <Icon name="map-pin" size={20} color="#38A169" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={shopData.shopAdresse}
                onChangeText={(text) => handleChange('shopAdresse', text)}
                placeholder="Adresse de la boutique"
                placeholderTextColor="#A0A0A0"
              />
            </View>
            <Text style={styles.label}>Bannière de la boutique</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Icon name="image" size={20} color="#fff" style={styles.uploadIcon} />
              <Text style={styles.uploadButtonText}>
                {shopData.shopBanner ? 'Changer l’image' : 'Uploader une bannière'}
              </Text>
            </TouchableOpacity>
            {shopData.shopBanner && (
              <Image source={{ uri: shopData.shopBanner }} style={styles.bannerPreview} resizeMode="cover" />
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
    </SafeAreaView>
  );
};

// Les styles restent inchangés
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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