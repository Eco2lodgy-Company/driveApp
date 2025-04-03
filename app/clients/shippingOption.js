import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeliveryOptionScreen = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [deliveryOption, setDeliveryOption] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        // Récupération du token depuis AsyncStorage
        const userData = await AsyncStorage.getItem('user');
        const token = userData ? JSON.parse(userData).token : null;
        const userId = userData ? JSON.parse(userData).id :null;

        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await fetch(`http://195.35.24.128:8081/api/paniers/client/liste/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        
        if (result.status === 'success') {
          // Transformation des données pour correspondre au format attendu
          const transformedItems = result.data.flatMap(panier => 
            panier.produits.map(produit => ({
              id: produit.id || panier.id.toString(),
              name: produit.nom,
              price: produit.prix,
              quantity: produit.quantite,
            }))
          );
          setCartItems(transformedItems);
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleContinue = () => {
    if (deliveryOption) {
      const nextRoute = deliveryOption === 'delivery' 
        ? '/clients/PaymentScreen' 
        : '/clients/PaymentScreen';
      router.push(nextRoute);
    }
  };

  const renderCartItem = (item) => (
    <View key={item.id} style={styles.cartItem}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDetails}>
        Qté: {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: width * 0.04 }]}
        showsVerticalScrollIndicator={true}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { fontSize: width > 600 ? 28 : 24 }]}>
          Choisissez une option
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre panier</Text>
          {loading ? (
            <Text>Chargement du panier...</Text>
          ) : cartItems.length > 0 ? (
            <>
              {cartItems.map(renderCartItem)}
              <View style={[styles.totalContainer, styles.totalFinal]}>
                <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Total :</Text>
                <Text style={[styles.totalValue, { fontWeight: 'bold', color: '#2ecc71' }]}>
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
            </>
          ) : (
            <Text>Votre panier est vide</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de réception</Text>
          <TouchableOpacity
            style={[
              styles.optionButton,
              deliveryOption === 'delivery' && styles.optionButtonSelected,
            ]}
            onPress={() => setDeliveryOption('delivery')}
          >
            <Icon 
              name="truck" 
              size={20} 
              color={deliveryOption === 'delivery' ? '#2ecc71' : '#666'} 
            />
            <Text style={[
              styles.optionText,
              deliveryOption === 'delivery' && styles.optionTextSelected,
            ]}>
              Livraison à domicile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              deliveryOption === 'pickup' && styles.optionButtonSelected,
            ]}
            onPress={() => setDeliveryOption('pickup')}
          >
            <Icon 
              name="package" 
              size={20} 
              color={deliveryOption === 'pickup' ? '#2ecc71' : '#666'} 
            />
            <Text style={[
              styles.optionText,
              deliveryOption === 'pickup' && styles.optionTextSelected,
            ]}>
              Retrait en magasin
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <Text style={styles.noteText}>
            Choisissez si vous souhaitez recevoir vos articles chez vous ou les retirer dans un magasin près de chez vous.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.continueButton, !deliveryOption && styles.continueButtonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!deliveryOption}
        >
          <LinearGradient
            colors={deliveryOption ? ['#2ecc71', '#27ae60'] : ['#ccc', '#bbb']}
            style={styles.buttonGradient}
          >
            <Icon 
              name="arrow-right" 
              size={22} 
              color="#fff" 
              style={styles.buttonIcon} 
            />
            <Text style={styles.continueButtonText}>Continuer</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 150,
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
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
  },
  totalFinal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionButtonSelected: {
    borderColor: '#2ecc71',
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  optionTextSelected: {
    color: '#2ecc71',
    fontWeight: '600',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    marginBottom: 20,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  buttonIcon: {
    marginRight: 10,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 50,
  },
});

export default DeliveryOptionScreen;