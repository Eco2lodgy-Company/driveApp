// SellerBottomNavigation.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter, usePathname } from 'expo-router';

const SellerBottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname(); // Obtenir le chemin actuel
  const [activeTab, setActiveTab] = useState('dashboard'); // Onglet actif par défaut
  const [animations] = useState({
    dashboard: new Animated.Value(1),
    orders: new Animated.Value(1),
    products: new Animated.Value(1),
    profile: new Animated.Value(1),
  });

  // Liste des onglets
  const tabs = [
    { id: 'dashboard', label: 'Tableau', icon: 'home', route: '/sellers/home' },
    { id: 'orders', label: 'Commandes', icon: 'package', route: '/sellers/orders' },
    { id: 'products', label: 'Produits', icon: 'shopping-bag', route: '/sellers/products' },
    { id: 'profile', label: 'Profil', icon: 'user', route: '/sellers/profile' },
  ];

  // Mettre à jour l'onglet actif en fonction du chemin actuel
  useEffect(() => {
    const currentTab = tabs.find((tab) => pathname === tab.route)?.id || 'dashboard';
    setActiveTab(currentTab);
  }, [pathname]);

  // Animation au clic
  const handlePress = (tabId, route) => {
    setActiveTab(tabId);

    // Réinitialiser toutes les animations
    Object.values(animations).forEach((anim) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    // Animer l'onglet cliqué
    Animated.sequence([
      Animated.timing(animations[tabId], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animations[tabId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Naviguer vers la route correspondante
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <View style={styles.wave} />
      <View style={styles.navContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => handlePress(tab.id, tab.route)}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: animations[tab.id] }],
                  backgroundColor: activeTab === tab.id ? '#38A169' : 'transparent',
                },
              ]}
            >
              <Icon
                name={tab.icon}
                size={24}
                color={activeTab === tab.id ? '#fff' : '#666'}
              />
            </Animated.View>
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab.id ? '#38A169' : '#666' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  wave: {
    height: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#EDEFF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SellerBottomNavigation;