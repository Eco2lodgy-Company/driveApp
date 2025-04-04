import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigation from './components/BottomNavigation';

const SellerProfileScreen = () => {
  const router = useRouter();
  const { logout } = useContext(AuthContext);
  const [imgUrl, setImageUrl] = useState(null);
  const [shopProfile, setShopProfile] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

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

  const convertPathToUrl = (dbPath) => {
    if (!dbPath || typeof dbPath !== "string") {
      console.error("Chemin invalide:", dbPath);
      return "";
    }
    const basePath = "/root/data/drive/shop/";
    const baseUrl = "http://alphatek.fr:8084/";
    return dbPath.startsWith(basePath) ? dbPath.replace(basePath, baseUrl) : dbPath;
  };

  const fetchShopData = async (id, token) => {
    try {
      const response = await fetch(`http://195.35.24.128:8081/api/shop/findByVendeur/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setShopProfile(data.data || {});
      const imageUrl = convertPathToUrl(data.data?.bannerPath);
      setImageUrl(imageUrl);
    } catch (error) {
      console.error("Erreur :", error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userToken = await AsyncStorage.getItem("user");
        if (!userToken) return;

        const parsedToken = JSON.parse(userToken);
        await fetchShopData(parsedToken.id, parsedToken.token);
      } catch (error) {
        console.error("Erreur lors de la récupération du token :", error.message);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header animé */}
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
          <Text style={styles.headerTitle}>{shopProfile.nom || 'Profil Boutique'}</Text>
          <View style={{ width: 24 }} /> {/* Pour l'alignement */}
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Bannière de la boutique */}
        <Animated.View style={[styles.bannerContainer, { opacity: fadeAnim }]}>
          <Image
            source={{ uri: imgUrl || 'https://via.placeholder.com/150' }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={styles.bannerOverlay}
          />
        </Animated.View>

        {/* Section d'informations */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informations de la boutique</Text>
          </View>

          {[
            { icon: 'info', label: 'Description', value: shopProfile.description || 'Non renseignée' },
            { icon: 'mail', label: 'Email', value: shopProfile.email || 'Non renseigné' },
            { icon: 'phone', label: 'Téléphone', value: shopProfile.telephone || 'Non renseigné' },
            { icon: 'map-pin', label: 'Adresse', value: shopProfile.adresse || 'Non renseignée' },
          ].map((item, index) => (
            <View key={index} style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name={item.icon} size={18} color="#4A5568" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Boutons d'action */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => router.push('/sellers/edit-profile')}
          >
            <Icon name="edit-3" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Modifier le profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Icon name="log-out" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  scrollContent: {
    paddingBottom: 80,
  },
  bannerContainer: {
    height: 180,
    marginBottom: 24,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '40%',
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
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
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#718096',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#1A202C',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#38A169',
  },
  logoutButton: {
    backgroundColor: '#E53E3E',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SellerProfileScreen;