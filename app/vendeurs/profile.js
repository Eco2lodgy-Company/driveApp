import React, { useState, useEffect,useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';
import tw from 'twrnc';
import { AuthContext } from '../../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SellerProfileScreen = () => {
  const router = useRouter();
  const { logout } = useContext(AuthContext);
const [imgUrl, setImageUrl] = useState(null);
  const [shopProfile,setUserProfile] = useState([]);

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const convertPathToUrl = (dbPath) => {
    if (!dbPath || typeof dbPath !== "string") {
        console.error("Chemin invalide:", dbPath);
        return ""; // Retourner une chaîne vide pour éviter l'erreur
    }

    const basePath = "/root/data/drive/shop/";
    const baseUrl = "http://alphatek.fr:8080/";

    return dbPath.startsWith(basePath) ? dbPath.replace(basePath, baseUrl) : dbPath;
};


// Exemple d'utilisation
const imagePath = shopProfile.bannerPath;

console.log(imgUrl);


  const fetchShopData = async (id, token) => {
    try {
      const response = await fetch(`http://195.35.24.128:8081/api/shop/find/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Données reçues :", data);
        setUserProfile(data.data);
        const imageUrl = convertPathToUrl(imagePath);
        setImageUrl(imageUrl);
    } catch (error) {
      console.error("Erreur :", error.message);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userToken = await AsyncStorage.getItem("user");
  
        if (!userToken) {
          console.error("Aucun token trouvé");
          return;
        }
  
        const parsedToken = JSON.parse(userToken); // Convertir en objet JS
        console.log("Token trouvé :", parsedToken.token);
        await fetchShopData(19, parsedToken.token); // Appel avec ID et token
      } catch (error) {
        console.error("Erreur lors de la récupération du token :", error.message);
      }
    };
  
    fetchData();
  }, []);
  
  
  

 

  

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Vous avez été déconnecté avec succès.');
    logout();
    router.push('/login');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <ScrollView contentContainerStyle={tw`pb-24`}>
        {/* En-tête */}
        <View style={tw`relative mb-16`}>
          <LinearGradient colors={['#6D28D9', '#4C1D95']} style={tw`h-64 rounded-b-[40px] shadow-lg`}>
            <View style={tw`flex-row justify-between items-center px-6 pt-14`}>
              <TouchableOpacity onPress={() => router.push('/sellers/home')}>
                <Icon name="arrow-left" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={tw`text-3xl font-bold text-white`}>{shopProfile.nom}</Text>
              <View style={tw`w-10`} />
            </View>
          </LinearGradient>
          <Image source={{ uri: imgUrl }} style={tw`absolute top-40 left-6 right-6 h-40 rounded-xl border-4 border-white shadow-lg`} resizeMode="cover" />
        </View>

        {/* Infos Boutique */}
        <Animated.View style={[tw`px-6`, { opacity: fadeAnim }]}>  
          {[
            { icon: 'info', label: shopProfile.description },
            { icon: 'mail', label: shopProfile.email },
            { icon: 'phone', label: shopProfile.telephone },
            { icon: 'map-pin', label: shopProfile.adresse },
          ].map((item, index) => (
            <View key={index} style={tw`flex-row items-center bg-white rounded-2xl p-5 mb-4 shadow-md border border-gray-200`}>
              <Icon name={item.icon} size={24} color="#6D28D9" style={tw`mr-4`} />
              <Text style={tw`text-gray-900 text-lg font-medium flex-1`}>{item.label}</Text>
            </View>
          ))}

          {/* Boutons */}
          <View style={tw`mt-6 flex-row justify-between`}>  
            <TouchableOpacity onPress={() => router.push('/sellers/edit-profile')} style={tw`flex-1 bg-purple-700 rounded-xl py-4 mr-2 shadow-lg`}>
              <Text style={tw`text-white text-center text-lg font-semibold`}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={tw`flex-1 bg-red-600 rounded-xl py-4 ml-2 shadow-lg`}>
              <Text style={tw`text-white text-center text-lg font-semibold`}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

export default SellerProfileScreen;
