import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Animated,
  StyleSheet,
} from 'react-native';
import { AuthContext } from '../../AuthContext';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from './components/BottomNavigation';

const SellerDashboardScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState("");

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
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedData = await AsyncStorage.getItem("user");
        if (!storedData) throw new Error("Aucun token trouvé");
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        console.log("Données de l'utilisateur récupérées :", parsedData);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };
    fetchProfile();
  }, []);

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`vendeurs/orderDetails?orderId=${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Commande #{item.id}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === 'Pending' && styles.statusPending,
            item.status === 'Shipped' && styles.statusShipped,
            item.status === 'Completed' && styles.statusCompleted,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === 'Pending' ? 'En attente' : item.status === 'Shipped' ? 'Expédiée' : 'Complétée'}
          </Text>
        </View>
      </View>
      <View style={styles.orderBody}>
        <View style={styles.orderInfo}>
          <Icon name="user" size={18} color="#4A5568" style={styles.orderIcon} />
          <Text style={styles.orderText}>{item.customer}</Text>
        </View>
        <View style={styles.orderInfo}>
          <Icon name="calendar" size={18} color="#4A5568" style={styles.orderIcon} />
          <Text style={styles.orderText}>{item.date}</Text>
        </View>
      </View>
      <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <View
        style={[
          styles.notificationIcon,
          { backgroundColor: item.type === 'info' ? '#DBEAFE' : '#FEF3C7' },
        ]}
      >
        <Icon
          name={item.type === 'info' ? 'info' : 'alert-triangle'}
          size={18}
          color={item.type === 'info' ? '#3B82F6' : '#D97706'}
        />
      </View>
      <View style={styles.notificationDetails}>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </View>
  );

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
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('vendeurs/profile')}>
              <Icon name="user" size={24} color="#4A5568" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tableau de bord</Text>
            <View style={{ width: 24 }} />
          </View>
          <Text style={styles.headerSubtitle}>
            {userData.nom || 'Vendeur'} {userData.prenom || ''}
          </Text>
        </LinearGradient>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsContainer}>
            {[
              { label: 'Ventes Totales', value: `$${stats.totalSales.toFixed(2)}`, icon: 'dollar-sign' },
              { label: 'En attente', value: stats.pendingOrders, icon: 'clock' },
              { label: 'Complétées', value: stats.completedOrders, icon: 'check-circle' },
            ].map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Icon name={stat.icon} size={20} color="#4A5568" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('vendeurs/addProducts')}
            >
              <LinearGradient colors={['#38A169', '#2F855A']} style={styles.actionGradient}>
                <Icon name="plus" size={20} color="#FFFFFF" style={styles.actionIcon} />
                <Text style={styles.actionText}>Ajouter Produit</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('vendeurs/orders')}
            >
              <LinearGradient colors={['#3182CE', '#2B6CB0']} style={styles.actionGradient}>
                <Icon name="package" size={20} color="#FFFFFF" style={styles.actionIcon} />
                <Text style={styles.actionText}>Voir Commandes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.notificationList}
          />
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Commandes Récentes</Text>
          <FlatList
            data={recentOrders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.orderList}
          />
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => router.push('vendeurs/orders')}
          >
            <Text style={styles.viewMoreText}>Voir toutes les commandes</Text>
            <Icon name="chevron-right" size={16} color="#38A169" />
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileButton: {
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
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 20,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#718096',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationList: {
    paddingBottom: 4,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
  },
  notificationTime: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  orderList: {
    paddingBottom: 8,
  },
  orderCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  statusPending: { backgroundColor: '#FEFCBF' },
  statusShipped: { backgroundColor: '#BEE3F8' },
  statusCompleted: { backgroundColor: '#C6F6D5' },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A202C',
  },
  orderBody: {
    marginBottom: 8,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderIcon: {
    marginRight: 10,
  },
  orderText: {
    fontSize: 14,
    color: '#4A5568',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38A169',
    textAlign: 'right',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38A169',
    marginRight: 4,
  },
});

export default SellerDashboardScreen;