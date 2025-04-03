import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../../AuthContext';

import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from './components/BottomNavigation';

const API_BASE_URL = 'http://195.35.24.128:8081/api';

const AddProductScreen = () => {
  const router = useRouter();

  // États du composant
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [photo, setPhoto] = useState(null);
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [shopId, setShopId] = useState(null);

  // Charger les données utilisateur et la boutique au montage
  useEffect(() => {
    const loadUserDataAndShop = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (!user) {
          throw new Error('Aucun utilisateur trouvé dans AsyncStorage');
        }

        const parsedUser = user ? JSON.parse(user) : null;        console.log("Type de parsedUser :", typeof parsedUser);
console.log("Contenu de parsedUser :", parsedUser.id);
console.log("Contenu id :", parsedUser.token);

        setToken(parsedUser.token || '');
        setUserEmail(parsedUser.email || '');
        setUserId(parsedUser.id || '');

        // Récupérer l'ID de la boutique
        const shopResponse = await fetch(`${API_BASE_URL}/shop/findByVendeur/${parsedUser.id}`, {
          headers: {
            'Authorization': `Bearer ${parsedUser.token}`,
          },
        });

        if (!shopResponse.ok) {
          throw new Error(`Erreur ${shopResponse.status} lors de la récupération de la boutique`);
        }

        const shopData = await shopResponse.json();
        if (shopData.status === 'success' && shopData.data) {
          setShopId(shopData.data.id);
          await AsyncStorage.setItem("Shop", JSON.stringify(shopData.data.id));

        } else {
          throw new Error('Aucune boutique trouvée');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur ou boutique :', error);
        Alert.alert('Erreur', 'Impossible de charger les données utilisateur ou de la boutique');
      }
    };

    loadUserDataAndShop();
  }, []); // Dépendances vides car exécuté une seule fois au montage

  // Charger les catégories une fois que token et userEmail sont disponibles
  useEffect(() => {
    const fetchCategories = async () => {
      if (!token || !userEmail) return; // Attendre que les données soient prêtes

      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/productCategories/liste?username=${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }

        const data = await response.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories :', error);
        Alert.alert('Avertissement', 'Impossible de charger les catégories.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [token, userEmail]); // Dépendances explicites

  // Demander la permission d'accès à la galerie
  const requestMediaPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à votre galerie.');
        return false;
      }
    }
    return true;
  };

  // Sélectionner une image depuis la galerie
  const pickImage = async () => {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image :', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  // Gérer le changement de date
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || expirationDate;
    setShowDatePicker(Platform.OS === 'ios');
    setExpirationDate(currentDate);
  };

  // Valider le formulaire
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour le produit');
      return false;
    }
    if (!price || isNaN(parseFloat(price))) {
      Alert.alert('Erreur', 'Veuillez saisir un prix valide');
      return false;
    }
    if (!stock || isNaN(parseInt(stock, 10))) {
      Alert.alert('Erreur', 'Veuillez saisir une quantité valide');
      return false;
    }
    if (!category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }
    if (!shopId) {
      Alert.alert('Erreur', 'ID de la boutique non disponible');
      return false;
    }
    return true;
  };

  // Soumettre le formulaire
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    setIsLoading(true);

    const formData = new FormData();
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    };

    // Ajouter les champs texte au FormData
    formData.append('libelle', name.trim());
    formData.append('acteurUsername', userEmail);
    formData.append('codeQr', `QR${Date.now()}`);
    formData.append('prix', parseFloat(price));
    formData.append('shopId', shopId);
    formData.append('categorieId', category);
    formData.append('quantite', parseInt(stock, 10));
    formData.append('expiredAt', formatDate(expirationDate));
    formData.append('description', description.trim());

    // Ajouter l'image si elle existe
    if (photo) {
      const filename = photo.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg'; // Par défaut à jpeg si extension non détectée

      formData.append('image', {
        uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri, // Correction pour iOS
        name: filename,
        type,
      });
    }

    const response = await fetch(`${API_BASE_URL}/products/new`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Ne pas définir 'Content-Type' manuellement : Fetch le fait automatiquement avec FormData
        'Accept': 'application/json',
      },
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || `Erreur ${response.status}`);
    }

    Alert.alert('Succès', 'Produit ajouté avec succès', [
      { text: 'OK', onPress: () => router.push('/vendeurs/home') },
    ]);
  } catch (error) {
    console.error('Erreur lors de la soumission :', error);
    Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de l\'ajout du produit');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient colors={['#fff', '#F9FAFB']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Ajouter un produit</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/vendeurs/home')}
            disabled={isLoading}
          >
            <Icon name="arrow-left" size={20} color="#111827" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Envoi en cours...</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Libellé *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nom du produit"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description du produit"
              multiline
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Prix ($) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Stock *</Text>
            <TextInput
              style={styles.input}
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date d'expiration</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Text style={styles.dateText}>{expirationDate.toLocaleDateString()}</Text>
              <Icon name="calendar" size={20} color="#4CAF50" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={expirationDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Catégorie *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={styles.picker}
                enabled={!isLoading}
              >
                <Picker.Item label="Sélectionner une catégorie" value="" />
                {categories.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.intitule} value={cat.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Photo</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={isLoading}>
              <Icon name="upload" size={20} color="#4CAF50" />
              <Text style={styles.uploadText}>{photo ? 'Changer la photo' : 'Choisir une photo'}</Text>
            </TouchableOpacity>
            {photo && <Image source={{ uri: photo.uri }} style={styles.previewImage} />}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !shopId}
            style={styles.submitButton}
          >
            <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.submitGradient}>
              <Text style={styles.submitText}>{isLoading ? 'Traitement...' : 'Ajouter le produit'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  backButton: { padding: 8, backgroundColor: '#E5E7EB', borderRadius: 10 },
  scrollContent: { padding: 16, paddingBottom: 80 },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: { marginTop: 8, color: '#fff', fontWeight: '600' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  dateText: { fontSize: 16, color: '#111827' },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: { height: 50, color: '#111827' },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  uploadText: { marginLeft: 8, fontSize: 16, color: '#4CAF50' },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 12,
  },
  submitButton: { borderRadius: 8, overflow: 'hidden' },
  submitGradient: { padding: 16, alignItems: 'center' },
  submitText: { fontSize: 18, fontWeight: '600', color: '#fff' },
});

export default AddProductScreen;