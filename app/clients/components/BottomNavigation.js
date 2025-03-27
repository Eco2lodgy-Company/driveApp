import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

const BottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState(null); // État pour le token de l'utilisateur
  const [userId, setUserId] = useState(null); // État pour l'ID de l'utilisateur
  const [userEmail, setUserEmail] = useState(null); // État pour l'email de l'utilisateur
  const [cartCount, setCartCount] = useState(0); // Nombre de paniers

  const navItems = [
    { icon: 'home', text: 'Home', path: '/clients/home' },
    { icon: 'search', text: 'Search', path: '/clients/shops' },
    { icon: 'shopping-cart', text: 'Cart', path: '/clients/cart' },
    { icon: 'user', text: 'Profile', path: '/clients/profile' },
  ];

  const [animations] = useState(navItems.map(() => new Animated.Value(1)));

  // Récupérer les données utilisateur (token, ID, email) depuis AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userToken = await AsyncStorage.getItem("user");
        if (!userToken) {
          console.error("Aucun token trouvé");
          return;
        }
  
        const { token, email, id } = JSON.parse(userToken);
        setToken(token);
        setUserId(id);
        setUserEmail(email);
      } catch (error) {
        console.error("Erreur lors de la récupération du token :", error.message);
      }
    };
  
    fetchUserData();
  }, []);

  // Fonction pour récupérer les données du panier
  const fetchCartData = useCallback(async () => {
    if (!userId || !token) return;
  
    try {
      const response = await fetch(`http://195.35.24.128:8081/api/paniers/client/liste/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const result = await response.json();
  
      if (result.status === "success" && result.data) {
        // Compter le nombre de paniers (éléments dans result.data)
        const totalPaniers = result.data.length;
        setCartCount(totalPaniers);
      } else {
        console.error("Erreur dans la réponse de l'API:", result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données du panier:", error);
    }
  }, [userId, token]);

  // Mise à jour périodique des données du panier
  useEffect(() => {
    fetchCartData(); // Appel initial

    // Mettre à jour toutes les 5 secondes (ou ajuste selon tes besoins)
    const interval = setInterval(() => {
      fetchCartData();
    }, 5000); // 5000ms = 5 secondes

    // Nettoyer l'intervalle quand le composant est démonté
    return () => clearInterval(interval);
  }, [fetchCartData]);

  const handlePressIn = (index) => {
    Animated.spring(animations[index], {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(animations[index], {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item, index) => {
        const isActive = pathname === item.path;

        return (
          <Animated.View
            key={item.text}
            style={[styles.navItemWrapper, { transform: [{ scale: animations[index] }] }]}
          >
            <TouchableOpacity
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => router.push(item.path)}
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
              activeOpacity={1}
            >
              <View style={styles.iconContainer}>
                <Icon 
                  name={item.icon} 
                  size={24} 
                  color={isActive ? '#fff' : '#38A169'} 
                />

                {/* Affichage du badge pour le panier si cartCount > 0 */}
                {item.icon === 'shopping-cart' && cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>

              <Text 
                style={[
                  styles.navText, 
                  isActive && styles.navTextActive
                ]}
              >
                {item.text}
              </Text>

              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItemWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 70,
  },
  navItemActive: {
    backgroundColor: '#38A169',
    shadowColor: '#38A169',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  navText: {
    fontSize: 12,
    color: '#38A169',
    marginTop: 4,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#fff',
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    width: 6,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#FFA500',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default BottomNavigation;