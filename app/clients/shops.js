import React, { useState, useEffect, useCallback } from 'react';
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
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavigation from './components/BottomNavigation';

const ShopsScreen = () => {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [error, setError] = useState(null);

  const convertPathToUrl = (dbPath) => {
    if (!dbPath || typeof dbPath !== "string") {
      console.error("Chemin invalide:", dbPath);
      return "https://via.placeholder.com/150"; // Image par défaut
    }
    const basePath = "/root/data/drive/shop/";
    const baseUrl = "http://alphatek.fr:8084/";
    return dbPath.startsWith(basePath) ? dbPath.replace(basePath, baseUrl) : dbPath;
  };
  
  const fetchUserData = useCallback(async () => {
    try {
      const userToken = await AsyncStorage.getItem("user");
      if (!userToken) throw new Error("Aucun token trouvé");
  
      const { token, email, id } = JSON.parse(userToken);
      setToken(token);
      setUserId(id);
      setUserEmail(email);
    } catch (error) {
      console.error("Erreur lors de la récupération du token :", error.message);
    }
  }, []);
  
  const fetchShops = useCallback(async () => {
    if (!userEmail || !token) return; // Attendre que les valeurs soient définies
  
    try {
      const response = await fetch(
        `http://195.35.24.128:8081/api/shop/liste?username=${userEmail}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      const result = await response.json();
      if (result.status === "success" && Array.isArray(result.data)) {
        console.log("Shops récupérés:", result.data);
        setShops(result.data);
      } else {
        throw new Error(result.message || "Erreur lors de la récupération des shops");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userEmail, token]);
  
  // Exécuter fetchUserData au montage
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  
  // Attendre que fetchUserData ait défini userEmail et token avant de lancer fetchShops
  useEffect(() => {
    if (userEmail && token) {
      fetchShops();
    }
  }, [userEmail, token, fetchShops]);
  
  // Animation au montage
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shop.adresse.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all'; // Pas de catégorie dans l'API pour l'instant
    return matchesSearch && matchesCategory;
  });

  const handleShopPress = (shopId) => {
    router.push(`clients/shopProfile`);
  };

  const renderShopCard = (shop, index) => {
    const imageUrl = convertPathToUrl(shop.bannerPath); // Calculer l'URL pour chaque boutique

    return (
      <Animated.View
        key={shop.id}
        style={[
          styles.shopCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30 * (index + 1), 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleShopPress(shop.id)}
          activeOpacity={0.85}
        >
          <Image
            source={{ uri: imageUrl }} // Utiliser l'URL spécifique à cette boutique
            style={[styles.shopImage, { width: width * 0.35, height: width * 0.35 }]}
            resizeMode="cover"
            onError={() => console.log(`Erreur de chargement de l'image pour ${shop.nom}`)}
          />
          <View style={styles.shopInfo}>
            <Text style={[styles.shopName, { fontSize: width > 600 ? 20 : 18 }]}>
              {shop.nom}
            </Text>
            <View style={styles.addressContainer}>
              <Icon name="map-pin" size={width > 600 ? 16 : 14} color="#666" />
              <Text style={[styles.shopAddress, { fontSize: width > 600 ? 14 : 12 }]}>
                {shop.adresse}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Icon name="phone" size={width > 600 ? 16 : 14} color="#666" />
              <Text style={styles.ratingText}>{shop.telephone}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const categories = [
    { id: 'all', label: 'Toutes' },
    // Ajoutez d'autres catégories ici si elles deviennent disponibles dans l'API
  ];

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category.id && styles.categoryTextActive,
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Erreur : {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { fontSize: width > 600 ? 28 : 24 }]}>
          Boutiques
        </Text>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une boutique..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map(renderCategoryButton)}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { padding: width * 0.04 }]}
      >
        {filteredShops.length > 0 ? (
          filteredShops.map((shop, index) => renderShopCard(shop, index))
        ) : (
          <Text style={styles.noResults}>Aucune boutique trouvée</Text>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  backButton: {
    padding: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
  },
  pageTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryScrollContent: {
    paddingRight: 15,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  categoryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  shopCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopImage: {
    borderRadius: 10,
  },
  shopInfo: {
    flex: 1,
    padding: 15,
  },
  shopName: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  shopAddress: {
    color: '#666',
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    elevation: 1,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  bottomSpacer: {
    height: 80,
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    color: '#666',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    color: '#ff4444',
  },
});

export default ShopsScreen;