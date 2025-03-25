import React, { useState } from 'react';
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

const DeliveryOptionScreen = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  
  // État pour l'option sélectionnée
  const [deliveryOption, setDeliveryOption] = useState(null);

  // Données fictives du panier (simplifiées pour l'exemple)
  const cartItems = [
    { id: '1', name: 'T-Shirt Black', price: 29.99, quantity: 1 },
    { id: '2', name: 'Jeans Blue', price: 59.99, quantity: 2 },
  ];
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleContinue = () => {
    if (deliveryOption) {
      // Redirection selon l'option choisie
      const nextRoute = deliveryOption === 'delivery' 
        ? '/clients/delivery-address' 
        : '/clients/pickup-location';
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

        {/* Récapitulatif du panier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre panier</Text>
          {cartItems.map(renderCartItem)}
          <View style={[styles.totalContainer, styles.totalFinal]}>
            <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Total :</Text>
            <Text style={[styles.totalValue, { fontWeight: 'bold', color: '#2ecc71' }]}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Options de livraison/retrait */}
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

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <Text style={styles.noteText}>
            Choisissez si vous souhaitez recevoir vos articles chez vous ou les retirer dans un magasin près de chez vous.
          </Text>
        </View>

        {/* Bouton continuer */}
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

export default DeliveryOptionScreen;