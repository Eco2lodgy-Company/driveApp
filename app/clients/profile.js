import React, { useContext, useEffect, useState,useCallback } from 'react';
import {
  View,
  Text,
  Image,
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

  // Fonction pour récupérer le token et les données utilisateur
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
  
      // Récupérer le token depuis AsyncStorage
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
        console.log(result.data);
        setUser({
          name: `${result.data.prenom} ${result.data.nom}`,
          email: result.data.email,
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop", // Image par défaut
          orders: 12, // Valeur fictive (à adapter)
          favorites: 8, // Valeur fictive (à adapter)
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
        {/* Section Avatar et Infos */}
        <Animated.View style={[styles.profileHeader, { opacity: fadeAnim }]}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editIcon}>
              <Icon name="edit-2" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </Animated.View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="shopping-bag" size={24} color="#38A169" />
            <Text style={styles.statNumber}>{user.orders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="heart" size={24} color="#DD6B20" />
            <Text style={styles.statNumber}>{user.favorites}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        {/* Options du menu */}
        <View style={styles.menuContainer}>
          {[
            { icon: 'user', label: 'Edit Profile', action: () => router.push('/clients/ProfileEditScreen') },
            { icon: 'shopping-cart', label: 'My Orders', action: () => router.push('/clients/OrdersScreen') },
            { icon: 'settings', label: 'Settings', action: () => console.log('Settings') },
            { icon: 'help-circle', label: 'Help & Support', action: () => console.log('Help') },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <Icon name={item.icon} size={22} color="#2D3748" />
              <Text style={styles.menuText}>{item.label}</Text>
              <Icon name="chevron-right" size={20} color="#718096" style={styles.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bouton Déconnexion */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Logout</Text>
          <Icon name="log-out" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#38A169',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  userEmail: {
    fontSize: 16,
    color: '#718096',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3436',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#718096',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuText: {
    fontSize: 16,
    color: '#2D3436',
    marginLeft: 15,
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DD6B20',
    borderRadius: 30,
    paddingVertical: 15,
    marginTop: 30,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
});

export default ProfileScreen;