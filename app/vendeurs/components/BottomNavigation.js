// SellerBottomNavigation.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, usePathname } from 'expo-router';

const SellerBottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [animations] = useState({
    dashboard: new Animated.Value(1),
    orders: new Animated.Value(1),
    products: new Animated.Value(1),
    profile: new Animated.Value(1),
  });

  const tabs = [
    { id: 'dashboard', label: 'Tableau', icon: 'home', route: 'vendeurs/home' },
    { id: 'orders', label: 'Commandes', icon: 'package', route: 'vendeurs/orders' },
    { id: 'products', label: 'Produits', icon: 'shopping-bag', route: 'vendeurs/products' },
    { id: 'profile', label: 'Profil', icon: 'user', route: 'vendeurs/profile' },
  ];

  useEffect(() => {
    const currentTab = tabs.find((tab) => pathname === tab.route)?.id || 'dashboard';
    setActiveTab(currentTab);
  }, [pathname]);

  const handlePress = (tabId, route) => {
    setActiveTab(tabId);

    Object.values(animations).forEach((anim) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });

    Animated.spring(animations[tabId], {
      toValue: 1.1,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(animations[tabId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    });

    router.push(route);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff00', '#ffffffcc']}
        style={styles.wave}
      />
      <LinearGradient
        colors={['#F9FAFB', '#FFFFFF']}
        style={styles.navContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => handlePress(tab.id, tab.route)}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: animations[tab.id] }],
                  backgroundColor: activeTab === tab.id ? '#38A169' : '#E5E7EB',
                  shadowOpacity: activeTab === tab.id ? 0.25 : 0,
                  shadowOffset: { width: 0, height: activeTab === tab.id ? -2 : 0 },
                  shadowRadius: 4,
                  elevation: activeTab === tab.id ? 5 : 0,
                },
              ]}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? '#fff' : '#6B7280'}
              />
            </Animated.View>
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab.id ? '#38A169' : '#6B7280' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  wave: {
    height: 15, // Réduit pour un effet plus subtil
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8, // Réduit
    paddingBottom: 15, // Réduit
    borderTopLeftRadius: 20, // Réduit
    borderTopRightRadius: 20, // Réduit
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4, // Réduit
    flex: 1,
  },
  iconContainer: {
    width: 36, // Réduit de 48 à 36
    height: 36, // Réduit de 48 à 36
    borderRadius: 18, // Réduit proportionnellement
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4, // Réduit de 6 à 4
    shadowColor: '#000',
  },
  tabLabel: {
    fontSize: 11, // Réduit de 13 à 11
    fontWeight: '600', // Légèrement moins audacieux
    letterSpacing: 0.1, // Réduit
  },
});

export default SellerBottomNavigation;