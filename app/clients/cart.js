import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/Feather';

const PanierScreen = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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
    const fetchUserData = async () => {
      try {
        const userToken = await AsyncStorage.getItem("user");
        if (!userToken) {
          console.error("Aucun token trouvé");
          return;
        }

        const { token, email, id } = JSON.parse(userToken);
        setToken(token);
        setUserId(id);
        setUserEmail(email);

        if (id && token) {
          fetchCartData(id, token);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du token :", error.message);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchCartData = async (userId, token) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://195.35.24.128:8081/api/paniers/client/liste/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Articles récupérés :", data.data);
  
      // 🔥 Correction : Vérifier et enregistrer l'ID du panier
      if (data.data.length > 0) {
        await AsyncStorage.setItem("panier", data.data[0].id.toString());
        console.log("ID du panier enregistré :", data.data[0].id);
      } else {
        console.log("Aucun panier trouvé");
      }
  
      const transformedArticles = data.data.map((panier) => ({
        id: panier.id.toString(),
        name: panier.produits[0]?.nom || "Produit inconnu",
        price: panier.produits[0]?.prix || 1,
        quantity: 1,
        image: convertPathToUrl(panier.produits[0]?.imagePath) || "http://alphatek.fr:8086/c392b637-0c32-4d6b-aad1-a5753b8c3c43_2b16e7bf-6c48-4dc1-b9b0-13b0395109cf.jpeg",
        description: panier.produits[0]?.description || "Aucune description",
      }));
  
      setArticles(transformedArticles);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      Alert.alert("Erreur", "Impossible de charger les données du panier");
    } finally {
      setIsLoading(false);
    }
  };
  

  const updateQuantity = (id, quantity) => {
    const parsedQty = parseInt(quantity) || 1;
    setArticles(prevArticles =>
      prevArticles.map(article =>
        article.id === id ? { ...article, quantity: Math.max(1, parsedQty) } : article
      )
    );
  };

  const removeArticle = (id) => {
    setArticles(prevArticles => prevArticles.filter(article => article.id !== id));
  };

  // Nouvelle fonction handleClearCart
  const handleClearCart = () => {
    Alert.alert(
      "Vider le panier",
      "Êtes-vous sûr de vouloir supprimer tous les articles du panier ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui",
          onPress: async () => {
            setIsLoading(true);
            try {
              const response = await fetch(
                `http://195.35.24.128:8081/api/paniers/client/clear/${userId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (!response.ok) {
                throw new Error("Erreur lors de la suppression du panier");
              }

              setArticles([]);
              Alert.alert("Succès", "Le panier a été vidé.");
            } catch (error) {
              console.error("Erreur lors de la vidange du panier:", error);
              Alert.alert("Erreur", "Impossible de vider le panier.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const calculateSubtotal = () => {
    return articles.reduce((sum, article) => sum + (article.price * article.quantity), 0);
  };

  const confirmOrder = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/clients/shippingOption');
      setOrderStatus('success');
    } catch (error) {
      setOrderStatus('error');
      Alert.alert('Erreur', 'Échec de la confirmation de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = (item) => (
    <View style={styles.item}>
      <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <View style={styles.itemControls}>
          <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              style={styles.quantityBtn}
            >
              <Text style={styles.quantityBtnText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={item.quantity.toString()}
              onChangeText={(text) => updateQuantity(item.id, text)}
              keyboardType="numeric"
              selectTextOnFocus
            />
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              style={styles.quantityBtn}
            >
              <Text style={styles.quantityBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeArticle(item.id)} style={styles.removeBtn}>
        <Text style={styles.removeBtnText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (isLoading && articles.length === 0) {
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
            <ActivityIndicator size="large" color="#38A169" />
            <Text style={styles.loadingText}>Chargement du panier...</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Votre Panier</Text>
          {articles.length > 0 ? (
            <TouchableOpacity onPress={handleClearCart} style={styles.clearCartButton}>
              <Icon name="trash-2" size={24} color="#fff" />
              <Text style={styles.clearCartText}>Vider</Text>
            </TouchableOpacity>
          ) : (
            console.log("Pas d'articles, bouton non affiché")
          )}
        </View>

        {articles.length === 0 && !orderStatus && (
          <Text style={styles.empty}>Votre panier est vide</Text>
        )}

        {orderStatus === 'success' && (
          <View style={[styles.message, styles.success]}>
            <Text style={styles.messageText}>Commande confirmée ! Redirection en cours...</Text>
          </View>
        )}

        {orderStatus === 'error' && (
          <View style={[styles.message, styles.error]}>
            <Text style={styles.messageText}>Erreur. Veuillez réessayer.</Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {articles.map((item) => (
            <View key={item.id}>{renderItem(item)}</View>
          ))}
        </ScrollView>

        {articles.length > 0 && (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Livraison</Text>
              <Text style={styles.summaryValue}>{shipping === 0 ? 'Gratuit' : `$${shipping.toFixed(2)}`}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              onPress={confirmOrder}
              disabled={isLoading}
              style={[styles.confirmBtn, isLoading && styles.confirmBtnDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirmer</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'left',
  },
  clearCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    padding: 8,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  clearCartText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38A169',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: 20,
    overflow: 'hidden',
  },
  quantityBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quantityBtnText: {
    fontSize: 18,
    color: '#38A169',
    fontWeight: 'bold',
  },
  quantityInput: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#1A1A1A',
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
  removeBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    fontSize: 20,
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDEFF2',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#38A169',
  },
  confirmBtn: {
    backgroundColor: '#38A169',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmBtnDisabled: {
    backgroundColor: '#95C9A6',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  success: {
    backgroundColor: '#38A169',
  },
  error: {
    backgroundColor: '#E74C3C',
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
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
    color: '#666',
    fontWeight: '500',
  },
});

export default PanierScreen;