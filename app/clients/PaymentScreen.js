import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentScreen = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const shipping = 5.99;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shipping;

  // État pour les champs de paiement, la méthode et le popup
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('visa');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Vérification si tous les champs sont remplis
  const isFormValid = cardNumber.length === 16 && expiryDate.length === 5 && cvv.length === 3 && cardHolder.length > 0;

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        // Récupération du token depuis AsyncStorage
        const userData = await AsyncStorage.getItem('user');
        const token = userData ? JSON.parse(userData).token : null;
        const userId = userData ? JSON.parse(userData).id : null;
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

  const handlePayment = () => {
    if (isFormValid) {
      console.log('Payment processed:', { paymentMethod, cardNumber, expiryDate, cvv, cardHolder, total });
      setShowSuccessModal(true); // Afficher le popup
    } else {
      console.log('Formulaire invalide');
    }
  };

  const closeModalAndRedirect = () => {
    setShowSuccessModal(false);
    router.push('/clients/order-confirmation');
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
          Paiement
        </Text>

        {/* Récapitulatif du panier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre panier</Text>
          {loading ? (
            <Text>Chargement du panier...</Text>
          ) : cartItems.length > 0 ? (
            <>
              {cartItems.map(renderCartItem)}
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Sous-total :</Text>
                <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Livraison :</Text>
                <Text style={styles.totalValue}>${shipping.toFixed(2)}</Text>
              </View>
              <View style={[styles.totalContainer, styles.totalFinal]}>
                <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Total :</Text>
                <Text style={[styles.totalValue, { fontWeight: 'bold', color: '#2ecc71' }]}>
                  ${total.toFixed(2)}
                </Text>
              </View>
            </>
          ) : (
            <Text>Votre panier est vide</Text>
          )}
        </View>

        {/* Sélection de la méthode de paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Méthode de paiement</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'visa' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('visa')}
            >
              <Icon name="credit-card" size={20} color={paymentMethod === 'visa' ? '#2ecc71' : '#666'} />
              <Text style={[
                styles.paymentText,
                paymentMethod === 'visa' && styles.paymentTextSelected,
              ]}>
                Visa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'mastercard' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('mastercard')}
            >
              <Icon name="credit-card" size={20} color={paymentMethod === 'mastercard' ? '#2ecc71' : '#666'} />
              <Text style={[
                styles.paymentText,
                paymentMethod === 'mastercard' && styles.paymentTextSelected,
              ]}>
                Mastercard
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Formulaire de paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la carte</Text>
          <TextInput
            style={styles.input}
            placeholder="Numéro de carte"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="numeric"
            maxLength={16}
            placeholderTextColor="#666"
          />
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="MM/AA"
              value={expiryDate}
              onChangeText={setExpiryDate}
              keyboardType="numeric"
              maxLength={5}
              placeholderTextColor="#666"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="CVV"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={3}
              placeholderTextColor="#666"
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Titulaire de la carte"
            value={cardHolder}
            onChangeText={setCardHolder}
            placeholderTextColor="#666"
          />
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note</Text>
          <Text style={styles.noteText}>
            Votre paiement sera traité en toute sécurité. Assurez-vous que les informations saisies sont correctes avant de confirmer.
          </Text>
        </View>

        {/* Bouton de paiement */}
        <TouchableOpacity 
          style={[styles.payButton, !isFormValid && styles.payButtonDisabled]}
          onPress={handlePayment}
          activeOpacity={0.85}
          disabled={!isFormValid}
        >
          <LinearGradient
            colors={isFormValid ? ['#2ecc71', '#27ae60'] : ['#ccc', '#bbb']}
            style={styles.buttonGradient}
          >
            <Icon 
              name="credit-card" 
              size={22} 
              color="#fff" 
              style={styles.buttonIcon} 
            />
            <Text style={styles.payButtonText}>Payer ${total.toFixed(2)}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Popup de succès */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModalAndRedirect}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="check-circle" size={50} color="#2ecc71" style={styles.successIcon} />
            <Text style={styles.modalTitle}>Paiement réussi !</Text>
            <Text style={styles.modalMessage}>
              Votre commande de ${total.toFixed(2)} a été confirmée avec succès.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeModalAndRedirect}
            >
              <Text style={styles.modalButtonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'home', label: 'Home', route: '/clients/home' },
          { icon: 'search', label: 'Search', route: '/clients/shops' },
          { icon: 'shopping-cart', label: 'Cart', route: '/clients/cart' },
          { icon: 'user', label: 'Profile', route: '/clients/profile' },
        ].map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.navItem}
            onPress={() => router.push(item.route)}
          >
            <Icon name={item.icon} size={24} color="#2ecc71" />
            <Text style={styles.navText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentOptionSelected: {
    borderColor: '#2ecc71',
    elevation: 2,
  },
  paymentText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  paymentTextSelected: {
    color: '#2ecc71',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  payButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    marginBottom: 20,
  },
  payButtonDisabled: {
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
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  successIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    padding: 5,
  },
  navText: {
    fontSize: 12,
    color: '#2ecc71',
    marginTop: 4,
  },
});

export default PaymentScreen;