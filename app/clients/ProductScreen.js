import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavigation from './components/BottomNavigation';

const ProductScreen = () => {
  const { productId } = useLocalSearchParams();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgUrl, setImageUrl] = useState('');

  const convertPathToUrl = (dbPath) => {
    if (!dbPath || typeof dbPath !== "string") {
      console.error("Chemin invalide:", dbPath);
      return "";
    }
    const basePath = "/root/data/drive/products/";
    const baseUrl = "http://alphatek.fr:8086/";
    return dbPath.startsWith(basePath) ? dbPath.replace(basePath, baseUrl) : dbPath;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (!token) {
          throw new Error("Token non disponible");
        }
        const API_URL = `http://195.35.24.128:8081/api/products/findByID/${productId}?username=${userEmail}`;
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Impossible de récupérer les détails du produit pour le moment.");
        }
        const data = await response.json();
        setProduct(data.data);
        setImageUrl(convertPathToUrl(data.data.imagePath));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId && token) {
      fetchProduct();
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [productId, token, fadeAnim]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const userToken = await AsyncStorage.getItem("user");
        if (!userToken) {
          console.error("Aucun token trouvé");
          return;
        }
        const parsedToken = JSON.parse(userToken);
        setToken(parsedToken.token);
        setUserEmail(parsedToken.email);
      } catch (error) {
        console.error("Erreur lors de la récupération du token :", error.message);
      }
    };
    fetchToken();
  }, []);

  const handleAddToCart = () => {
    if (product) {
      console.log(`Added ${product.libelle} to cart`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Chargement en cours...</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <SafeAreaView style={styles.errorContainer}>
          <Icon name="info" size={40} color="#6B7280" />
          <Text style={styles.errorText}>
            {error || "Oups, ce produit semble introuvable pour l’instant."}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backErrorButton}>
            <Text style={styles.backErrorText}>Revenir en arrière</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      {/* Image at the top, outside SafeAreaView to go edge-to-edge */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imgUrl || 'https://via.placeholder.com/400' }}
          style={[styles.productImage, { height: height * 0.5 }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.4)', 'transparent']}
          style={styles.imageOverlay}
        />
      </View>

      {/* Wrap the rest of the content in SafeAreaView */}
      <SafeAreaView style={styles.scrollContainer}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Empty Viewme to ensure the details container starts right after the image */}
          <View style={{ height: height * 0.5 }} />

          <Animated.View style={[styles.detailsContainer, { opacity: fadeAnim }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.productName, { fontSize: width > 600 ? 30 : 26 }]}>
                {product.libelle}
              </Text>
              <TouchableOpacity style={styles.favoriteButton}>
                <Icon name="heart" size={width > 600 ? 26 : 22} color="#e74c3c" />
              </TouchableOpacity>
            </View>

            <View style={styles.shopRatingContainer}>
              <Text style={[styles.productShop, { fontSize: width > 600 ? 16 : 14 }]}>
                {product.boutiqueNom || 'Boutique inconnue'}
              </Text>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={width > 600 ? 16 : 14} color="#f1c40f" />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
            </View>

            <Text style={[styles.productPrice, { fontSize: width > 600 ? 28 : 24 }]}>
              ${product.prix.toFixed(2)}
            </Text>

            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={[styles.productDescription, { fontSize: width > 600 ? 16 : 14 }]}>
                {product.description || 'Aucune description disponible.'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addToCartButton}
              activeOpacity={0.9}
              onPress={handleAddToCart}
            >
              <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                style={styles.buttonGradient}
              >
                <Icon name="shopping-cart" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        <View style={styles.bottomNavigationContainer}>
          <BottomNavigation />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#111827',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  backErrorButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  backErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'absolute', // Position the image absolutely to stretch to the top
    top: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  productImage: {
    width: '100%',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  detailsContainer: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontWeight: '800',
    color: '#111827',
  },
  favoriteButton: {
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  shopRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productShop: {
    color: '#6B7280',
    marginRight: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingText: {
    marginLeft: 6,
    color: '#111827',
    fontWeight: '600',
  },
  productPrice: {
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 20,
  },
  descriptionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  productDescription: {
    color: '#6B7280',
    lineHeight: 24,
  },
  addToCartButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonIcon: {
    marginRight: 12,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomNavigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});

export default ProductScreen;