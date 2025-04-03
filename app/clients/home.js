import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  useWindowDimensions,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from './components/BottomNavigation';

const createInfiniteAds = (adsArray) => [...adsArray, ...adsArray, ...adsArray, ...adsArray, ...adsArray];

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [userData, setUserData] = useState(null);
  const numColumns = Math.max(2, Math.floor(width / 180));
  const cardWidth = (width - 48) / numColumns;
  const adFlatListRef = useRef(null);
  const adWidth = width - 32;

  const convertPathToUrl = (dbPath) => {
    if (!dbPath || typeof dbPath !== "string") {
      console.error("Chemin invalide:", dbPath);
      return "";
    }
    const basePath = "/root/data/drive/products/";
    const baseUrl = "http://alphatek.fr:8086/";
    return dbPath.startsWith(basePath) ? dbPath.replace(basePath, baseUrl) : dbPath;
  };

  const convertAdsPathToUrl = (dbPath) => {
    if (!dbPath || typeof dbPath !== "string") {
      console.error("Chemin invalide:", dbPath);
      return "";
    }
    const basePath = "/root/data/drive/shop/";
    const baseUrl = "http://alphatek.fr:8084/";
    return dbPath.startsWith(basePath) ? dbPath.replace(basePath, baseUrl) : dbPath;
  };

  const handleAddToCart = async (product, quantity) => {
    if (!product || !userData?.id || !userData?.token) {
      Alert.alert('Erreur', 'Informations utilisateur ou produit manquantes');
      return;
    }

    try {
      const checkResponse = await fetch(`http://195.35.24.128:8081/api/paniers/client/liste/${userData.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/hal+json',
          'Authorization': `Bearer ${userData.token}`,
        },
      });

      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        throw new Error(`Erreur vérification panier: ${errorText}`);
      }

      const cartData = await checkResponse.json();

      if (!cartData?.data || !Array.isArray(cartData.data)) {
        throw new Error('Structure de réponse invalide');
      }

      if (cartData.data.length === 0) {
        const createResponse = await fetch('http://195.35.24.128:8081/api/paniers/client/new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify({
            produits: [{
              idProduit: product.id,
              quantite: quantity,
              dateAjout: new Date().toISOString()
            }],
            clientId: userData.id
          })
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(`Erreur création: ${errorText}`);
        }

        Alert.alert('Succès', `${product.name} ajouté à un nouveau panier`);
      } else {
        const existingCart = cartData.data[0];

        const updateData = {
          id: existingCart.id,
          produits: [{
            idProduit: product.id,
            quantite: quantity,
            dateAjout: new Date().toISOString()
          }],
          clientId: userData.id
        };

        const updateResponse = await fetch('http://195.35.24.128:8081/api/paniers/client/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
          },
          body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Réponse serveur:', errorText);
          throw new Error(`Erreur mise à jour: ${errorText}`);
        }

        Alert.alert('Succès', `${product.name} ajouté au panier`);
        console.log(`le produit: ${product.name} a été ajouté au panier avec succès`);
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      Alert.alert('Erreur', `Échec de l'ajout au panier: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      if (!userData || !userData.token) {
        console.error('Token utilisateur manquant pour les catégories');
        return;
      }
      try {
        const response = await fetch('http://195.35.24.128:8081/api/productCategories/liste?username=test25%40gmail.com', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData.token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === "success" && Array.isArray(data.data)) {
          const categoryNames = data.data.map(category => category.intitule);
          setCategories(["All", ...categoryNames]);
        } else {
          console.error("Format de données inattendu pour les catégories:", data);
          setCategories(["All"]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        setCategories(["All"]);
      }
    };
    if (userData) {
      fetchCategories();
    }
  }, [userData]);

  useEffect(() => {
    const fetchAds = async () => {
      if (!userData || !userData.token) {
        console.error('Token utilisateur manquant pour les publicités');
        return;
      }
      try {
        const response = await fetch('http://195.35.24.128:8081/api/pubs/liste', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData.token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === "success" && Array.isArray(data.data)) {
          const mappedAds = data.data.map(ad => {
            const convertedUrl = convertAdsPathToUrl(ad.mediaPath);
            return {
              id: ad.id.toString(),
              image: convertedUrl,
            };
          });
          setAds(mappedAds);
        } else {
          console.error("Format de données inattendu:", data);
          setAds([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des publicités:', error);
        setAds([]);
      }
    };
    if (userData) {
      fetchAds();
    }
  }, [userData]);

  const infiniteAds = createInfiniteAds(ads);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          setUserData(parsedUser);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userData || !userData.token) {
        console.error('Token utilisateur manquant');
        return;
      }
      try {
        setLoading(true);
        const apiUrl = `http://195.35.24.128:8081/api/products/liste?username=${userData.email}`;
        const requestConfig = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData.token}`,
          },
        };
        const response = await fetch(apiUrl, requestConfig);
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Erreur API: ${response.status}`);
        }
        const data = await response.json();
        const mappedProducts = data.data.map((item) => ({
          id: item.id.toString(),
          name: item.libelle,
          price: item.prix,
          shop: item.boutiqueNom,
          category: item.categorieIntitule,
          image: convertPathToUrl(item.imagePath),
          quantity: item.quantite || item.stock || 0,
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [userData]);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (adFlatListRef.current && infiniteAds.length > 0) {
        currentIndex = (currentIndex + 1) % ads.length;
        const offset = currentIndex * adWidth;
        adFlatListRef.current.scrollToOffset({
          offset: offset,
          animated: true,
        });
        if (currentIndex === 0) {
          setTimeout(() => {
            adFlatListRef.current.scrollToOffset({
              offset: 0,
              animated: false,
            });
          }, 500);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [adWidth, ads]);

  const filteredProducts = products?.filter((product) => {
    if (!product) return false;
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shop?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const getQuantityColor = (quantity) => {
    if (quantity === 0) return '#EF4444'; // Rouge pour 0
    if (quantity < 5) return '#F59E0B'; // Orange pour < 5
    return '#4CAF50'; // Vert sinon
  };

  const renderProduct = ({ item }) => (
    <View style={[styles.productCard, { width: cardWidth }]}>
      <TouchableOpacity
        style={styles.productContent}
        onPress={() => router.push(`/clients/ProductScreen?productId=${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/150' }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>${item.price?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.shopContainer}>
            <Icon name="shopping-bag" size={14} color="#6B7280" />
            <Text style={styles.productShop} numberOfLines={1}>{item.shop}</Text>
          </View>
          <View style={styles.quantityContainer}>
            <Text style={[styles.quantityText, { color: getQuantityColor(item.quantity) }]}>
              Disponible : {item.quantity} unité{item.quantity !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={(e) => {
              e.stopPropagation();
              handleAddToCart(item, 1); // Ajoute 1 unité par défaut
            }}
            activeOpacity={0.7}
          >
            <Icon name="shopping-cart" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderAdItem = ({ item }) => (
    <TouchableOpacity style={styles.adContainer} activeOpacity={0.8}>
      <Image
        source={{ uri: item.image }}
        style={[styles.adImage, { width: adWidth }]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
        style={styles.adGradient}
      />
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedCategory === item && styles.activeFilter]}
      onPress={() => setSelectedCategory(item)}
      activeOpacity={0.7}
    >
      <Text style={selectedCategory === item ? styles.activeFilterText : styles.filterText}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingAnimation,
              {
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }]
              }
            ]}
          >
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Chargement des produits...</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient colors={['#fff', '#F9FAFB']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Drive.re</Text>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/clients/notifications')}
              activeOpacity={0.7}
            >
              <Icon name="bell" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.fixedContent, { opacity: fadeAnim }]}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher (produit, boutique...)"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}
              activeOpacity={0.6}
            >
              <Icon name="x" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterWrapper}>
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Publicités</Text>
          <TouchableOpacity activeOpacity={0.6}>
            <Text style={styles.seeAllText}>Tout voir</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.adWrapper}>
          <FlatList
            ref={adFlatListRef}
            horizontal
            data={infiniteAds}
            renderItem={renderAdItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.adListContainer}
            snapToInterval={adWidth}
            decelerationRate="fast"
            initialScrollIndex={0}
          />
          <View style={styles.adPagination}>
            {ads.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.adPaginationDot,
                  index === 0 && styles.adPaginationDotActive
                ]} 
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Articles</Text>
          <Text style={styles.productCount}>{filteredProducts.length} produits</Text>
        </View>
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="package" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aucun produit trouvé</Text>
              <Text style={styles.emptySubtext}>Essayez de modifier vos filtres</Text>
            </View>
          }
        />
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  notificationButton: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  fixedContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F9FAFB',
    zIndex: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#111827',
  },
  clearSearchButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  filterWrapper: {
    marginBottom: 12,
  },
  filterContainer: {
    paddingVertical: 4,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeFilter: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  productCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  adWrapper: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: 8,
  },
  adListContainer: {
    paddingVertical: 8,
  },
  adContainer: {
    marginRight: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  adImage: {
    height: 160,
    borderRadius: 12,
  },
  adGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  adPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  adPaginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 3,
  },
  adPaginationDotActive: {
    backgroundColor: '#4CAF50',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  productContent: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  priceTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  priceTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
    paddingTop: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  shopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productShop: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  quantityContainer: {
    marginBottom: 12,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: '500',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingAnimation: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default HomeScreen;