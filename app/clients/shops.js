import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';

const ShopsScreen = () => {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();

  const shops = [
    { id: '1', name: 'Noor Boutique', address: '123 Fashion St, Paris', rating: 4.8, image: 'https://images.unsplash.com/photo-1555529669-2263d137507b?q=80&w=1965&auto=format&fit=crop' },
    { id: '2', name: 'Fashion Hub', address: '456 Style Ave, London', rating: 4.5, image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop' },
    { id: '3', name: 'Trendy Wear', address: '789 Chic Rd, New York', rating: 4.9, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1974&auto=format&fit=crop' },
    { id: '4', name: 'Street Style', address: '321 Urban Ln, Tokyo', rating: 4.3, image: 'https://images.unsplash.com/photo-1591219067796-2573f8e8fb01?q=80&w=1974&auto=format&fit=crop' },
    { id: '5', name: 'Elegance Shop', address: '654 Grace Blvd, Milan', rating: 4.7, image: 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?q=80&w=1974&auto=format&fit=crop' },
    { id: '6', name: 'Vintage Vibe', address: '987 Retro St, Berlin', rating: 4.6, image: 'https://images.unsplash.com/photo-1591209623510-3475ab3b69ef?q=80&w=1974&auto=format&fit=crop' },
  ];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleShopPress = (shopId) => {
    console.log(`Navigating to shop ${shopId}`);
    router.push(`clients/shopProfile`); // Navigation vers la page de la boutique
  };

  const renderShopCard = (shop, index) => (
    <Animated.View
      key={shop.id}
      style={[
        styles.shopCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30 * (index + 1), 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => handleShopPress(shop.id)}
        activeOpacity={0.85}
      >
        <Image 
          source={{ uri: shop.image }} 
          style={[styles.shopImage, { width: width * 0.35, height: width * 0.35 }]} 
          resizeMode="cover"
        />
        <View style={styles.shopInfo}>
          <Text style={[styles.shopName, { fontSize: width > 600 ? 20 : 18 }]}>
            {shop.name}
          </Text>
          <View style={styles.addressContainer}>
            <Icon name="map-pin" size={width > 600 ? 16 : 14} color="#666" />
            <Text style={[styles.shopAddress, { fontSize: width > 600 ? 14 : 12 }]}>
              {shop.address}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={width > 600 ? 16 : 14} color="#f1c40f" />
            <Text style={styles.ratingText}>{shop.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { padding: width * 0.04 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { fontSize: width > 600 ? 28 : 24 }]}>
          Boutiques
        </Text>
        {shops.map((shop, index) => renderShopCard(shop, index))}
      </ScrollView>

      <BottomNavigation></BottomNavigation>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  backButton: {
    padding: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
  },
  pageTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  shopCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopImage: {
    borderRadius: 10,
  },
  shopInfo: {
    flex: 1,
    padding: 15,
  },
  shopName: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  shopAddress: {
    color: '#666',
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    elevation: 1,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
 
});

export default ShopsScreen;