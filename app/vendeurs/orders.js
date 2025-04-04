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
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Récupérer le userId et le token depuis AsyncStorage
        const userData = await AsyncStorage.getItem('user');
        const userId = userData ? JSON.parse(userData).id : null;
        const token = userData ? JSON.parse(userData).token : null;

        if (!userId || !token) {
          throw new Error('Utilisateur non authentifié');
        }

        const response = await fetch(
          `http://195.35.24.128:8081/api/paniers/vendeur/liste/${userId}`,
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

        const formattedOrders = result.data.map(order => ({
          id: order.id.toString(),
          customer: order.clientNom || 'Client inconnu',
          total: order.produits.reduce((sum, produit) => 
            sum + (produit.prix * produit.quantite), 0),
          status: 'Pending', // À adapter si vous avez un champ status
          date: order.createdAt.split('T')[0],
        }));

        setOrders(formattedOrders);
        setFetchError(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des commandes:', err);
        setOrders([]);
        setFetchError(true);
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
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`vendeurs/orderDetails?orderId=${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Commande #{item.id}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'Pending' && styles.statusPending,
          item.status === 'Shipped' && styles.statusShipped,
          item.status === 'Completed' && styles.statusCompleted,
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'Pending' ? 'En attente' : 
             item.status === 'Shipped' ? 'Expédiée' : 'Complétée'}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderBody}>
        {[
          { icon: 'user', value: item.customer },
          { icon: 'calendar', value: item.date },
        ].map((info, index) => (
          <View key={index} style={styles.orderInfo}>
            <View style={styles.infoIconContainer}>
              <Icon name={info.icon} size={18} color="#4A5568" />
            </View>
            <Text style={styles.orderText}>{info.value}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, {
        opacity: headerAnim,
        transform: [{
          translateY: headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
          }),
        }],
      }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('vendeurs/home')}
          >
            <Icon name="chevron-left" size={24} color="#4A5568" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Commandes</Text>
          <View style={{ width: 24 }} />
        </View>
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'transparent']}
          style={styles.headerOverlay}
        />
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      ) : (
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Filtres</Text>
            </View>
            <View style={styles.searchContainer}>
              <Icon name="search" size={18} color="#A0AEC0" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher commandes..."
                placeholderTextColor="#A0AEC0"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              {['toutes', 'en attente', 'expédiées', 'complétées'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterButton,
                    filter === item && styles.activeFilterButton,
                  ]}
                  onPress={() => setFilter(item)}
                >
                  <Text style={[
                    styles.filterText,
                    filter === item && styles.activeFilterText,
                  ]}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text style={styles.resultsText}>
            {filteredOrders.length} {filteredOrders.length === 1 ? 'commande' : 'commandes'} {filter === 'toutes' ? '' : `(${filter})`}
          </Text>

          <FlatList
            data={filteredOrders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ordersList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="package" size={48} color="#CBD5E0" />
                <Text style={styles.emptyText}>Aucune commande trouvée</Text>
                {fetchError && (
                  <Text style={styles.emptySubtext}>
                    Une erreur est survenue lors de la récupération des commandes.
                  </Text>
                )}
                {!fetchError && (
                  <Text style={styles.emptySubtext}>
                    Aucune commande ne correspond à vos critères.
                  </Text>
                )}
              </View>
            }
          />
        </Animated.View>
      )}

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  section: {
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
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#1A202C',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#EDF2F7',
  },
  activeFilterButton: {
    backgroundColor: '#38A169',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#718096',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ordersList: {
    paddingBottom: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 12,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FEFCBF',
  },
  statusShipped: {
    backgroundColor: '#BEE3F8',
  },
  statusCompleted: {
    backgroundColor: '#C6F6D5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A202C',
  },
  orderBody: {
    marginBottom: 12,
  },
  orderInfo: {
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
  orderText: {
    fontSize: 15,
    color: '#1A202C',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
});

export default SellerOrdersScreen;