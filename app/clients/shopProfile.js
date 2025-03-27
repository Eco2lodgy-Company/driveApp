import React, { useState, useEffect,useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  TouchableOpacity,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

const ShopScreen = () => {
  const [shopData, setShopData] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [categories, setCategories] = useState(["Tous"]);
  const { width, height } = useWindowDimensions();
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const { shopId } = useLocalSearchParams(); // Récupération de l'ID depuis l'URL

  //fonction pour convertir l'URL brute des image en URL pour acceder aux images depuis le serveur
  const convertShopsPathToUrl = (dbPath) => {
    if (!dbPath || typeof dbPath !== "string") {
      console.error("Chemin invalide:", dbPath);
      return ""; // Image par défaut
    }
    const basePath = "/root/data/drive/shop/";
    const baseUrl = "http://alphatek.fr:8084/";
    return dbPath.startsWith(basePath) ? dbPath.replace(basePath, baseUrl) : dbPath;
  };


  const convertProductsPathToUrl = (dbPath) => {
    if (!dbPath || typeof dbPath !== "string") {
      console.error("Chemin invalide:", dbPath);
      return ""; // Image par défaut
    }
    const basePath = "/root/data/drive/products/";
    const baseUrl = "http://alphatek.fr:8086/";
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

useEffect(() => {
  fetchUserData(); // Exécuter au montage pour charger les données utilisateur
}, []);

useEffect(() => {
  if (!shopId || !token || !userEmail) return; // Vérifie que toutes les données sont disponibles

  const fetchShopData = async () => {
    try {
      //console.log(token,userEmail);
      const shopResponse = await fetch(`http://195.35.24.128:8081/api/shop/find/${shopId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const shopResult = await shopResponse.json();
      if (shopResult.status === "success") {
        setShopData(shopResult.data);
      }

      const productsResponse = await fetch(
        `http://195.35.24.128:8081/api/products/findByShop/${shopId}?username=${userEmail}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const productsResult = await productsResponse.json();
      if (productsResult.status === "success") {
        setProducts(productsResult.data);
        const uniqueCategories = [
          "Tous",
          ...new Set(productsResult.data.map(product => product.categorieIntitule))
        ];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  fetchShopData();
}, [shopId, token, userEmail]); // Ajout de `token` et `userEmail` dans les dépendances


  // Calculs pour la grille responsive
  const numColumns = Math.floor(width / 180);
  const cardWidth = width / numColumns - 20;

  // Filtrer les produits
  const filteredProducts = selectedCategory === "Tous"
    ? products
    : products.filter(product => product.categorieIntitule === selectedCategory);

  // Afficher les étoiles (par défaut à 4.5 car pas dans l'API)
  const renderRating = () => {
    const stars = [];
    const rating = 4.5; // Valeur par défaut
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.floor(rating) ? "star" : "star-outline"}
          size={width > 600 ? 24 : 20}
          color="#f1c40f"
        />
      );
    }
    return stars;
  };

  // Rendu des produits
  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={[styles.productCard, { width: cardWidth }]}
      onPress={() => router.push(`/clients/ProductScreen?productId=${item.id}`)}
    >
      <Image 
        source={{ uri: convertProductsPathToUrl(item.imagePath) }} 
        style={[styles.productImage, { height: cardWidth * 0.8 }]}
        resizeMode="cover"
      />
      <Text style={styles.productName} numberOfLines={1}>{item.libelle}</Text>
      <Text style={styles.productPrice}>{item.prix.toFixed(2)} €</Text>
    </TouchableOpacity>
  );

  // Rendu des catégories
  const renderCategory = (category) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive,
        { paddingHorizontal: width > 600 ? 20 : 15 }
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text 
        style={[
          styles.categoryText,
          selectedCategory === category && styles.categoryTextActive,
          { fontSize: width > 600 ? 16 : 14 }
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  // Chargement en cours ou ID manquant
  if (!shopId || !shopData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{!shopId ? "ID de boutique manquant" : "Chargement..."}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: height * 0.05 }}
    >
      {/* Bannière */}
      <Image 
        source={{ uri: convertShopsPathToUrl(shopData.bannerPath) }} 
        style={[styles.banner, { height: height * 0.25 }]}
        resizeMode="cover"
      />

      {/* Informations */}
      <View style={[styles.infoContainer, { padding: width * 0.04 }]}>
        <Text style={[styles.shopName, { fontSize: width > 600 ? 28 : 24 }]}>
          {shopData.nom}
        </Text>
        <View style={styles.ratingContainer}>{renderRating()}</View>
        <Text 
          style={[styles.shopDescription, { fontSize: width > 600 ? 18 : 16 }]}
        >
          {shopData.description}
        </Text>
        <TouchableOpacity 
          style={styles.contactInfo}
          onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopData.adresse)}`)}
        >
          <Ionicons name="location-outline" size={width > 600 ? 24 : 20} color="#666" />
          <Text style={[styles.contactText, { fontSize: width > 600 ? 16 : 14 }]}>
            {shopData.adresse}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.contactInfo}
          onPress={() => Linking.openURL(`tel:${shopData.telephone}`)}
        >
          <Ionicons name="call-outline" size={width > 600 ? 24 : 20} color="#666" />
          <Text style={[styles.contactText, { fontSize: width > 600 ? 16 : 14 }]}>
            {shopData.telephone}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Catégories */}
      <View style={[styles.categoriesContainer, { paddingHorizontal: width * 0.04 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <View key={category}>
              {renderCategory(category)}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Catalogue */}
      <View style={[styles.productsContainer, { padding: width * 0.04 }]}>
        <Text style={[styles.productsTitle, { fontSize: width > 600 ? 24 : 20 }]}>
          Catalogue
        </Text>
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
          numColumns={numColumns}
          key={numColumns}
          columnWrapperStyle={styles.productRow}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun produit dans cette catégorie</Text>}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  banner: {
    width: '100%',
  },
  infoContainer: {
    alignItems: 'center',
  },
  shopName: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  shopDescription: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  contactText: {
    color: '#666',
    marginLeft: 10,
  },
  categoriesContainer: {
    marginBottom: 15,
  },
  categoryButton: {
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#2ecc71',
  },
  categoryText: {
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  productsContainer: {},
  productsTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  productImage: {
    width: '100%',
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShopScreen;