// SellerDashboardScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';

const SellerDashboardScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  const stats = {
    totalSales: 2450.75,
    pendingOrders: 8,
    completedOrders: 42,
  };

  const recentOrders = [
    { id: 'ORD126', customer: 'Marie Dupont', total: 89.99, status: 'Pending', date: 'Aujourd’hui' },
    { id: 'ORD127', customer: 'Pierre Leclerc', total: 34.99, status: 'Shipped', date: 'Hier' },
    { id: 'ORD128', customer: 'Sophie Martin', total: 150.50, status: 'Completed', date: '14 mars' },
  ];

  const notifications = [
    { id: '1', message: 'Commande #ORD126 reçue', time: '5 min', type: 'info' },
    { id: '2', message: 'Stock faible: T-shirt XL', time: '1h', type: 'warning' },
  ];

  useEffect(() => {
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

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/sellers/ordersDetails?orderId=${item.id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.orderIcon}>
        <Icon name="package" size={20} color="#6B7280" />
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.orderId}>#{item.id}</Text>
        <Text style={styles.orderCustomer}>{item.customer}</Text>
        <Text style={styles.orderDate}>{item.date}</Text>
      </View>
      <View style={styles.orderSummary}>
        <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
        <Text style={[styles.orderStatus, {
          color: item.status === 'Pending' ? '#F59E0B' :
                item.status === 'Shipped' ? '#3B82F6' : '#10B981',
        }]}>
          {item.status === 'Pending' ? 'En attente' :
           item.status === 'Shipped' ? 'Expédiée' : 'Complétée'}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
            <Text style={styles.headerTitle}>Dashboard</Text>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/sellers/profile')}
            >
              <Icon name="user" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${stats.totalSales.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Ventes Totales</Text>
            <Icon name="trending-up" size={20} color="#10B981" style={styles.statIcon} />
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pendingOrders}</Text>
            <Text style={styles.statLabel}>En attente</Text>
            <Icon name="clock" size={20} color="#F59E0B" style={styles.statIcon} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/sellers/addProduct')}
          >
            <LinearGradient colors={['#10B981', '#10B981']} style={styles.actionGradient}>
              <Icon name="plus" size={20} color="#fff" />
              <Text style={styles.actionText}>Produit</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/sellers/orders')}
          >
            <LinearGradient colors={['#3B82F6', '#3B82F6']} style={styles.actionGradient}>
              <Icon name="package" size={20} color="#fff" />
              <Text style={styles.actionText}>Commandes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {notifications.map((notif) => (
            <View key={notif.id} style={styles.notificationCard}>
              <LinearGradient
                colors={notif.type === 'info' ? ['#E5E7EB', '#F9FAFB'] : ['#FEF3C7', '#FFFBEB']}
                style={styles.notificationGradient}
              >
                <Icon
                  name={notif.type === 'info' ? 'info' : 'alert-triangle'}
                  size={18}
                  color={notif.type === 'info' ? '#3B82F6' : '#F59E0B'}
                  style={styles.notificationIcon}
                />
                <View style={styles.notificationDetails}>
                  <Text style={styles.notificationMessage}>{notif.message}</Text>
                  <Text style={styles.notificationTime}>{notif.time}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Activité Récente</Text>
          <FlatList
            data={recentOrders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/sellers/orders')}
          >
            <Text style={styles.viewAllText}>Voir plus</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
  profileButton: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statIcon: {
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  actionGradient: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  notificationCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  notificationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
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
  orderSummary: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  viewAllButton: {
    alignItems: 'center',
    padding: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default SellerDashboardScreen;