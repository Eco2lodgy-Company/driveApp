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
import BottomNavigation from './components/BottomNavigation'; // Importation ajoutée

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
      const response = await fetch(`http://195.35.24.128:8081/api/shop/find/${id}`, {
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
      console.log("Données reçues :", data.data);
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

        if (!userToken) {
          console.error("Aucun token trouvé");
          return;
        }

        const parsedToken = JSON.parse(userToken);
        console.log("Token trouvé :", parsedToken.token);
        await fetchShopData(19, parsedToken.token);
      } catch (error) {
        console.error("Erreur lors de la récupération du token :", error.message);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    console.log('Déconnexion', 'Vous avez été déconnecté avec succès.');
    await logout();
    router.push('/login');
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/sellers/home')}
            >
              <Icon name="arrow-left" size={20} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{shopProfile.nom || 'Profil Boutique'}</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.profileImageContainer, { opacity: fadeAnim }]}>
          <Image
            source={{ uri: imgUrl || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          {[
            { icon: 'info', label: shopProfile.description || 'Description non disponible' },
            { icon: 'mail', label: shopProfile.email || 'Email non disponible' },
            { icon: 'phone', label: shopProfile.telephone || 'Téléphone non disponible' },
            { icon: 'map-pin', label: shopProfile.adresse || 'Adresse non disponible' },
          ].map((item, index) => (
            <View key={index} style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Icon name={item.icon} size={20} color="#6B7280" />
              </View>
              <Text style={styles.infoText}>{item.label}</Text>
            </View>
          ))}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/sellers/edit-profile')}
            >
              <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.actionGradient}>
                <Icon name="edit" size={20} color="#fff" />
                <Text style={styles.actionText}>Modifier</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLogout}
            >
              <LinearGradient colors={['#F44336', '#D32F2F']} style={styles.actionGradient}>
                <Icon name="log-out" size={20} color="#fff" />
                <Text style={styles.actionText}>Déconnexion</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Ajusté pour laisser de l'espace à BottomNavigation
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: '90%',
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  section: {
    flex: 1,
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
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
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
  actionText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default SellerProfileScreen;