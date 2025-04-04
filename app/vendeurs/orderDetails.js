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
      { id: '3', name: 'Chaussettes x3', quantity: 3, price: 9.99 },
    ],
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
        <Icon name="package" size={18} color="#4A5568" />
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
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

  if (!order) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <Icon name="loader" size={24} color="#4A5568" />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
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
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default OrderDetailsScreen;