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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from './components/BottomNavigation';

const ads = [
  { id: 'ad-1', image: 'https://images.unsplash.com/photo-1741851374411-9528e6d2f33f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'ad-2', image: 'https://images.unsplash.com/photo-1741812191037-96bb5f12010a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNXx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'ad-3', image: 'https://images.unsplash.com/photo-1742156345582-b857d994c84e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMnx8fGVufDB8fHx8fA%3D%3D' },
];

// Créer une liste infinie en dupliquant les éléments plusieurs fois
const infiniteAds = [...ads, ...ads, ...ads, ...ads, ...ads]; // Duplique 5 fois pour éviter les limites visibles

const categories = ["All", "Clothing", "Shoes", "Accessories", "Jewelry", "Bags"];

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [userData, setUserData] = useState(null);
  const numColumns = Math.max(2, Math.floor(width / 180));
  const cardWidth = (width - 48) / numColumns;
  const adFlatListRef = useRef(null);
  const adWidth = width - 32; // Largeur de chaque pub ajustée à l'écran avec marges

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

  // Défilement automatique des publicités en boucle infinie
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (adFlatListRef.current && infiniteAds.length > 0) {
        currentIndex = (currentIndex + 1) % ads.length; // Boucle sur la longueur originale
        const offset = currentIndex * adWidth; // Offset basé sur la largeur dynamique
        adFlatListRef.current.scrollToOffset({
          offset: offset,
          animated: true,
        });

        // Repositionnement discret au début après une boucle complète
        if (currentIndex === 0) {
          setTimeout(() => {
            adFlatListRef.current.scrollToOffset({
              offset: 0,
              animated: false,
            });
          }, 500); // Délai pour laisser l'animation se terminer
        }
      }
    }, 3000); // Défilement toutes les 3 secondes

    return () => clearInterval(interval); // Nettoyage de l'intervalle
  }, [adWidth]); // Dépendance sur adWidth pour recalcul si la largeur change

  const filteredProducts = products?.filter((product) => {
    if (!product) return false;
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shop?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const renderProduct = ({ item }) => (
    <View style={[styles.productCard, { width: cardWidth }]}>
      <TouchableOpacity
        style={styles.productContent}
        onPress={() => router.push(`/clients/ProductScreen?productId=${item.id}`)}
      >
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productShop}>{item.shop}</Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>${item.price?.toFixed(2) || '0.00'}</Text>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => console.log(`Ajouté ${item.name} au panier`)}
            >
              <Icon name="plus" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderAdItem = ({ item }) => (
    <TouchableOpacity style={styles.adContainer}>
      <Image
        source={{ uri: item.image }}
        style={[styles.adImage, { width: adWidth }]} // Largeur dynamique
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedCategory === item && styles.activeFilter]}
      onPress={() => setSelectedCategory(item)}
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
            >
              <Icon name="bell" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.fixedContent, { opacity: fadeAnim }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher (produit, boutique...)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Animated.View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Filtres */}
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

        {/* Section Publicités */}
        <Text style={styles.sectionTitle}>Publicités</Text>
        <View style={styles.adWrapper}>
          <FlatList
            ref={adFlatListRef}
            horizontal
            data={infiniteAds}
            renderItem={renderAdItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.adListContainer}
            snapToInterval={adWidth} // Aligne chaque pub à la largeur de l'écran
            decelerationRate="fast"
            initialScrollIndex={0}
          />
        </View>

        {/* Section Articles */}
        <Text style={styles.sectionTitle}>Articles</Text>
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
            <Text style={styles.emptyText}>Aucun produit trouvé</Text>
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
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    marginTop: 12,
  },
  adWrapper: {
    width: '100%',
    overflow: 'hidden', // Masque les pubs non visibles
  },
  adListContainer: {
    paddingVertical: 8,
  },
  adContainer: {
    marginRight: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adImage: {
    height: 150,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    marginBottom: 8,
  },
  productContent: {
    padding: 12,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productShop: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingAnimation: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default HomeScreen;