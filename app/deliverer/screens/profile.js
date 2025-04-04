import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../../AuthContext';

const ProfileScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [userData,setUserData] = useState('');
  const { logout } = useContext(AuthContext);
  const router = useRouter();
  

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: 'https://via.placeholder.com/150',
    totalLivraisons: 0,
    revenuTotal: 0,
    joinedDate: '',
  });

  useEffect(() => {
    // Animation
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

    // Fetch profile data
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const storedData = await AsyncStorage.getItem('user'); // Récupération du token
      if (!storedData) {
        console.error("Aucun token trouvé !");
        return;
      }
  
      const Data = JSON.parse(storedData); // Convertir la chaîne en objet JSON
  
      if (!Data.email || !Data.token) {
        console.error("Données du token incomplètes !");
        return;
      }
  
      const response = await fetch(
        `http://195.35.24.128:8081/api/user/findByUsername?email=${Data.email}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${Data.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const result = await response.json();
  
      if (result.status === 'succes' && result.data) {
        const userData = result.data;
        setProfile({
          name: `${userData.prenom} ${userData.nom}`,
          email: userData.email,
          phone: userData.telephone,
          address: userData.adresse || 'Non spécifiée',
          avatar: 'https://via.placeholder.com/150',
          totalLivraisons: 142, // Valeur statique
          revenuTotal: 3567.89, // Valeur statique
          joinedDate: userData.createdAt,
        });
      } else {
        console.error("Erreur API:", result);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      alert('Erreur lors du chargement du profil');
    }
  };
  
  const handleLogout = async () => {
    try {
      console.log('Déconnexion', 'Vous avez été déconnecté avec succès.');
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

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
            <Text style={styles.headerTitle}>Mon Profil</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.profileHeader, { opacity: fadeAnim }]}>
          <Image
            source={{ uri: profile.avatar }}
            style={styles.avatar}
          />
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileJoined}>
            Membre depuis {profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : ''}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.totalLivraisons}</Text>
            <Text style={styles.statLabel}>Livraisons</Text>
            <Icon name="truck" size={20} color="#10B981" style={styles.statIcon} />
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${profile.revenuTotal.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Revenu Total</Text>
            <Icon name="dollar-sign" size={20} color="#F59E0B" style={styles.statIcon} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Informations Personnelles</Text>
          
          <View style={styles.infoCard}>
            <Icon name="mail" size={20} color="#6B7280" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoText}>{profile.email}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Icon name="phone" size={20} color="#6B7280" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoText}>{profile.phone}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Icon name="map-pin" size={20} color="#6B7280" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Adresse</Text>
              <Text style={styles.infoText}>{profile.address}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => alert('Édition du profil')}
          >
            <LinearGradient
              colors={['#4CAF50', '#388E3C']}
              style={styles.buttonGradient}
            >
              <Icon name="edit-2" size={20} color="#fff" />
              <Text style={styles.buttonText}>Modifier le Profil</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LinearGradient
              colors={['#F44336', '#D32F2F']}
              style={styles.buttonGradient}
            >
              <Icon name="log-out" size={20} color="#fff" />
              <Text style={styles.buttonText}>Déconnexion</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  profileJoined: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoCard: {
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
  infoIcon: {
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  editButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;