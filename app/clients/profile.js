import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../AuthContext';

const ProfileScreen = () => {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
  
      const userDataString = await AsyncStorage.getItem("user");
      if (!userDataString) {
        console.error("Aucun utilisateur trouvé dans le stockage");
        return;
      }
  
      const userData = JSON.parse(userDataString);
      const { token, email } = userData;
  
      if (!token || !email) {
        console.error("Données utilisateur incomplètes");
        return;
      }
  
      const response = await fetch(
        `http://195.35.24.128:8081/api/user/findByUsername?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        console.error("Erreur API:", response.status, response.statusText);
        return;
      }
  
      const result = await response.json();
  
      if (result?.status === "succes" && result?.data) {
        setUser({
          name: `${result.data.prenom} ${result.data.nom}`,
          email: result.data.email,
          orders: 12,
          favorites: 8,
        });
      } else {
        console.error("Réponse API invalide:", result);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données utilisateur :",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchUserData();
  
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, fetchUserData]);

  const handleLogout = async () => {
    try {
      console.log('Déconnexion', 'Vous avez été déconnecté avec succès.');
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section Header */}
        <Animated.View style={[styles.profileHeader, { opacity: fadeAnim }]}>
          <View style={styles.userInitialsContainer}>
            <Text style={styles.userInitials}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </Animated.View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E6FFFA' }]}>
              <Icon name="shopping-bag" size={20} color="#38A169" />
            </View>
            <Text style={styles.statNumber}>{user.orders}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FEEBC8' }]}>
              <Icon name="heart" size={20} color="#DD6B20" />
            </View>
            <Text style={styles.statNumber}>{user.favorites}</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
        </View>

        {/* Options du menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Paramètres du compte</Text>
          
          {[
            { icon: 'user', label: 'Modifier le profil', action: () => router.push('/clients/ProfileEditScreen') },
            { icon: 'shopping-cart', label: 'Mes commandes', action: () => router.push('/clients/OrdersScreen') },
            { icon: 'credit-card', label: 'Moyens de paiement', action: () => console.log('Payment') },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon} size={18} color="#4A5568" />
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
              <Icon name="chevron-right" size={18} color="#A0AEC0" />
            </TouchableOpacity>
          ))}

          <Text style={[styles.menuTitle, { marginTop: 20 }]}>Assistance</Text>
          
          {[
            { icon: 'settings', label: 'Paramètres', action: () => console.log('Settings') },
            { icon: 'help-circle', label: 'Aide & Support', action: () => console.log('Help') },
            { icon: 'info', label: 'À propos', action: () => console.log('About') },
          ].map((item, index) => (
            <TouchableOpacity
              key={index + 3}
              style={styles.menuItem}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon} size={18} color="#4A5568" />
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
              <Icon name="chevron-right" size={18} color="#A0AEC0" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bouton Déconnexion */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  userInitialsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4299E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#718096',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#718096',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  menuIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#2D3748',
    flex: 1,
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E53E3E',
  },
  logoutText: {
    color: '#E53E3E',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ProfileScreen;