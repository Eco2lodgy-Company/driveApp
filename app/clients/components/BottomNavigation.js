// BottomNavigation.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter, usePathname } from 'expo-router';

const BottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Définir navItems avant de l'utiliser
  const navItems = [
    { icon: 'home', text: 'Home', path: '/clients/home' },
    { icon: 'search', text: 'Search', path: '/clients/shops' },
    { icon: 'shopping-cart', text: 'Cart', path: '/clients/cart' },
    { icon: 'user', text: 'Profile', path: '/clients/profile' },
  ];

  // Maintenant qu navItems est défini, on peut l'utiliser dans useState
  const [animations] = useState(navItems.map(() => new Animated.Value(1)));

  const handlePressIn = (index) => {
    Animated.spring(animations[index], {
      toValue: 0.95,
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
              <Icon 
                name={item.icon} 
                size={24} 
                color={isActive ? '#fff' : '#38A169'} 
              />
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
});

export default BottomNavigation;