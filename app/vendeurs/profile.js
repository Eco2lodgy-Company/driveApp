// SellerProfileScreen.js
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
import tw from 'twrnc'; // Assurez-vous d'avoir installé twrnc : npm install twrnc

const SellerProfileScreen = () => {
  const router = useRouter();

  const [shopProfile, setShopProfile] = useState({
    name: 'Boutique Éco Chic',
    description: 'Vêtements et accessoires durables fabriqués avec amour.',
    email: 'contact@ecochic.com',
    phone: '+33 6 12 34 56 78',
    address: '12 Rue Verte, 75001 Paris, France',
    bannerImage: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
  });

  const [fadeAnims] = useState([
    new Animated.Value(0), // Nom/Boutons
    new Animated.Value(0), // Description
    new Animated.Value(0), // Email
    new Animated.Value(0), // Téléphone
    new Animated.Value(0), // Adresse
    new Animated.Value(0), // Déconnexion
  ]);

  useEffect(() => {
    const animations = fadeAnims.map((anim) =>
      Animated.spring(anim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      })
    );
    Animated.stagger(150, animations).start();
  }, []);

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Vous avez été déconnecté avec succès.');
    router.push('/login');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <ScrollView contentContainerStyle={tw`pb-32`}>
        {/* En-tête immersif */}
        <View style={tw`relative`}>
          <LinearGradient
            colors={['#38A169', '#1D5438']}
            style={tw`pt-14 pb-48 rounded-b-[40px] shadow-2xl`}
          >
            <View style={tw`flex-row justify-between items-center px-6`}>
              <TouchableOpacity
                style={tw`bg-white/25 rounded-full p-2.5 shadow-md`}
                onPress={() => router.push('/sellers/home')}
              >
                <Icon name="arrow-left" size={26} color="#fff" />
              </TouchableOpacity>
              <Animated.Text
                style={[
                  tw`text-4xl font-extrabold text-white tracking-tight shadow-lg`,
                  {
                    opacity: fadeAnims[0],
                    transform: [
                      {
                        translateY: fadeAnims[0].interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {shopProfile.name}
              </Animated.Text>
              <View style={tw`w-10`} />
            </View>
          </LinearGradient>
          <Image
            source={{ uri: shopProfile.bannerImage }}
            style={tw`absolute top-24 left-6 right-6 h-44 rounded-2xl border-4 border-white/90 shadow-xl`}
            resizeMode="cover"
          />
          <View style={tw`absolute bottom-[-10px] left-0 right-0 h-12 bg-gray-50 rounded-t-[40px] shadow-md`} />
        </View>

        {/* Contenu principal */}
        <View style={tw`px-6 mt-[-12]`}>
          {/* Description */}
          <Animated.View
            style={[
              tw`flex-row items-center bg-white/95 rounded-3xl p-5 mb-5 shadow-lg border border-green-100`,
              {
                opacity: fadeAnims[1],
                transform: [
                  {
                    translateY: fadeAnims[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon name="info" size={26} color="#38A169" style={tw`mr-4`} />
            <Text style={tw`text-gray-900 text-lg font-medium flex-1 leading-6`}>
              {shopProfile.description}
            </Text>
          </Animated.View>

          {/* Email */}
          <Animated.View
            style={[
              tw`flex-row items-center bg-white/95 rounded-3xl p-5 mb-5 shadow-lg border border-green-100`,
              {
                opacity: fadeAnims[2],
                transform: [
                  {
                    translateY: fadeAnims[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon name="mail" size={26} color="#38A169" style={tw`mr-4`} />
            <Text style={tw`text-gray-900 text-lg font-medium flex-1`}>
              {shopProfile.email}
            </Text>
          </Animated.View>

          {/* Téléphone */}
          <Animated.View
            style={[
              tw`flex-row items-center bg-white/95 rounded-3xl p-5 mb-5 shadow-lg border border-green-100`,
              {
                opacity: fadeAnims[3],
                transform: [
                  {
                    translateY: fadeAnims[3].interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon name="phone" size={26} color="#38A169" style={tw`mr-4`} />
            <Text style={tw`text-gray-900 text-lg font-medium flex-1`}>
              {shopProfile.phone}
            </Text>
          </Animated.View>

          {/* Adresse */}
          <Animated.View
            style={[
              tw`flex-row items-center bg-white/95 rounded-3xl p-5 mb-5 shadow-lg border border-green-100`,
              {
                opacity: fadeAnims[4],
                transform: [
                  {
                    translateY: fadeAnims[4].interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon name="map-pin" size={26} color="#38A169" style={tw`mr-4`} />
            <Text style={tw`text-gray-900 text-lg font-medium flex-1 leading-6`}>
              {shopProfile.address}
            </Text>
          </Animated.View>

          {/* Boutons d’action */}
          <View style={tw`mt-6 flex-row justify-between`}>
            <Animated.View
              style={[
                tw`flex-1 mr-2`,
                {
                  opacity: fadeAnims[0],
                  transform: [
                    {
                      translateY: fadeAnims[0].interpolate({
                        inputRange: [0, 1],
                        outputRange: [60, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={tw`rounded-2xl overflow-hidden shadow-xl`}
                onPress={() => router.push('/sellers/edit-profile')}
              >
                <LinearGradient
                  colors={['#38A169', '#1D5438']}
                  style={tw`flex-row items-center justify-center py-4`}
                >
                  <Icon name="edit-2" size={22} color="#fff" />
                  <Text style={tw`text-white text-lg font-semibold ml-2`}>
                    Modifier
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                tw`flex-1 ml-2`,
                {
                  opacity: fadeAnims[5],
                  transform: [
                    {
                      translateY: fadeAnims[5].interpolate({
                        inputRange: [0, 1],
                        outputRange: [60, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={tw`rounded-2xl overflow-hidden shadow-xl`}
                onPress={handleLogout}
              >
                <LinearGradient
                  colors={['#E74C3C', '#B71C1C']}
                  style={tw`flex-row items-center justify-center py-4`}
                >
                  <Icon name="log-out" size={22} color="#fff" />
                  <Text style={tw`text-white text-lg font-semibold ml-2`}>
                    Déconnexion
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
};

export default SellerProfileScreen;