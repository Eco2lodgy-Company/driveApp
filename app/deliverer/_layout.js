import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, Animated, TouchableOpacity } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
  const [animations] = React.useState({
    Accueil: new Animated.Value(1),
    Historique: new Animated.Value(1),
    Livraisons: new Animated.Value(1),
    Profil: new Animated.Value(1),
  });
  const [livraisonsCount, setLivraisonsCount] = React.useState(0);

  React.useEffect(() => {
    const updateCount = () => {
      setLivraisonsCount(Math.floor(Math.random() * 5)); // Simulation
    };
    updateCount();
    const interval = setInterval(updateCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderTabBar = ({ state, descriptors, navigation }) => {
    return (
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const animation = animations[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onPressIn = () => {
            Animated.spring(animation, {
              toValue: 0.9,
              useNativeDriver: true,
            }).start();
          };

          const onPressOut = () => {
            Animated.spring(animation, {
              toValue: isFocused ? 1.1 : 1,
              useNativeDriver: true,
            }).start();
          };

          let iconName;
          if (route.name === 'Accueil') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (route.name === 'Historique') {
            iconName = isFocused ? 'list' : 'list-outline';
          } else if (route.name === 'Livraisons') {
            iconName = isFocused ? 'bicycle' : 'bicycle-outline';
          } else if (route.name === 'Profil') {
            iconName = isFocused ? 'person' : 'person-outline';
          }

          return (
            <Animated.View
              key={route.key}
              style={[
                styles.tabItemWrapper,
                { transform: [{ scale: animation }] },
              ]}
            >
              <TouchableOpacity
                style={[styles.tabItem, isFocused && styles.tabItemActive]}
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={1}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={iconName}
                    size={isFocused ? 26 : 24}
                    color={isFocused ? '#fff' : '#38A169'}
                  />
                  {route.name === 'Livraisons' && livraisonsCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{livraisonsCount}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused && styles.tabLabelActive,
                  ]}
                >
                  {route.name}
                </Text>
                {isFocused && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Tab.Navigator tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Accueil" component={Home} />
        <Tab.Screen name="Historique" component={HistoriqueLivraisonsScreen} />
        <Tab.Screen name="Livraisons" component={LivraisonsScreen} />
        <Tab.Screen name="Profil" component={ProfileScreen} />
      </Tab.Navigator>
    </ApplicationProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
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
  tabItemWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 70,
  },
  tabItemActive: {
    backgroundColor: '#38A169',
    shadowColor: '#38A169',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 12,
    color: '#38A169',
    marginTop: 4,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
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
  placeholderText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});