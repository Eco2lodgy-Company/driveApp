import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
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

  const mockOrder = {
    id: orderId || 'ORD123456',
    customer: 'Jean Dupont',
    total: 149.97,
    status: 'Pending',
    date: '2025-03-26',
    items: [
      { id: '1', name: 'T-shirt Bleu', quantity: 2, price: 29.99 },
      { id: '2', name: 'Jean Slim', quantity: 1, price: 59.99 },
      { id: '3', name: 'Chaussettes x3', quantity: 3, price: 9.99 }
    ]
  };

  useEffect(() => {
    setTimeout(() => {
      setOrder(mockOrder);
    }, 500);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [orderId]);

  const renderOrderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemIcon}>
        <Icon name="package" size={20} color="#6B7280" />
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>Quantité: {item.quantity}</Text>
        <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
      </View>
    </View>
  );

  const handleValidate = () => {
    console.log('Commande validée:', orderId);
    setOrder(prevOrder => ({
      ...prevOrder,
      status: 'Validated'
    }));
  };

  const handleShip = () => {
    console.log('Commande marquée comme expédiée:', orderId);
    setOrder(prevOrder => ({
      ...prevOrder,
      status: 'Shipped'
    }));
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Animated.View style={[styles.header, {
        opacity: headerAnim,
        transform: [{
          translateY: headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
          }),
        }],
      }]}>
        <LinearGradient
          colors={['#fff', '#F9FAFB']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Détails Commande #{order.id}</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('vendeurs/orders')}
            >
              <Icon name="arrow-left" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Client:</Text>
            <Text style={styles.infoValue}>{order.customer}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{order.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut:</Text>
            <Text style={[styles.infoValue, styles.statusText, {
              color: order.status === 'Pending' ? '#F1C40F' :
                    order.status === 'Validated' ? '#8B5CF6' :
                    order.status === 'Shipped' ? '#3498DB' : '#10B981'
            }]}>
              {order.status === 'Pending' ? 'En attente' :
               order.status === 'Validated' ? 'Validée' :
               order.status === 'Shipped' ? 'Expédiée' : 'Complétée'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total:</Text>
            <Text style={styles.infoValue}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Articles ({order.items.length})</Text>
          <FlatList
            data={order.items}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            style={styles.itemsList}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={handleValidate}
            disabled={order.status !== 'Pending'}
          >
            <Text style={styles.actionButtonText}>Valider la commande</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#3498DB' }]}
            onPress={handleShip}
            disabled={order.status === 'Pending' || order.status === 'Shipped'}
          >
            <Text style={styles.actionButtonText}>Marquer comme expédié</Text>
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 80, // Espace pour les boutons et la BottomNavigation
  },
  orderInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
  },
  statusText: {
    fontWeight: '600',
  },
  itemsSection: {
    flex: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  itemsList: {
    maxHeight: 300, // Hauteur maximale pour la liste scrollable
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20, // Espace supplémentaire en bas
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 50,
  },
});

export default OrderDetailsScreen;