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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const ProductScreen = () => {
  const { productId } = useLocalSearchParams();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const router = useRouter();

  const products = [
    { id: '1', name: 'T-Shirt Black', price: 29.99, shop: 'Noor Boutique', image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?q=80&w=1887&auto=format&fit=crop' },
    { id: '2', name: 'Jeans Blue', price: 59.99, shop: 'Fashion Hub', image: 'https://plus.unsplash.com/premium_photo-1667049290968-d0e2b9c36e01?q=80&w=1974&auto=format&fit=crop' },
    { id: '3', name: 'Sneakers White', price: 89.99, shop: 'Trendy Wear', image: 'https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?q=80&w=1974&auto=format&fit=crop' },
    { id: '4', name: 'Jacket Leather', price: 129.99, shop: 'Noor Boutique', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1965&auto=format&fit=crop' },
    { id: '5', name: 'Cap Gray', price: 19.99, shop: 'Street Style', image: 'https://images.unsplash.com/photo-1606115757624-6b9bfe9fa5e4?q=80&w=500&auto=format&fit=crop' },
    { id: '6', name: 'Hoodie Red', price: 49.99, shop: 'Fashion Hub', image: 'https://images.unsplash.com/photo-1618453292459-53424b66bb6a?q=80&w=1964&auto=format&fit=crop' },
  ];

  const product = products.find(item => item.id === productId) || products[0];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleAddToCart = () => {
    console.log(`Added ${product.name} to cart`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: height * 0.15 }]}>
        {/* Image produit avec ombre */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image }} 
            style={[styles.productImage, { height: height * 0.45 }]} 
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Détails */}
        <Animated.View style={[styles.detailsContainer, { opacity: fadeAnim, padding: width * 0.04 }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.productName, { fontSize: width > 600 ? 28 : 24 }]}>
              {product.name}
            </Text>
            <TouchableOpacity style={styles.favoriteButton}>
              <Icon name="heart" size={width > 600 ? 24 : 20} color="#e74c3c" />
            </TouchableOpacity>
          </View>

          <View style={styles.shopRatingContainer}>
            <Text style={[styles.productShop, { fontSize: width > 600 ? 16 : 14 }]}>
              {product.shop}
            </Text>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={width > 600 ? 16 : 14} color="#f1c40f" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>
          
          <Text style={[styles.productPrice, { fontSize: width > 600 ? 26 : 22 }]}>
            ${product.price.toFixed(2)}
          </Text>

          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={[styles.productDescription, { fontSize: width > 600 ? 16 : 14 }]}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
          </View>

          {/* Bouton Add to Cart */}
          <TouchableOpacity 
            style={styles.addToCartButton}
            activeOpacity={0.85}
            onPress={handleAddToCart}
          >
            <LinearGradient
              colors={['#2ecc71', '#27ae60']}
              style={styles.buttonGradient}
            >
              <Icon name="shopping-cart" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'home', label: 'Home', route: '/clients/home' },
          { icon: 'search', label: 'Search', route: '/clients/shops' },
          { icon: 'shopping-cart', label: 'Cart', route: '/clients/cart' },
          { icon: 'user', label: 'Profile', route: '/clients/profile' },
        ].map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.navItem}
            onPress={() => router.push(item.route)}
          >
            <Icon name={item.icon} size={24} color="#2ecc71" />
            <Text style={styles.navText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Scroll Content
  scrollContent: {},
  imageContainer: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  // Details
  detailsContainer: {
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -15,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontWeight: 'bold',
    color: '#333',
  },
  favoriteButton: {
    padding: 5,
  },
  shopRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  productShop: {
    color: '#666',
    marginRight: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    elevation: 1,
  },
  ratingText: {
    marginLeft: 6,
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  productPrice: {
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 20,
  },
  descriptionCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  productDescription: {
    color: '#666',
    lineHeight: 22,
  },
  // Add to Cart Button
  addToCartButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 3,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  buttonIcon: {
    marginRight: 10,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    padding: 5,
  },
  navText: {
    fontSize: 12,
    color: '#2ecc71',
    marginTop: 4,
  },
});

export default ProductScreen;