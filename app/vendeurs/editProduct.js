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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from './components/BottomNavigation';

// Configuration
const API_BASE_URL = 'http://195.35.24.128:8081/api';
const DEFAULT_SHOP_ID = '19';

const EditProductScreen = () => {
  const router = useRouter();
  const { productId } = useLocalSearchParams(); // Récupérer l'ID du produit depuis les paramètres

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [photo, setPhoto] = useState(null);
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const loadUserDataAndProduct = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          setToken(parsedUser.token);
          setUserEmail(parsedUser.email || '');
        }
        await fetchProductData();
        await fetchCategories();
      } catch (error) {
        console.error('Erreur lors du chargement initial :', error);
        Alert.alert('Erreur', 'Impossible de charger les données');
      }
    };

    const fetchProductData = async () => {
      if (!productId) return;
      setIsLoading(true);
      try {
        const response = await fetch(`http://195.35.24.128:8081/api/products/findByID/${productId}?username=${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Erreur lors de la récupération du produit');
        const data = await response.json();
        const product = data.data;
        setName(product.libelle || '');
        setDescription(product.description || '');
        setPrice(product.prix.toString() || '');
        setStock(product.quantite.toString() || '');
        setCategory(product.categorieId || '');
        setExpirationDate(new Date(product.expiredAt) || new Date());
        if (product.imageUrl) setPhoto({ uri: product.imageUrl });
      } catch (error) {
        console.error('Erreur fetchProductData :', error);
        Alert.alert('Erreur', 'Impossible de charger les données du produit');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(`http://195.35.24.128:8081/api/productCategories/liste?username=${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Erreur lors de la récupération des catégories');
        const data = await response.json();
        setCategories(data.data);
      } catch (error) {
        console.error('Erreur fetchCategories :', error);
        Alert.alert('Avertissement', 'Impossible de charger les catégories');
      }
    };

    loadUserDataAndProduct();
  }, [token, productId, userEmail]);

  const requestMediaPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Permission nécessaire pour accéder à la galerie.');
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image :', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || expirationDate;
    setShowDatePicker(Platform.OS === 'ios');
    setExpirationDate(currentDate);
  };

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
    return true;
  };

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

      formData.append('id', productId);
      formData.append('libelle', name.trim());
      formData.append('acteurUsername', userEmail || 'bazoum@gmail.com');
      formData.append('prix', parseFloat(price));
      formData.append('shopId', '19');
      formData.append('categorieId', category);
      formData.append('quantite', parseInt(stock, 10));
      formData.append('expiredAt', formatDate(expirationDate));
      formData.append('description', description.trim());

      if (photo && photo.uri && !photo.uri.startsWith('http')) {
        const filename = photo.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('image', {
          uri: photo.uri,
          name: filename,
          type: type,
        });
      }

      const response = await fetch(`http://195.35.24.128:8081/api/products/update/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Erreur ${response.status}`);
      }

      Alert.alert('Succès', 'Produit modifié avec succès', [
        { text: 'OK', onPress: () => router.push('/vendeurs/home') },
      ]);
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['#fff', '#F9FAFB']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Modifier un produit</Text>
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
              <Text style={styles.loadingText}>Chargement...</Text>
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
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
              disabled={isLoading}
            >
              <Icon name="upload" size={20} color="#4CAF50" />
              <Text style={styles.uploadText}>
                {photo ? 'Changer la photo' : 'Choisir une photo'}
              </Text>
            </TouchableOpacity>
            {photo && (
              <Image
                source={{ uri: photo.uri }}
                style={styles.previewImage}
              />
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submitButton}
          >
            <LinearGradient
              colors={['#4CAF50', '#388E3C']}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>
                {isLoading ? 'Traitement...' : 'Modifier le produit'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Même styles que dans AddProductScreen
  safeContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
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
  loadingText: {
    marginTop: 8,
    color: '#fff',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
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
  dateText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#111827',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  uploadText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4CAF50',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 12,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EditProductScreen;