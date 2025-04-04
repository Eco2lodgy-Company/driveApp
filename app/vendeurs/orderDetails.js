import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';

const OrderDetailsScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const userData = await AsyncStorage.getItem('user');
        const token  = JSON.parse(userData)?.token;
        
        if (!token) {
          throw new Error('Utilisateur non authentifié');
        }

        const response = await fetch(
          `http://195.35.24.128:8081/api/paniers/vendeur/findById/${orderId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Erreur réseau');
        }

        const result = await response.json();
        
        if (result.status !== 'success') {
          throw new Error(result.message || 'Erreur lors de la récupération des données');
        }

        // Formater les données
        const formattedOrder = {
          id: result.data.id.toString(),
          customer: result.data.clientNom,
          email: result.data.clientEmail,
          total: result.data.produits.reduce((sum, produit) => 
            sum + (produit.prix * produit.quantite), 0),
          status: 'Pending', // À adapter si vous avez un statut dans l'API
          date: result.data.createdAt.split('T')[0],
          items: result.data.produits.map(produit => ({
            id: produit.idProduit.toString(),
            name: produit.nom,
            description: produit.description,
            quantity: produit.quantite,
            price: produit.prix,
            imagePath: produit.imagePath,
          })),
        };

        setOrder(formattedOrder);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des détails:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [orderId]);

  const renderOrderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image 
        source={{ uri: `http://195.35.24.128:8081${item.imagePath}` }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemQuantity}>Quantité: {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  const handleValidate = () => {
    console.log('Commande validée:', orderId);
    setOrder((prevOrder) => ({ ...prevOrder, status: 'Validated' }));
  };

  const handleShip = () => {
    console.log('Commande marquée comme expédiée:', orderId);
    setOrder((prevOrder) => ({ ...prevOrder, status: 'Shipped' }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <Icon name="loader" size={24} color="#4A5568" />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <Icon name="alert-circle" size={24} color="#EF4444" />
          <Text style={styles.errorText}>Erreur: {error || 'Commande non trouvée'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient colors={['#FFFFFF', 'rgba(255,255,255,0.9)']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push('vendeurs/orders')}>
              <Icon name="chevron-left" size={24} color="#4A5568" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Commande #{order.id}</Text>
            <View style={{ width: 24 }} />
          </View>
          <View
            style={[
              styles.statusBadge,
              order.status === 'Pending' && styles.statusPending,
              order.status === 'Validated' && styles.statusValidated,
              order.status === 'Shipped' && styles.statusShipped,
              order.status === 'Completed' && styles.statusCompleted,
            ]}
          >
            <Text style={styles.statusText}>
              {order.status === 'Pending'
                ? 'En attente'
                : order.status === 'Validated'
                ? 'Validée'
                : order.status === 'Shipped'
                ? 'Expédiée'
                : 'Complétée'}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <View style={styles.orderInfo}>
          {[
            { icon: 'user', label: 'Client', value: order.customer },
            { icon: 'mail', label: 'Email', value: order.email },
            { icon: 'calendar', label: 'Date', value: order.date },
            { icon: 'dollar-sign', label: 'Total', value: `$${order.total.toFixed(2)}` },
          ].map((info, index) => (
            <View key={index} style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name={info.icon} size={18} color="#4A5568" />
              </View>
              <Text style={styles.infoLabel}>{info.label}:</Text>
              <Text style={styles.infoValue}>{info.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Articles ({order.items.length})</Text>
          <FlatList
            data={order.items}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.itemsList}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: order.status === 'Pending' ? '#38A169' : '#E2E8F0' },
            ]}
            onPress={handleValidate}
            disabled={order.status !== 'Pending'}
          >
            <Icon name="check" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Valider</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  order.status === 'Validated' ? '#3182CE' : '#E2E8F0',
              },
            ]}
            onPress={handleShip}
            disabled={order.status === 'Pending' || order.status === 'Shipped'}
          >
            <Icon name="truck" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Expédier</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
  },
  headerGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    flex: 1,
    textAlign: 'center',
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusPending: { backgroundColor: '#FEFCBF' },
  statusValidated: { backgroundColor: '#E9D8FD' },
  statusShipped: { backgroundColor: '#BEE3F8' },
  statusCompleted: { backgroundColor: '#C6F6D5' },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A202C',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  orderInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#718096',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
    flex: 1,
  },
  itemsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsList: {
    paddingBottom: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
  },
  itemDescription: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#38A169',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 8,
  },
});

export default OrderDetailsScreen;