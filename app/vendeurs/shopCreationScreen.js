import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Platform, StatusBar, View, Image, Alert } from 'react-native';
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
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const ShopCreationScreen = () => {
  const router = useRouter();
  const [userGetData, setUserGetData] = useState(null);
  const [loginSessionData, setLoginSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
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
    let tempFileUri = null;

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
        let filename = 'shopBanner.png';
        let type = 'image/png';

        if (shopBanner.startsWith('data:image')) {
          const base64Data = shopBanner.split(',')[1];
          fileUri = `${FileSystem.documentDirectory}shopBanner.png`;
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          type = shopBanner.split(';')[0].split(':')[1];
          tempFileUri = fileUri;
          console.log('Base64 converti en fichier :', { uri: fileUri, name: filename, type });
        } else if (shopBanner.startsWith('file://') || shopBanner.startsWith('content://')) {
          fileUri = shopBanner;
          filename = fileUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          type = match ? `image/${match[1]}` : 'image/jpeg';
          console.log('Fichier directement utilisé :', { uri: fileUri, name: filename, type });
        }

        formData.append('shopBanner', {
          uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
          name: filename,
          type,
        });
      }

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
      console.log('Tentative de redirection vers /Vendeurs/home');
      const Loginresponse = await login(formData.email, formData);
      if (Loginresponse?.message) {
        Alert.alert(Loginresponse.message);
      } else {
        router.push('/vendeurs/home');
      }
    } catch (error) {
      console.error('Erreur dans handleCreateShop :', error);
      Alert.alert('Erreur', error.message || 'Échec de la création de la boutique.');
    } finally {
      setIsLoading(false);
      if (tempFileUri) {
        await FileSystem.deleteAsync(tempFileUri).catch((err) =>
          console.log('Erreur lors de la suppression du fichier temporaire :', err)
        );
      }
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
            Create Your Shop
          </Text>
          <Text category="p2" style={styles.headerSubtitle}>
            Set up your selling space
          </Text>
        </Layout>

        {/* Form Container */}
        <Layout style={styles.formContainer}>
          {/* Inputs */}
          <Input
            style={styles.input}
            placeholder="Shop Name"
            value={shopData.shopNom}
            onChangeText={(text) => handleChange('shopNom', text)}
            textStyle={styles.inputText}
            placeholderTextColor="#A0AEC0"
            accessoryLeft={() => (
              <View style={styles.iconContainer}>
                <Ionicons name="bag-outline" size={24} color="#38B2AC" />
              </View>
            )}
          />
          <Input
            style={[styles.input, styles.textArea]}
            placeholder="Shop Description"
            value={shopData.shopDescription}
            onChangeText={(text) => handleChange('shopDescription', text)}
            multiline
            textStyle={styles.inputText}
            placeholderTextColor="#A0AEC0"
            accessoryLeft={() => (
              <View style={styles.iconContainer}>
                <Ionicons name="pencil-outline" size={24} color="#38B2AC" />
              </View>
            )}
          />
          <Input
            style={styles.input}
            placeholder="Shop Phone Number"
            value={shopData.shopTelephone}
            onChangeText={(text) => handleChange('shopTelephone', text)}
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
            placeholder="Shop Email"
            value={shopData.email}
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
            placeholder="Shop Address"
            value={shopData.shopAdresse}
            onChangeText={(text) => handleChange('shopAdresse', text)}
            textStyle={styles.inputText}
            placeholderTextColor="#A0AEC0"
            accessoryLeft={() => (
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={24} color="#38B2AC" />
              </View>
            )}
          />

          {/* Upload Banner */}
          <Button
            style={styles.uploadButton}
            onPress={pickImage}
            accessoryLeft={() => <Ionicons name="image-outline" size={24} color="#FFFFFF" />}
          >
            {shopData.shopBanner ? 'Change Shop Banner' : 'Upload Shop Banner'}
          </Button>
          {shopData.shopBanner && (
            <Image source={{ uri: shopData.shopBanner }} style={styles.bannerPreview} resizeMode="cover" />
          )}

          {/* Create Button */}
          <Button
            style={styles.createButton}
            onPress={handleCreateShop}
            disabled={isLoading}
            accessoryLeft={isLoading ? () => <Spinner size="small" /> : null}
          >
            {!isLoading && 'CREATE SHOP'}
          </Button>
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
  textArea: {
    height: 150, // Agrandi pour plus de confort
    textAlignVertical: 'top',
  },
  inputText: {
    fontSize: 16,
    color: '#2D3748',
  },
  iconContainer: {
    marginRight: 8,
  },
  uploadButton: {
    backgroundColor: '#38B2AC',
    borderColor: '#38B2AC',
    borderRadius: 12,
    paddingVertical: 14,
    height: 56, // Bouton plus grand pour une meilleure ergonomie
    marginBottom: 20,
    shadowColor: '#38B2AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  bannerPreview: {
    width: '100%',
    height: 200, // Agrandi pour une meilleure visibilité
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2, // Bordure plus visible
    borderColor: '#38B2AC', // Bordure turquoise pour cohérence
  },
  createButton: {
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
});

export default ShopCreationScreen;