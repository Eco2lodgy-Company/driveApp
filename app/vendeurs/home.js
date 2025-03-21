import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { AuthContext } from '../../AuthContext';

const SellerDashboard = () => {
  const { width } = useWindowDimensions();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse = await fetch('https://api.drive.re/seller/stats');
        const statsData = await statsResponse.json();
        setStats(statsData);

        const ordersResponse = await fetch('https://api.drive.re/seller/orders');
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.slice(0, 5));

        const notifResponse = await fetch('https://api.drive.re/seller/notifications');
        const notifData = await notifResponse.json();
        setNotifications(notifData.slice(0, 5));
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchData();
  }, []);

  // Données mock
  const mockStats = {
    totalSales: 12500,
    ordersCount: 87,
    pendingOrders: 12,
    revenueToday: 1450,
    conversionRate: 3.2, // Nouvelle stat
  };

  const mockOrders = [
    { id: '1', customer: 'Jean Dupont', total: 89.99, status: 'En attente', date: '2025-03-21' },
    { id: '2', customer: 'Marie Curie', total: 149.50, status: 'Expédiée', date: '2025-03-20' },
    { id: '3', customer: 'Paul Martin', total: 59.75, status: 'Livrée', date: '2025-03-20' },
    { id: '4', customer: 'Sophie Lemoine', total: 199.99, status: 'En attente', date: '2025-03-19' },
  ];

  const mockNotifications = [
    { id: '1', message: 'Nouvelle commande #1234', time: '10:45', read: false },
    { id: '2', message: 'Stock faible: Produit X', time: '09:30', read: false },
    { id: '3', message: 'Nouveau commentaire client', time: 'Hier', read: true },
  ];

  const handleOrderPress = (order) => {
    console.log('Commande cliquée:', order);
    // Ajouter navigation vers détail commande
    // navigation.navigate('OrderDetails', { orderId: order.id });
  };

  const handleNotificationPress = (notification) => {
    console.log('Notification cliquée:', notification);
    // Marquer comme lue ou naviguer vers détail
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderPress(item)}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderCustomer}>{item.customer}</Text>
        <Text style={styles.orderDate}>{item.date}</Text>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.orderAmount}>€{item.total.toFixed(2)}</Text>
        <Text style={[styles.orderStatus, { color: item.status === 'En attente' ? '#ff6200' : '#4caf50' }]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationText, !item.read && styles.unreadText]}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord vendeur</Text>
        <Text style={styles.subtitle}>drive.re - Gestion boutique</Text>
      </View>

      {/* Statistiques */}
      <View style={[styles.statsContainer, { width: width * 0.95, maxWidth: 800 }]}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              €{(stats?.totalSales || mockStats.totalSales).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Ventes totales</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.ordersCount || mockStats.ordersCount}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.pendingOrders || mockStats.pendingOrders}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              €{(stats?.revenueToday || mockStats.revenueToday).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Aujourd'hui</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.conversionRate || mockStats.conversionRate}%</Text>
            <Text style={styles.statLabel}>Taux de conversion</Text>
          </View>
        </View>
      </View>

      {/* Dernières commandes */}
      <View style={[styles.section, { width: width * 0.95, maxWidth: 800 }]}>
        <Text style={styles.sectionTitle}>Dernières commandes</Text>
        <FlatList
          data={orders.length > 0 ? orders : mockOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>Voir toutes les commandes</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <View style={[styles.section, { width: width * 0.95, maxWidth: 800 }]}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <FlatList
          data={notifications.length > 0 ? notifications : mockNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>Voir toutes les notifications</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: Dimensions.get('window').width > 600 ? 32 : 24,
    fontWeight: '800',
    color: '#333',
  },
  subtitle: {
    fontSize: Dimensions.get('window').width > 600 ? 16 : 14,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: Dimensions.get('window').width > 600 ? '19%' : '48%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ff6200',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderInfo: {
    flex: 1,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  orderDetails: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6200',
  },
  orderStatus: {
    fontSize: 14,
    marginTop: 2,
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6200',
  },
  notificationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  unreadText: {
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
  viewAllButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  viewAllText: {
    color: '#ff6200',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SellerDashboard;