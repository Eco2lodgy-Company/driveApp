// SellerProductsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';

const SellerProductsScreen = () => {
  const router = useRouter();

  // Données d'exemple pour les produits
  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'T-shirt Vintage',
      price: 29.99,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1654508590628-21c717998f6b?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: '2',
      name: 'Mug Personnalisé',
      price: 12.50,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1727285100419-348edd55d403?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: '3',
      name: 'Sac Éco',
      price: 19.99,
      stock: 8,
      image: 'https://plus.unsplash.com/premium_photo-1686584355100-e6906b984f3c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ]);

  // Initialisation des animations après products
  const [fadeAnims, setFadeAnims] = useState([]);

  // Mettre à jour les animations lorsque products change
  useEffect(() => {
    const newFadeAnims = products.map(() => new Animated.Value(0));
    setFadeAnims(newFadeAnims);

    // Lancer les animations
    const animations = newFadeAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, animations).start();
  }, [products]);

  const renderProduct = ({ item, index }) => (
    <Animated.View
      style={[
        styles.productCard,
        fadeAnims[index] && {
          opacity: fadeAnims[index],
          transform: [
            {
              translateY: fadeAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.productContent}
        onPress={() => router.push(`/sellers/product-details?productId=${item.id}`)}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          <Text style={styles.productStock}>
            Stock: <Text style={item.stock > 10 ? styles.stockHigh : styles.stockLow}>{item.stock}</Text>
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push(`/sellers/editProduct?productId=${item.id}`)}
      >
        <Icon name="edit-2" size={22} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* En-tête */}
      <LinearGradient
        colors={['#38A169', '#2D8A5B']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mes Produits</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/sellers/home')}
          >
            <Icon name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.wave} />
      </LinearGradient>

      {/* Liste des produits */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun produit trouvé. Ajoutez-en un !</Text>
        }
      />

      {/* Bouton flottant Ajouter un produit */}
      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => router.push('vendeurs/addProducts')}
      >
        <LinearGradient colors={['#38A169', '#2D8A5B']} style={styles.floatingAddGradient}>
          <Icon name="plus" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 12,
  },
  wave: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#F0F4F8',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  productList: {
    padding: 20,
    paddingBottom: 100, // Espace pour la barre de navigation
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#EDEFF2',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38A169',
    marginBottom: 6,
  },
  productStock: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  stockHigh: {
    color: '#38A169',
    fontWeight: '700',
  },
  stockLow: {
    color: '#E74C3C',
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: '#38A169',
    borderRadius: 50,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    borderRadius: 50,
    overflow: 'hidden',
  },
  floatingAddGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
});

export default SellerProductsScreen;