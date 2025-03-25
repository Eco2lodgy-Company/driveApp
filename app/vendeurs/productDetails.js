import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from './components/BottomNavigation';

// Configuration
//const API_BASE_URL = 'http://195.35.24.128:8081/api';

const ProductDetailScreen = () => {
  const router = useRouter();
  const { productId } = useLocalSearchParams(); // Récupérer l'ID du produit

  const [product, setProduct] = useState(null);
  const [token, setToken] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [imgUrl,setImgUrl] = useState('');

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
    const loadUserDataAndProduct = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          setToken(parsedUser.token);
          setUserEmail(parsedUser.email);
        }
        await fetchProductData();
      } catch (error) {
        console.error('Erreur lors du chargement :', error);
        Alert.alert('Erreur', 'Impossible de charger les données');
      }
    };

    



    const fetchProductData = async () => {
      if (!productId || !token) return;
      setIsLoading(true);
      try {
        const response = await fetch(`http://195.35.24.128:8081/api/products/findByID/${productId}?username=${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Erreur lors de la récupération du produit');
        const data = await response.json();
        setProduct(data.data);
        setImgUrl(convertPathToUrl(data.data.imagePath));
      } catch (error) {
        console.error('Erreur fetchProductData :', error);
        Alert.alert('Erreur', 'Impossible de charger les détails du produit');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserDataAndProduct();
  }, [token, productId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <Text style={styles.errorText}>Produit non trouvé</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['#fff', '#F9FAFB']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{product.libelle}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('vendeurs/products')}
          >
            <Icon name="arrow-left" size={20} color="#111827" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.productContainer}>
          {imgUrl && (
            <Image
              source={{ uri: imgUrl }}
              style={styles.productImage}
            />
          )}

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nom :</Text>
              <Text style={styles.value}>{product.libelle}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Description :</Text>
              <Text style={styles.value}>{product.description || 'Non spécifiée'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Prix :</Text>
              <Text style={styles.value}>{product.prix} $</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Stock :</Text>
              <Text style={styles.value}>{product.quantite}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Date d'expiration :</Text>
              <Text style={styles.value}>{formatDate(product.expiredAt)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Catégorie :</Text>
              <Text style={styles.value}>{product.categorieIntitule || 'Non spécifiée'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push({ pathname: '/vendeurs/edit-product', params: { productId } })}
          >
            <LinearGradient
              colors={['#4CAF50', '#388E3C']}
              style={styles.editGradient}
            >
              <Icon name="edit" size={20} color="#fff" />
              <Text style={styles.editText}>Modifier</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  backButton: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  productContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    width: 120,
  },
  value: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  editButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  editGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#111827',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProductDetailScreen;