// AddProductScreen.js
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';

// Configuration (pourrait être déplacée dans un fichier séparé)
const API_BASE_URL = 'http://195.35.24.128:8081/api';
const DEFAULT_SHOP_ID = '19';

const AddProductScreen = () => {
  const router = useRouter();

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
    const loadUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          setToken(parsedUser.token);
          setUserEmail(parsedUser.email || '');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur :', error);
        Alert.alert('Erreur', 'Impossible de charger les données utilisateur');
      }
    };

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories :', error);
        // Catégories par défaut en cas d'erreur
        setCategories([
          { id: 1, name: 'Électronique' },
          { id: 2, name: 'Vêtements' },
          { id: 3, name: 'Alimentation' },
        ]);
        Alert.alert('Avertissement', 'Impossible de charger les catégories. Utilisation des catégories par défaut.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
    fetchCategories();
  }, [token]);

  const requestMediaPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de la permission pour accéder à votre galerie pour sélectionner une image.',
          [{ text: 'OK' }]
        );
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

      formData.append('libelle', name.trim());
      formData.append('acteurUsername', userEmail || 'bazoum@gmail.com');
      formData.append('codeQr', 'QR' + Date.now());
      formData.append('prix', parseFloat(price));
      formData.append('shopId', DEFAULT_SHOP_ID);
      formData.append('categorieId', category);
      formData.append('quantite', parseInt(stock, 10));
      formData.append('expiredAt', expirationDate.toISOString().split('T')[0]); // Format YYYY-MM-DD
      formData.append('description', description.trim());

      if (photo) {
        const filename = photo.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('image', {
          uri: photo.uri,
          name: filename,
          type: type,
        });
      }

      const response = await fetch(`${API_BASE_URL}/products/new`, {
        method: 'POST',
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

      Alert.alert('Succès', 'Produit ajouté avec succès', [
        { text: 'OK', onPress: () => router.push('/vendeurs/home') },
      ]);
    } catch (error) {
      console.error('Erreur lors de la soumission :', error);
      Alert.alert(
        'Erreur',
        error.message || 'Une erreur est survenue lors de l\'ajout du produit'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <LinearGradient
        colors={['#38A169', '#2D8A5B']}
        style={tw`rounded-b-3xl pt-10 pb-6`}
      >
        <View style={tw`flex-row justify-between items-center px-5`}>
          <Text style={tw`text-3xl font-bold text-white`}>Ajouter un produit</Text>
          <TouchableOpacity
            style={tw`bg-white/20 p-3 rounded-full`}
            onPress={() => router.push('/vendeurs/home')}
            disabled={isLoading}
          >
            <Icon name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={tw`px-4 py-6`}>
        <View style={tw`bg-white rounded-2xl p-5 shadow-md`}>
          {isLoading && (
            <View style={tw`absolute top-0 left-0 right-0 bottom-0 bg-black/30 z-10 justify-center items-center`}>
              <ActivityIndicator size="large" color="#38A169" />
              <Text style={tw`mt-2 text-white font-bold`}>Envoi en cours...</Text>
            </View>
          )}

          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Libellé *</Text>
            <TextInput
              style={tw`mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800`}
              value={name}
              onChangeText={setName}
              placeholder="Nom du produit"
              editable={!isLoading}
            />
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Description</Text>
            <TextInput
              style={tw`mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 h-24 text-gray-800`}
              value={description}
              onChangeText={setDescription}
              placeholder="Description du produit"
              multiline
              editable={!isLoading}
            />
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Prix ($) *</Text>
            <TextInput
              style={tw`mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800`}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Stock *</Text>
            <TextInput
              style={tw`mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800`}
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Date d'expiration</Text>
            <TouchableOpacity
              style={tw`mt-2 flex-row justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-3`}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Text style={tw`text-gray-800`}>{expirationDate.toLocaleDateString()}</Text>
              <Icon name="calendar" size={20} color="#38A169" />
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

          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Catégorie *</Text>
            <View style={tw`mt-2 bg-gray-50 border border-gray-200 rounded-lg`}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={tw`text-gray-800`}
                enabled={!isLoading}
              >
                <Picker.Item label="Sélectionner une catégorie" value="" />
                {categories.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Photo</Text>
            <TouchableOpacity
              style={tw`mt-2 flex-row items-center bg-gray-50 border border-gray-200 rounded-lg p-3`}
              onPress={pickImage}
              disabled={isLoading}
            >
              <Icon name="upload" size={20} color="#38A169" />
              <Text style={tw`ml-2 text-green-600`}>
                {photo ? 'Changer la photo' : 'Choisir une photo'}
              </Text>
            </TouchableOpacity>
            {photo && (
              <Image
                source={{ uri: photo.uri }}
                style={tw`mt-3 w-full h-48 rounded-lg border border-gray-200`}
              />
            )}
          </View>

          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#38A169', '#2D8A5B']}
              style={tw`rounded-lg p-4 items-center`}
            >
              <Text style={tw`text-lg font-bold text-white`}>
                {isLoading ? 'Traitement...' : 'Ajouter le produit'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddProductScreen;