// SellerOrdersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';

const SellerOrdersScreen = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres disponibles
  const filters = ['Toutes', 'En attente', 'Expédiées', 'Complétées'];
  const [activeFilter, setActiveFilter] = useState('Toutes');

  // Récupérer les commandes depuis l'API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://195.35.24.128:8081/api/commandes/liste');
        const data = await response.json();

        const formattedOrders = data.map(order => ({
          id: order.id || `ORD${Math.random().toString(36).substr(2, 9)}`,
          customer: order开order.customer || 'Client inconnu',
          total: order.total || 0,
          status: order.status || 'Pending',
          date: order.date || new Date().toISOString().split('T')[0],
        }));
        
        setOrders(formattedOrders);
      } catch (err) {
        console.error('Erreur lors de la récupération des commandes:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filtrer les commandes selon le statut sélectionné
  const filteredOrders = activeFilter === 'Toutes'
    ? orders
    : orders.filter((order) =>
        activeFilter === 'En attente' ? order.status === 'Pending' :
        activeFilter === 'Expédiées' ? order.status === 'Shipped' :
        order.status === 'Completed'
      );

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/sellers/ordersDetails?orderId=${item.id}`)}
    >
      <View style={styles.orderInfo}>
        <Text style={styles.orderId}>#{item.id}</Text>
        <Text style={styles.orderCustomer}>{item.customer}</Text>
        <Text style={styles.orderDate}>{item.date}</Text>
        <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
      </View>
      <View style={styles.orderStatusContainer}>
        <Text style={[
          styles.orderStatus,
          item.status === 'Pending' ? styles.statusPending :
          item.status === 'Shipped' ? styles.statusShipped :
          styles.statusCompleted
        ]}>
          {item.status === 'Pending' ? 'En attente' : item.status === 'Shipped' ? 'Expédiée' : 'Complétée'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <Text style={styles.loadingText}>Chargement des commandes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* En-tête */}
      <LinearGradient
        colors={['#38A169', '#2D8A5B']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Commandes</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/sellers/home')}
          >
            <Icon name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.wave} />
      </LinearGradient>

      {/* Filtres */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste des commandes */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.orderList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune commande pour le moment.</Text>
        }
      />

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 12,
  },
  wave: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#F0F4F8',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  filterContainer: {
    paddingVertical: 10, // Réduit pour un conteneur plus compact
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEFF2',
  },
  filterContent: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingVertical: 6, // Réduit pour des boutons plus petits verticalement
    paddingHorizontal: 16, // Légèrement réduit pour compacter
    borderRadius: 20, // Coins arrondis plus petits
    marginRight: 10, // Espacement entre boutons réduit
    backgroundColor: '#F5F6F8',
    borderWidth: 1,
    borderColor: '#EDEFF2',
  },
  filterButtonActive: {
    backgroundColor: '#38A169',
    borderColor: '#38A169',
  },
  filterText: {
    fontSize: 14, // Réduit pour des petits boutons
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  orderList: {
    padding: 20,
    paddingBottom: 100,
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  orderCustomer: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38A169',
    marginTop: 4,
  },
  orderStatusContainer: {
    alignItems: 'center',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    color: '#fff',
  },
  statusPending: {
    backgroundColor: '#F1C40F',
  },
  statusShipped: {
    backgroundColor: '#3498DB',
  },
  statusCompleted: {
    backgroundColor: '#38A169',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default SellerOrdersScreen;