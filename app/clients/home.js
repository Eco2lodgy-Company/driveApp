import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  useWindowDimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from './components/BottomNavigation';

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
  
  const convertPathToUrl = (dbPath) => {
    if (!dbPath || typeof dbPath !== "string") {
      console.error("Chemin invalide:", dbPath);
      return "https://via.placeholder.com/150";
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
        console.log('Email utilisateur:', userData.email); 
        console.log('Token utilisateur:', userData.token);

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
          console.error('Détails erreur API:', errorData);
          throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        console.log('Données de l\'API', data.data);

        const mappedProducts = data.data.map((item) => ({
          id: item.id.toString(),
          name: item.libelle,
          price: item.prix,
          shop: item.boutiqueNom,
          category: item.categorieIntitule,
          image: convertPathToUrl(item.imagePath),
        }));
        
        setProducts(mappedProducts);
        console.log('Nombre de produits:', mappedProducts.length);
        
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userData]);

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
          onError={(e) => {
            console.log('Erreur de chargement:', e.nativeEvent.error);
            // Vous pouvez aussi mettre à jour l'URI vers une image de secours ici
          }}
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

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher (produit, boutique...)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.filterButtons}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterButton, selectedCategory === category && styles.activeFilter]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={selectedCategory === category ? styles.activeFilterText : styles.filterText}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          {loading ? (
            <Text style={styles.loadingText}>Chargement des produits...</Text>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {filteredProducts.length} produit(s) trouvé(s)
              </Text>
              <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                key={numColumns}
                columnWrapperStyle={styles.productRow}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Aucun produit trouvé</Text>
                }
              />
            </>
          )}
        </View>
      </Animated.View>

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
  contentContainer: {
    padding: 16,
    flex: 1,
    minHeight: 200,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 80,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    color: '#111827',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 80,
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
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 20,
  },
});

export default HomeScreen;