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
      console.error("Chemin invalide:", dbPath);
      return "";
    }
    const basePath = "/root/data/drive/shop/";
    const baseUrl = "http://alphatek.fr:8084/";
    return dbPath.startsWith(basePath) ? dbPath.replace(basePath, baseUrl) : dbPath;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Récupérer les données utilisateur depuis AsyncStorage
        const userData = await AsyncStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null; // Parser le JSON
        const token = user?.token; // Accéder au token dans l'objet user

        if (!token) {
          console.error("Aucun token trouvé dans AsyncStorage");
          setLoading(false);
          return;
        }

        // Récupérer les produits avec le token
        const response = await fetch('http://195.35.24.128:8081/api/products/findByShop/19?username=bazoum@gmail.com', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Utiliser le token directement
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

      // Lancer les animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(headerAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    };

    loadData();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productIcon}>
        <Icon name="package" size={20} color="#6B7280" />
      </View>
      <TouchableOpacity
        style={styles.productDetails}
        onPress={() => router.push(`/sellers/product-details?productId=${item.id}`)}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
          onError={(e) => console.log('Erreur de chargement image:', e.nativeEvent.error)}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>#{item.id} - {item.name}</Text>
          <Text style={styles.productPrice}>{item.price} FCFA</Text>
          <Text style={[
            styles.productStock,
            { color: item.stock > 10 ? '#10B981' : '#F44336' }
          ]}>
            Stock: {item.stock}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push(`/sellers/editProduct?productId=${item.id}`)}
      >
        <Icon name="edit-2" size={16} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Animated.View style={[styles.header, {
        opacity: headerAnim,
        transform: [{
          translateY: headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
          }),
        }],
      }]}>
        <LinearGradient
          colors={['#fff', '#F9FAFB']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Mes Produits</Text>
            <TouchableOpacity
              onPress={() => router.push('/sellers/home')}
              style={styles.profileButton}
            >
              <Icon name="arrow-left" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher (ID, nom...)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.section}>
          {loading ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : products.length === 0 ? (
            <Text style={styles.emptyText}>Pas de produit disponible</Text>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {filteredProducts.length} produit(s) trouvé(s)
              </Text>
              <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Aucun produit trouvé</Text>
                }
              />
            </>
          )}
        </View>
      </Animated.View>

      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => router.push('/sellers/addProducts')}
      >
        <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.floatingAddGradient}>
          <Icon name="plus" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

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
  profileButton: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  contentContainer: {
    padding: 16,
    flex: 1,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
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
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  productPrice: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  productStock: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  floatingAddGradient: {
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
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

export default SellerProductsScreen;