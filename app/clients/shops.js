import React, { useState } from 'react';
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
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';

const ShopsScreen = () => {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const shops = [
    { id: '1', name: 'Noor Boutique', address: '123 Fashion St, Paris', rating: 4.8, category: 'Luxe', image: 'https://images.unsplash.com/photo-1555529669-2263d137507b?q=80&w=1965&auto=format&fit=crop' },
    { id: '2', name: 'Fashion Hub', address: '456 Style Ave, London', rating: 4.5, category: 'Casual', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop' },
    { id: '3', name: 'Trendy Wear', address: '789 Chic Rd, New York', rating: 4.9, category: 'Luxe', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1974&auto=format&fit=crop' },
    { id: '4', name: 'Street Style', address: '321 Urban Ln, Tokyo', rating: 4.3, category: 'Streetwear', image: 'https://images.unsplash.com/photo-1591219067796-2573f8e8fb01?q=80&w=1974&auto=format&fit=crop' },
    { id: '5', name: 'Elegance Shop', address: '654 Grace Blvd, Milan', rating: 4.7, category: 'Luxe', image: 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?q=80&w=1974&auto=format&fit=crop' },
    { id: '6', name: 'Vintage Vibe', address: '987 Retro St, Berlin', rating: 4.6, category: 'Vintage', image: 'https://images.unsplash.com/photo-1591209623510-3475ab3b69ef?q=80&w=1974&auto=format&fit=crop' },
  ];

  const categories = [
    { id: 'all', label: 'Toutes' },
    { id: 'Luxe', label: 'Luxe' },
    { id: 'Casual', label: 'Casual' },
    { id: 'Streetwear', label: 'Streetwear' },
    { id: 'Vintage', label: 'Vintage' },
  ];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shop.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || shop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleShopPress = (shopId) => {
    router.push(`clients/shopProfile`);
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

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category.id && styles.categoryTextActive,
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { fontSize: width > 600 ? 28 : 24 }]}>
          Boutiques
        </Text>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une boutique..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map(renderCategoryButton)}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { padding: width * 0.04 }]}
      >
        {filteredShops.length > 0 ? (
          filteredShops.map((shop, index) => renderShopCard(shop, index))
        ) : (
          <Text style={styles.noResults}>Aucune boutique trouvée</Text>
        )}
        {/* Espace supplémentaire pour le dernier élément */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Réduit légèrement pour éviter un espace trop grand
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
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryScrollContent: {
    paddingRight: 15,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#2ecc71', // Vert pour la catégorie active
    borderColor: '#2ecc71',
  },
  categoryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
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
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  bottomSpacer: {
    height: 80, // Espace supplémentaire pour s'assurer que le dernier élément soit visible
  },
});

export default ShopsScreen;