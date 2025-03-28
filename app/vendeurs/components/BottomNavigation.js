import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter, usePathname } from 'expo-router';

const SellerBottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: 'dashboard', label: 'Tableau', icon: 'home', route: '/vendeurs/home' },
    { id: 'orders', label: 'Commandes', icon: 'package', route: '/vendeurs/orders' },
    { id: 'products', label: 'Produits', icon: 'shopping-bag', route: '/vendeurs/products' },
    { id: 'profile', label: 'Profil', icon: 'user', route: '/vendeurs/profile' },
  ];

  const [animations] = useState(tabs.map(() => new Animated.Value(1)));
  const [ordersCount, setOrdersCount] = useState(0);

  // Synchronisation avec pathname pour mettre en valeur l'onglet actif
  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.route === pathname);
    if (activeIndex !== -1) {
      animations.forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: index === activeIndex ? 1.1 : 1, // Agrandir uniquement l'actif
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [pathname, animations]);

  // Simulation de mise à jour pour ordersCount
  useEffect(() => {
    const fetchOrdersCount = () => {
      setOrdersCount(Math.floor(Math.random() * 5)); // Simulation
    };
    fetchOrdersCount();
    const interval = setInterval(fetchOrdersCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePressIn = (index) => {
    Animated.spring(animations[index], {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(animations[index], {
      toValue: tabs[index].route === pathname ? 1.1 : 1, // Maintenir l'agrandissement si actif
      useNativeDriver: true,
    }).start();
  };

  const handleNavigation = (index) => {
    const targetRoute = tabs[index].route;
    if (pathname !== targetRoute) {
      router.push(targetRoute);
    }
  };

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab, index) => {
        const isActive = tab.route === pathname;

        return (
          <Animated.View
            key={tab.id}
            style={[styles.navItemWrapper, { transform: [{ scale: animations[index] }] }]}
          >
            <TouchableOpacity
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => handleNavigation(index)}
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
              activeOpacity={1}
            >
              <View style={styles.iconContainer}>
                <Icon
                  name={tab.icon}
                  size={isActive ? 26 : 24}
                  color={isActive ? '#fff' : '#38A169'}
                />
                {tab.id === 'orders' && ordersCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{ordersCount}</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.navText,
                  isActive && styles.navTextActive,
                  isActive && { fontSize: 14 },
                ]}
              >
                {tab.label}
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
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  navText: {
    fontSize: 12,
    color: '#38A169',
    marginTop: 4,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 8,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 2,
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

export default SellerBottomNavigation;