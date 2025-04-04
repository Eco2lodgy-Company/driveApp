import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SellerProductsScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const convertPathToUrl = (dbPath) => {
    if (!dbPath || typeof dbPath !== "string") {
      return "https://via.placeholder.com/60";
    }
    const basePath = "/root/data/drive/products/";
    const baseUrl = "http://alphatek.fr:8086/";
    return dbPath.startsWith(basePath) ? dbPath.replace(basePath, baseUrl) : dbPath;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const LocalShopId = await AsyncStorage.getItem("Shop");

        const user = userData ? JSON.parse(userData) : null;
        const token = user?.token;

        if (!token) {
          console.error("Aucun token trouvé dans AsyncStorage");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://195.35.24.128:8081/api/products/findByShop/${LocalShopId}?username=${user.email}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.status === 'success' && Array.isArray(data.data)) {
          const transformedProducts = data.data.map(product => ({
            id: product.id.toString(),
            name: product.libelle,
            price: product.prix,
            stock: product.quantite,
            image: convertPathToUrl(product.imagePath),
          }));
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      } finally {
        setLoading(false);
      }

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(headerAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      ]).start();
    };

    loadData();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`vendeurs/productDetails?productId=${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="contain"
          defaultSource={{ uri: 'https://via.placeholder.com/60' }}
        />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>{item.price.toLocaleString()} FCFA</Text>
          <View style={[
            styles.stockBadge,
            { backgroundColor: item.stock > 10 ? '#C6F6D5' : '#FEE2E2' }
          ]}>
            <Text style={[
              styles.productStock,
              { color: item.stock > 10 ? '#15803D' : '#B91C1C' }
            ]}>
              {item.stock} en stock
            </Text>
          </View>
        </View>
        <Text style={styles.productId}>Réf: #{item.id}</Text>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={(e) => {
          e.stopPropagation();
          router.push(`vendeurs/editProduct?productId=${item.id}`);
        }}
      >
        <Icon name="edit-2" size={18} color="#4A5568" />
      </TouchableOpacity>
    </TouchableOpacity>
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
                  outputRange: [-30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient colors={['#FFFFFF', 'rgba(255,255,255,0.9)']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/sellers/home')}
            >
              <Icon name="chevron-left" size={24} color="#4A5568" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mes Produits</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('vendeurs/addProducts')}
            >
              <LinearGradient
                colors={['#38A169', '#2F855A']}
                style={styles.addButtonGradient}
              >
                <Icon name="plus" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={18} color="#A0AEC0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <View style={styles.section}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Icon name="loader" size={24} color="#4A5568" />
              <Text style={styles.loadingText}>Chargement des produits...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="package" size={48} color="#CBD5E0" />
              <Text style={styles.emptyText}>Aucun produit disponible</Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={
                <Text style={styles.sectionTitle}>
                  {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
                </Text>
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucun produit ne correspond à votre recherche</Text>
              }
            />
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addButtonGradient: {
    padding: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#1A202C',
  },
  section: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38A169',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productStock: {
    fontSize: 12,
    fontWeight: '600',
  },
  productId: {
    fontSize: 12,
    color: '#718096',
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
});

export default SellerProductsScreen;