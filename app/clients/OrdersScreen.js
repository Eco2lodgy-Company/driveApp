// OrdersScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';

const OrdersScreen = () => {
  const router = useRouter();

  // Données d'exemple pour les commandes
  const orders = [
    {
      id: 'ORD123',
      date: '2025-03-10',
      total: 149.97,
      status: 'Delivered',
      items: [
        { name: 'Premium Coffee Maker', quantity: 1, price: 89.99 },
        { name: 'Stainless Steel Mug', quantity: 2, price: 24.99 },
      ],
    },
    {
      id: 'ORD124',
      date: '2025-03-05',
      total: 34.99,
      status: 'Shipped',
      items: [
        { name: 'Coffee Grinder', quantity: 1, price: 34.99 },
      ],
    },
    {
      id: 'ORD125',
      date: '2025-03-01',
      total: 65.97,
      status: 'Processing',
      items: [
        { name: 'Organic Coffee Beans', quantity: 3, price: 15.99 },
        { name: 'Stainless Steel Mug', quantity: 1, price: 24.99 },
      ],
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return styles.statusDelivered;
      case 'Shipped':
        return styles.statusShipped;
      case 'Processing':
        return styles.statusProcessing;
      default:
        return styles.statusProcessing;
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/clients/TrackOrderScreen`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Commande #{item.id}</Text>
        <Text style={[styles.orderStatus, getStatusStyle(item.status)]}>
          {item.status === 'Delivered' ? 'Livrée' : item.status === 'Shipped' ? 'Expédiée' : 'En cours'}
        </Text>
      </View>
      <Text style={styles.orderDate}>{new Date(item.date).toLocaleDateString('fr-FR')}</Text>
      <Text style={styles.orderItems}>
        {item.items.length} article{item.items.length > 1 ? 's' : ''} 
      </Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
        <Text style={styles.viewDetails}>Voir détails</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Mes Commandes</Text>

        {orders.length === 0 ? (
          <Text style={styles.empty}>Aucune commande pour le moment</Text>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
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
  listContent: {
    paddingBottom: 100, // Espace pour BottomNavigation
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusDelivered: {
    backgroundColor: '#38A169',
    color: '#fff',
  },
  statusShipped: {
    backgroundColor: '#3498DB',
    color: '#fff',
  },
  statusProcessing: {
    backgroundColor: '#F1C40F',
    color: '#1A1A1A',
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38A169',
  },
  viewDetails: {
    fontSize: 14,
    color: '#38A169',
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
  },
});

export default OrdersScreen;