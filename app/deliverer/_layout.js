import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Text } from '@ui-kitten/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient'; // Ajout de l'importation
import Home from './home';
import HistoriqueLivraisonsScreen from './screens/historique';
import ProfileScreen from './screens/profile';

function LivraisonsScreen() {
  return (
    <Text category="h6" style={styles.placeholderText}>
      Livraisons
    </Text>
  );
}

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Accueil') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Historique') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Livraisons') {
              iconName = focused ? 'bicycle' : 'bicycle-outline';
            } else if (route.name === 'Profil') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#757575',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
          tabBarBackground: () => (
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(240, 244, 248, 0.9)']}
              style={styles.gradientBackground}
            />
          ),
        })}
      >
        <Tab.Screen name="Accueil" component={Home} options={{ headerShown: false }} />
        <Tab.Screen name="Historique" component={HistoriqueLivraisonsScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Livraisons" component={LivraisonsScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Profil" component={ProfileScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </ApplicationProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    backgroundColor: 'transparent',
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  gradientBackground: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});