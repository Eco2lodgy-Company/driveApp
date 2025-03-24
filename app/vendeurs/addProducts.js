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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ajout d'AsyncStorage
import tw from 'twrnc';

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

  useEffect(() => {
    const loadToken = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          setToken(parsedUser.token);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du token :', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('https://api.example.com/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories :', error);
        setCategories([
          { id: 1, name: 'Électronique' },
          { id: 2, name: 'Vêtements' },
          { id: 3, name: 'Alimentation' },
        ]);
      }
    };

    loadToken();
    fetchCategories();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || expirationDate;
    setShowDatePicker(Platform.OS === 'ios');
    setExpirationDate(currentDate);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      formData.append('libelle', name);
      formData.append('acteurUsername', 'bazoum@gmail.com');
      formData.append('codeQr', 'QR' + Date.now());
      formData.append('prix', parseFloat(price) || 0);
      formData.append('shopId', '19');
      formData.append('categorieId', category || '0');
      formData.append('quantite', parseInt(stock, 10) || 0);
      formData.append('expiredAt', expirationDate.toISOString());
      formData.append('description', description);

      if (photo) {
        const filename = photo.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/png`;

        formData.append('image', {
          uri: photo.uri,
          name: filename,
          type: type,
        });
      }

      // Pour déboguer FormData (car console.log ne fonctionne pas bien)
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${JSON.stringify(value)}`);
      }
      console.log('Token utilisé :', token);

      const response = await fetch('http://195.35.24.128:8081/api/products/new', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/hal+json',
          // Ne pas définir 'Content-Type' manuellement avec FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Produit ajouté avec succès :', result);
      router.push('/vendeurs/home');
    } catch (error) {
      console.error('Erreur lors de la soumission :', error);
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
          >
            <Icon name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={tw`px-4 py-6`}>
        <View style={tw`bg-white rounded-2xl p-5 shadow-md`}>
          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Libellé</Text>
            <TextInput
              style={tw`mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800`}
              value={name}
              onChangeText={setName}
              placeholder="Nom du produit"
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
            />
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Prix ($)</Text>
            <TextInput
              style={tw`mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800`}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Stock</Text>
            <TextInput
              style={tw`mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800`}
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Date d'expiration</Text>
            <TouchableOpacity
              style={tw`mt-2 flex-row justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-3`}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={tw`text-gray-800`}>{expirationDate.toLocaleDateString()}</Text>
              <Icon name="calendar" size={20} color="#38A169" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={expirationDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={tw`mb-5`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Catégorie</Text>
            <View style={tw`mt-2 bg-gray-50 border border-gray-200 rounded-lg`}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={tw`text-gray-800`}
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
            >
              <Icon name="upload" size={20} color="#38A169" />
              <Text style={tw`ml-2 text-green-600`}>Choisir une photo</Text>
            </TouchableOpacity>
            {photo && (
              <Image
                source={{ uri: photo.uri }}
                style={tw`mt-3 w-full h-48 rounded-lg border border-gray-200`}
              />
            )}
          </View>

          <TouchableOpacity onPress={handleSubmit}>
            <LinearGradient
              colors={['#38A169', '#2D8A5B']}
              style={tw`rounded-lg p-4 items-center`}
            >
              <Text style={tw`text-lg font-bold text-white`}>Ajouter le produit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddProductScreen;