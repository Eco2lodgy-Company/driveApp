import React, { useState, useEffect } from 'react';
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

const SellerProfileScreen = () => {
  const router = useRouter();

  const [shopProfile] = useState({
    name: 'Éco Chic',
    description: 'Mode durable et responsable.',
    email: 'contact@ecochic.com',
    phone: '+33 6 12 34 56 78',
    address: '12 Rue Verte, Paris, France',
    bannerImage: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
  });

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Vous avez été déconnecté avec succès.');
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
              <Text style={tw`text-3xl font-bold text-white`}>{shopProfile.name}</Text>
              <View style={tw`w-10`} />
            </View>
          </LinearGradient>
          <Image source={{ uri: shopProfile.bannerImage }} style={tw`absolute top-40 left-6 right-6 h-40 rounded-xl border-4 border-white shadow-lg`} resizeMode="cover" />
        </View>

        {/* Infos Boutique */}
        <Animated.View style={[tw`px-6`, { opacity: fadeAnim }]}>  
          {[
            { icon: 'info', label: shopProfile.description },
            { icon: 'mail', label: shopProfile.email },
            { icon: 'phone', label: shopProfile.phone },
            { icon: 'map-pin', label: shopProfile.address },
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
