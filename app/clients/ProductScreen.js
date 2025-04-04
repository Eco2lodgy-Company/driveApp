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
  Alert,
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
  const [userId, setUserId] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgUrl, setImageUrl] = useState('');
  const [quantity, setQuantity] = useState(1);

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
        setUserId(parsedToken.id);
      } catch (error) {
        console.error("Erreur lors de la récupération du token :", error.message);
      }
    };
    fetchToken();
  }, []);

  const handleAddToCart = async () => {
    if (!product || !userId || !token) {
      Alert.alert('Erreur', 'Informations utilisateur ou produit manquantes');
      return;
    }
  
    try {
      // Vérification du panier existant
      const checkResponse = await fetch(`http://195.35.24.128:8081/api/paniers/client/liste/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/hal+json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        throw new Error(`Erreur vérification panier: ${errorText}`);
      }
  
      const cartData = await checkResponse.json();
      console.log('Réponse complète de l\'API liste:', JSON.stringify(cartData, null, 2));
  
      if (!cartData?.data || !Array.isArray(cartData.data)) {
        throw new Error('Structure de réponse invalide');
      }
  
      if (cartData.data.length === 0) {
        // Création d'un nouveau panier
        const createResponse = await fetch('http://195.35.24.128:8081/api/paniers/client/new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            produits: [{
              idProduit: product.id,
              quantite: quantity,
              dateAjout: new Date().toISOString()
            }],
            clientId: userId
          })
        });
  
        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(`Erreur création: ${errorText}`);
        }
  
        Alert.alert('Succès', `${product.libelle} ajouté à un nouveau panier`);
      } else {
        // Mise à jour du panier existant
        const existingCart = cartData.data[0];
        console.log('Panier existant extrait:', JSON.stringify(existingCart, null, 2));
        
        // Récupération et filtrage des produits existants
        const existingProductsRaw = existingCart.produits || [];
        const existingProducts = existingProductsRaw.map(product => ({
          idProduit: product.idProduit,
          quantite: product.quantite,
          dateAjout: product.dateAjout
        }));
        
        // Vérifier si le produit existe déjà
        const productIndex = existingProducts.findIndex(p => p.idProduit === product.id);
        
        let updatedProducts;
        if (productIndex >= 0) {
          // Si le produit existe, incrémenter la quantité
          updatedProducts = existingProducts.map((p, index) => 
            index === productIndex 
              ? { ...p, quantite: p.quantite + quantity }
              : p
          );
        } else {
          // Si le produit n'existe pas, l'ajouter
          const newProduct = {
            idProduit: product.id,
            quantite: quantity,
            dateAjout: new Date().toISOString()
          };
          updatedProducts = [...existingProducts, newProduct];
        }
        
        console.log('Liste des produits mise à jour:', JSON.stringify(updatedProducts, null, 2));
        
        // Données pour la mise à jour
        const updateData = {
          id: existingCart.id,
          produits: updatedProducts,
          clientId: userId
        };
  
        console.log('Données envoyées à l\'API de mise à jour:', JSON.stringify(updateData, null, 2));
  
        const updateResponse = await fetch('http://195.35.24.128:8081/api/paniers/client/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updateData)
        });
  
        const updateResponseText = await updateResponse.text();
        console.log('Réponse de l\'API après mise à jour:', updateResponseText);
  
        if (!updateResponse.ok) {
          throw new Error(`Erreur mise à jour: ${updateResponseText}`);
        }
  
        Alert.alert('Succès', `${product.libelle} ajouté au panier`);
        console.log(`Produit ${product.libelle} ajouté au panier avec succès`);
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      Alert.alert('Erreur', `Échec de l\'ajout au panier: ${error.message}`);
    }
};

  const handleBackPress = () => {
    router.back();
    if (!router.canGoBack()) {
      router.push('/');
    }
  };

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, 10));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

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
            {error || "Oups, ce produit semble introuvable pour l'instant."}
          </Text>
          <TouchableOpacity onPress={handleBackPress} style={styles.backErrorButton}>
            <Text style={styles.backErrorText}>Revenir en arrière</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      {/* Image Header */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imgUrl || 'https://via.placeholder.com/400' }}
          style={[styles.productImage, { height: height * 0.4 }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.5)', 'transparent']}
          style={styles.imageOverlay}
        />
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <SafeAreaView style={styles.scrollContainer}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ height: height * 0.35 }} />
          
          <Animated.View style={[styles.detailsContainer, { opacity: fadeAnim }]}>
            {/* Product Header */}
            <View style={styles.headerRow}>
              <Text style={styles.productName}>
                {product.libelle}
              </Text>
              <TouchableOpacity style={styles.favoriteButton}>
                <Icon name="heart" size={24} color="#e74c3c" />
              </TouchableOpacity>
            </View>

            {/* Shop and Rating */}
            <View style={styles.shopRatingContainer}>
              <View style={styles.shopInfo}>
                <Icon name="shopping-bag" size={16} color="#6B7280" />
                <Text style={styles.productShop}>
                  {product.boutiqueNom || 'Boutique inconnue'}
                </Text>
              </View>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={16} color="#f1c40f" />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
            </View>

            {/* Price */}
            <Text style={styles.productPrice}>
              ${product.prix.toFixed(2)}
            </Text>

            {/* Quantity Selector */}
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantité:</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity 
                  style={styles.quantityButton} 
                  onPress={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Icon name="minus" size={18} color={quantity <= 1 ? "#D1D5DB" : "#4CAF50"} />
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton} 
                  onPress={incrementQuantity}
                  disabled={quantity >= 10}
                >
                  <Icon name="plus" size={18} color={quantity >= 10 ? "#D1D5DB" : "#4CAF50"} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.productDescription}>
                {product.description || 'Aucune description disponible.'}
              </Text>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              style={styles.addToCartButton}
              activeOpacity={0.9}
              onPress={handleAddToCart}
            >
              <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="shopping-cart" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.addToCartText}>Ajouter au Panier</Text>
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
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  backErrorButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  productImage: {
    width: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  detailsContainer: {
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 16,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shopRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productShop: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
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
    fontSize: 14,
    marginLeft: 6,
    color: '#111827',
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  quantityLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  descriptionCard: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
  },
  addToCartButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
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