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
import BottomNavigation from './components/BottomNavigation'; // Importation ajoutée

const SellerDashboardScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const { user } = useContext(AuthContext);
  const [userData,setUserData] = useState("");

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedData = await AsyncStorage.getItem("user"); // Récupération du token
        if (!storedData) {
          console.error("Aucun token trouvé !");
          return;
        }

        let Data;
        try {
          Data = JSON.parse(storedData); // Convertir en JSON
          setUserData(Data);
        } catch (error) {
          console.error("Erreur lors de l'analyse du JSON :", error);
          return;
        }

        if (!Data.email || !Data.token) {
          console.error("Données du token incomplètes !");
          return;
        }

        console.log("Données de l'utilisateur récupérées :", Data);

        // Ajoute ici la logique pour utiliser Data (ex: requête API)

      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };

    fetchProfile(); // Appel de la fonction
  }, []); // Dépendance vide → exécution au montage
  

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderIcon}>
        <Icon name="package" size={20} color="#6B7280" />
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

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <View style={styles.notificationIcon}>
        <Icon 
          name={item.type === 'info' ? 'info' : 'alert-triangle'} 
          size={20} 
          color={item.type === 'info' ? '#3B82F6' : '#F59E0B'} 
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
            <Text style={styles.headerTitle}>Tableau de bord</Text>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('vendeurs/profile')}
            >
              <Icon name="user" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>{userData.nom || 'vide'}  {userData.prenom || 'vide'}</Text>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${stats.totalSales.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Ventes Totales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.completedOrders}</Text>
              <Text style={styles.statLabel}>Complétées</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('vendeurs/addProducts')}
            >
              <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.actionGradient}>
                <Icon name="plus" size={20} color="#fff" />
                <Text style={styles.actionText}>Produit</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('vendeurs/orders')}
            >
              <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.actionGradient}>
                <Icon name="package" size={20} color="#fff" />
                <Text style={styles.actionText}>Commandes</Text>
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
          />
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Commandes Récentes</Text>
          <FlatList
            data={recentOrders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => router.push('/sellers/orders')}
          >
            <Text style={styles.viewMoreText}>Voir plus</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      <BottomNavigation /> {/* Composant ajouté */}
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
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Ajusté pour BottomNavigation
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
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
    padding: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
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
  viewMoreButton: {
    alignItems: 'center',
    padding: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default SellerDashboardScreen;