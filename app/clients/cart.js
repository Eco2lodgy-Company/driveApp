// PanierScreen.js
import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';

const PanierScreen = () => {
  const [articles, setArticles] = useState([
    { id: '1', name: 'Premium Coffee Maker', price: 89.99, quantity: 1, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', description: 'High-quality coffee maker with timer' },
    { id: '2', name: 'Stainless Steel Mug', price: 24.99, quantity: 2, image: 'https://images.unsplash.com/photo-1514228742587-6b93ef5afd35', description: 'Keeps drinks hot for 12 hours' },
    { id: '3', name: 'Organic Coffee Beans', price: 15.99, quantity: 1, image: 'https://images.unsplash.com/photo-1494314675223-7d4f9cfd2d66', description: '1lb of freshly roasted beans' },
    { id: '4', name: 'Coffee Grinder', price: 34.99, quantity: 1, image: 'https://images.unsplash.com/photo-1514043459281-2e18a275772c', description: 'Adjustable ceramic burr grinder' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const router = useRouter();

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

  const calculateSubtotal = () => {
    return articles.reduce((sum, article) => sum + article.price * article.quantity, 0);
  };

  const confirmOrder = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/clients/DeliveryScreen');
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

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Votre Panier</Text>

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
            <View key={item.id}>{renderItem(item)}</View> // Ajout de la prop key ici
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
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'left',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
});

export default PanierScreen;