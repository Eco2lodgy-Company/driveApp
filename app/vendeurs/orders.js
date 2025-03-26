import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';

const SellerOrdersScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('toutes');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://195.35.24.128:8081/api/commandes/liste');
        const data = await response.json();

        const formattedOrders = data.map(order => ({
          id: order.id || `ORD${Math.random().toString(36).substr(2, 9)}`,
          customer: order.customer || 'Client inconnu',
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

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'toutes' ||
      (filter === 'en attente' && order.status === 'Pending') ||
      (filter === 'expédiées' && order.status === 'Shipped') ||
      (filter === 'complétées' && order.status === 'Completed');
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderIcon}>
        <Icon name="shopping-bag" size={20} color="#6B7280" />
      </View>
      <TouchableOpacity
        style={styles.orderDetails}
        onPress={() => router.push(`vendeurs/orderDetails?orderId=${item.id}`)}
      >
        <Text style={styles.orderId}>#{item.id}</Text>
        <Text style={styles.orderCustomer}>{item.customer}</Text>
        <Text style={styles.orderDate}>{item.date}</Text>
        <Text style={[
          styles.orderStatus,
          { 
            color: item.status === 'Pending' ? '#F1C40F' : 
                  item.status === 'Shipped' ? '#3498DB' : '#10B981'
          }
        ]}>
          {item.status === 'Pending' ? 'En attente' : 
           item.status === 'Shipped' ? 'Expédiée' : 'Complétée'}
        </Text>
        <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
      </TouchableOpacity>
    </View>
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
            <Text style={styles.headerTitle}>Commandes</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/sellers/home')}
            >
              <Icon name="arrow-left" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher (ID, client...)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'toutes' && styles.activeFilter]}
            onPress={() => setFilter('toutes')}
          >
            <Text style={styles.filterText}>Toutes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'en attente' && styles.activeFilter]}
            onPress={() => setFilter('en attente')}
          >
            <Text style={styles.filterText}>En attente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'expédiées' && styles.activeFilter]}
            onPress={() => setFilter('expédiées')}
          >
            <Text style={styles.filterText}>Expédiées</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'complétées' && styles.activeFilter]}
            onPress={() => setFilter('complétées')}
          >
            <Text style={styles.filterText}>Complétées</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {filteredOrders.length} commande(s) trouvée(s)
          </Text>
          <FlatList
            data={filteredOrders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucune commande trouvée</Text>
            }
          />
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
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  contentContainer: {
    padding: 16,
    flex: 1,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    color: '#111827',
    fontWeight: '600',
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderDetails: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  orderCustomer: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 50,
  },
});

export default SellerOrdersScreen;