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

const TrackOrderScreen = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Données fictives de la commande
  const orderDetails = {
    orderNumber: 'XAI-123456',
    placedDate: '10 Mars 2025',
    estimatedDelivery: '15 Mars 2025',
    status: [
      { step: 'Commande reçue', date: '10 Mars 2025, 14:30', completed: true },
      { step: 'En préparation', date: '11 Mars 2025, 09:15', completed: true },
      { step: 'Expédiée', date: '12 Mars 2025, 16:45', completed: true },
      { step: 'Livrée', date: '15 Mars 2025 (estimé)', completed: false },
    ],
    deliveryAddress: '12 Rue des Lilas, 75001 Paris',
  };

  const renderStatusStep = (step, index) => {
    const isLast = index === orderDetails.status.length - 1;
    return (
      <View key={index} style={styles.statusStep}>
        <View style={styles.statusIconContainer}>
          <Icon
            name={step.completed ? 'check-circle' : 'circle'}
            size={24}
            color={step.completed ? '#2ecc71' : '#ccc'}
          />
          {!isLast && (
            <View
              style={[
                styles.statusLine,
                { backgroundColor: step.completed ? '#2ecc71' : '#ccc' },
              ]}
            />
          )}
        </View>
        <View style={styles.statusDetails}>
          <Text style={styles.statusStepText}>{step.step}</Text>
          <Text style={styles.statusDate}>{step.date}</Text>
        </View>
      </View>
    );
  };

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
          Suivi de la commande
        </Text>

        {/* Détails de la commande */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commande #{orderDetails.orderNumber}</Text>
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Date de commande :</Text>
            <Text style={styles.orderInfoValue}>{orderDetails.placedDate}</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Livraison estimée :</Text>
            <Text style={styles.orderInfoValue}>{orderDetails.estimatedDelivery}</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Adresse :</Text>
            <Text style={styles.orderInfoValue}>{orderDetails.deliveryAddress}</Text>
          </View>
        </View>

        {/* Progression de la livraison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut de la livraison</Text>
          <View style={styles.statusContainer}>
            {orderDetails.status.map(renderStatusStep)}
          </View>
        </View>

        {/* Carte fictive */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localisation en temps réel</Text>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>
              (Placeholder pour une carte - Intégration API possible)
            </Text>
          </View>
        </View>

        {/* Bouton de contact */}
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => console.log('Contacter le support')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#2ecc71', '#27ae60']}
            style={styles.buttonGradient}
          >
            <Icon
              name="message-circle"
              size={22}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.contactButtonText}>Contacter le support</Text>
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
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusContainer: {
    paddingLeft: 10,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  statusIconContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  statusLine: {
    position: 'absolute',
    top: 24,
    width: 2,
    height: 30,
    zIndex: -1,
  },
  statusDetails: {
    flex: 1,
    marginLeft: 15,
  },
  statusStepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusDate: {
    fontSize: 12,
    color: '#666',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  contactButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    marginBottom: 20,
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
  contactButtonText: {
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

export default TrackOrderScreen;