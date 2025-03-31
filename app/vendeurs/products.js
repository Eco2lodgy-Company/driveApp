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
        const user = userData ? JSON.parse(userData) : null;
        const token = user?.token;

        if (!token) {
          console.error("Aucun token trouvé dans AsyncStorage");
          setLoading(false);
          return;
        }

        const response = await fetch('http://195.35.24.128:8081/api/products/findByShop/19?username=bazoum@gmail.com', {
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
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(headerAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
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
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`vendeurs/productDetails?productId=${item.id}`)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.productGradient}
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
              { backgroundColor: item.stock > 10 ? '#ECFDF5' : '#FFF1F2' }
            ]}>
              <Text style={[
                styles.productStock,
                { color: item.stock > 10 ? '#15803D' : '#DC2626' }
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
          <Icon name="edit-2" size={20} color="#4B5563" />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Animated.View style={[styles.header, {
        opacity: headerAnim,
        transform: [{
          translateY: headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-30, 0],
          }),
        }],
      }]}>
        <LinearGradient
          colors={['#FFFFFF', '#F9FAFB']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/sellers/home')}
            >
              <Icon name="chevron-left" size={28} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mes Produits</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('vendeurs/addProducts')}
            >
              <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                style={styles.addButtonGradient}
              >
                <Icon name="plus" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement des produits...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="package" size={40} color="#9CA3AF" />
              <Text style={styles.emptyText}>Aucun produit disponible</Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true} // Activer l'indicateur de scroll pour confirmer le défilement
              contentContainerStyle={[styles.listContent, { flexGrow: 1 }]} // Assurer que le contenu grandit
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.2,
  },
  backButton: {
    padding: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  addButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  addButtonGradient: {
    padding: 6,
    borderRadius: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1, // S'assurer que ce conteneur prend tout l'espace disponible
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: '#111827',
  },
  section: {
    flex: 1, // Permettre à la section de prendre tout l'espace restant
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  productCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  productGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productStock: {
    fontSize: 12,
    fontWeight: '500',
  },
  productId: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 80, // Augmenter le paddingBottom pour s'assurer que le dernier élément est visible au-dessus de BottomNavigation
  },
});

export default SellerProductsScreen;