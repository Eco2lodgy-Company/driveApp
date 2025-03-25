import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  Dimensions,
  TouchableOpacity,
  Linking,
  useWindowDimensions, // Ajout pour des dimensions dynamiques
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Données d'exemple
const shopData = {
  name: "Ma Boutique Élégante",
  description: "Bienvenue dans notre boutique de produits uniques et de qualité",
  banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  address: "123 Rue de l'Exemple, 75001 Paris",
  phone: "+33 1 23 45 67 89",
  rating: 4.5,
  categories: ["Tous", "Mode", "Accessoires", "Déco"],
  products: [
    { id: '1', name: 'Robe Élégante', price: 59.99, category: 'Mode', image: 'https://images.unsplash.com/photo-1561526116-e2460f4d40a9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: '2', name: 'Collier Perlé', price: 29.99, category: 'Accessoires', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: '3', name: 'Vase Design', price: 39.99, category: 'Déco', image: 'https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2xvdGhzfGVufDB8fDB8fHww' },
    { id: '4', name: 'Chemise Classique', price: 49.99, category: 'Mode', image: 'https://images.unsplash.com/photo-1630329273801-8f629dba0a72?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '5', name: 'Chemise Classique', price: 49.99, category: 'Mode', image: 'https://images.unsplash.com/photo-1600805624740-ebe68a29ac69?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '6', name: 'Chemise Classique', price: 49.99, category: 'Mode', image: 'https://images.unsplash.com/photo-1630329273801-8f629dba0a72?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '7', name: 'Chemise Classique', price: 49.99, category: 'Mode', image: 'https://images.unsplash.com/photo-1630329273801-8f629dba0a72?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },

],};

const ShopScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const { width, height } = useWindowDimensions(); // Dimensions dynamiques
  const router = useRouter();
  // Calculs pour la grille responsive
  const numColumns = Math.floor(width / 180); // Ajuste selon la taille minimale des cartes
  const cardWidth = width / numColumns - 20; // 20 pour les marges

  // Filtrer les produits
  const filteredProducts = selectedCategory === "Tous" 
    ? shopData.products 
    : shopData.products.filter(product => product.category === selectedCategory);

  // Afficher les étoiles
  const renderRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.floor(shopData.rating) ? "star" : "star-outline"}
          size={width > 600 ? 24 : 20} // Plus grand sur tablettes
          color="#f1c40f"
        />
      );
    }
    return stars;
  };

  // Rendu des produits
  const renderProduct = ({ item }) => (
    <TouchableOpacity style={[styles.productCard, { width: cardWidth }]}
    onPress={() => router.push(`/clients/ProductScreen?productId=${item.id}`)}
    >
      <Image 
        source={{ uri: item.image }} 
        style={[styles.productImage, { height: cardWidth * 0.8 }]} // Ratio image
        resizeMode="cover"
      />
      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price.toFixed(2)} €</Text>
    </TouchableOpacity>
  );

  // Rendu des catégories
  const renderCategory = (category) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive,
        { paddingHorizontal: width > 600 ? 20 : 15 } // Plus large sur grands écrans
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

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: height * 0.05 }} // Marge bottom dynamique
    >
      {/* Bannière */}
      <Image 
        source={{ uri: shopData.banner }} 
        style={[styles.banner, { height: height * 0.25 }]} // Hauteur relative
        resizeMode="cover"
      />

      {/* Informations */}
      <View style={[styles.infoContainer, { padding: width * 0.04 }]}>
        <Text style={[styles.shopName, { fontSize: width > 600 ? 28 : 24 }]}>
          {shopData.name}
        </Text>
        <View style={styles.ratingContainer}>{renderRating()}</View>
        <Text 
          style={[styles.shopDescription, { fontSize: width > 600 ? 18 : 16 }]}
        >
          {shopData.description}
        </Text>
        <TouchableOpacity 
          style={styles.contactInfo}
          onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopData.address)}`)}
        >
          <Ionicons name="location-outline" size={width > 600 ? 24 : 20} color="#666" />
          <Text style={[styles.contactText, { fontSize: width > 600 ? 16 : 14 }]}>
            {shopData.address}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.contactInfo}
          onPress={() => Linking.openURL(`tel:${shopData.phone}`)}
        >
          <Ionicons name="call-outline" size={width > 600 ? 24 : 20} color="#666" />
          <Text style={[styles.contactText, { fontSize: width > 600 ? 16 : 14 }]}>
            {shopData.phone}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Catégories */}
      <View style={[styles.categoriesContainer, { paddingHorizontal: width * 0.04 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {shopData.categories.map(category => (
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
          keyExtractor={item => item.id}
          numColumns={numColumns}
          key={numColumns} // Forcer la mise à jour de la grille
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
});

export default ShopScreen;