import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Platform, StatusBar, View, Image, Alert, ScrollView } from 'react-native';
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

  const renderIcon = (iconName) => (
    <Ionicons name={iconName} size={20} color="#4FD1C5" />
  );

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header repensé */}
          <Layout style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="storefront-outline" size={48} color="#FFF" />
            </View>
            <Text category="h5" style={styles.headerTitle}>
              Create Your Shop
            </Text>
            <Text category="p2" style={styles.headerSubtitle}>
              Build your online presence in minutes
            </Text>
          </Layout>

          {/* Formulaire dans une carte */}
          <Card style={styles.card}>
            <Input
              style={styles.input}
              placeholder="Shop Name"
              value={shopData.shopNom}
              onChangeText={(text) => handleChange('shopNom', text)}
              accessoryLeft={() => renderIcon('bag-outline')}
              caption="Required"
            />
            <Input
              style={styles.input}
              placeholder="Shop Description"
              value={shopData.shopDescription}
              onChangeText={(text) => handleChange('shopDescription', text)}
              multiline
              numberOfLines={4}
              accessoryLeft={() => renderIcon('pencil-outline')}
              caption="Tell us about your shop"
            />
            <Input
              style={styles.input}
              placeholder="Shop Phone"
              value={shopData.shopTelephone}
              onChangeText={(text) => handleChange('shopTelephone', text)}
              keyboardType="phone-pad"
              accessoryLeft={() => renderIcon('call-outline')}
              caption="10 digits required"
            />
            <Input
              style={styles.input}
              placeholder="Shop Email"
              value={shopData.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
              accessoryLeft={() => renderIcon('mail-outline')}
              caption="Business email"
            />
            <Input
              style={styles.input}
              placeholder="Shop Address"
              value={shopData.shopAdresse}
              onChangeText={(text) => handleChange('shopAdresse', text)}
              accessoryLeft={() => renderIcon('location-outline')}
              caption="Physical location"
            />

            {/* Section Bannière */}
            <Layout style={styles.bannerSection}>
              <Text category="s1" style={styles.sectionTitle}>
                Shop Banner
              </Text>
              {shopData.shopBanner ? (
                <View style={styles.bannerContainer}>
                  <Image
                    source={{ uri: shopData.shopBanner }}
                    style={styles.bannerImage}
                  />
                  <Button
                    size="small"
                    status="danger"
                    onPress={() => setShopData({ ...shopData, shopBanner: null })}
                    style={styles.removeButton}
                  >
                    Remove
                  </Button>
                </View>
              ) : (
                <Button
                  style={styles.uploadButton}
                  onPress={pickImage}
                  accessoryLeft={() => renderIcon('image-outline')}
                >
                  Upload Banner
                </Button>
              )}
            </Layout>

            {/* Bouton de création */}
            <Button
              style={styles.createButton}
              onPress={handleCreateShop}
              disabled={isLoading}
              accessoryRight={isLoading ? () => <Spinner size="small" /> : null}
            >
              {() => (
                <Text style={styles.createButtonText}>
                  {isLoading ? 'Creating...' : 'Create Shop'}
                </Text>
              )}
            </Button>
          </Card>
        </ScrollView>
      </Layout>
    </ApplicationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  headerIconContainer: {
    backgroundColor: '#4FD1C5',
    padding: 15,
    borderRadius: 50,
    marginBottom: 10,
  },
  headerTitle: {
    color: '#2D3748',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#718096',
    fontSize: 14,
  },
  card: {
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#EDF2F7',
    borderColor: '#E2E8F0',
  },
  bannerSection: {
    marginVertical: 15,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    marginBottom: 10,
    color: '#2D3748',
  },
  bannerContainer: {
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  removeButton: {
    width: '40%',
  },
  uploadButton: {
    backgroundColor: '#4FD1C5',
    borderColor: '#4FD1C5',
    borderRadius: 8,
  },
  createButton: {
    marginTop: 20,
    backgroundColor: '#4FD1C5',
    borderColor: '#4FD1C5',
    borderRadius: 8,
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ShopCreationScreen;