import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';

const NotificationsScreen = () => {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Données fictives des notifications
  const notifications = [
    {
      id: '1',
      title: 'Order Shipped',
      description: 'Your order from Noor Boutique has been shipped!',
      timestamp: '2 hours ago',
      icon: 'truck',
    },
    {
      id: '2',
      title: 'New Sale Alert',
      description: 'Fashion Hub just launched a 20% off sale.',
      timestamp: '5 hours ago',
      icon: 'tag',
    },
    {
      id: '3',
      title: 'Payment Confirmed',
      description: 'Payment for your Trendy Wear order was successful.',
      timestamp: '1 day ago',
      icon: 'check-circle',
    },
    {
      id: '4',
      title: 'Profile Updated',
      description: 'Your profile information has been updated.',
      timestamp: '2 days ago',
      icon: 'user',
    },
    {
      id: '5',
      title: 'Delivery Delayed',
      description: 'Your Street Style order has been delayed by 1 day.',
      timestamp: '3 days ago',
      icon: 'alert-triangle',
    },
  ];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleNotificationPress = (notificationId) => {
    console.log(`Notification ${notificationId} pressed`);
    // Ajoutez ici une logique pour gérer le clic (par exemple, navigation vers un détail)
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.appName}>Notifications</Text>
      </View> */}

      {/* Liste des notifications */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="bell-off" size={50} color="#718096" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          notifications.map((notification, index) => (
            <Animated.View
              key={notification.id}
              style={[
                styles.notificationCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50 * (index + 1), 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => handleNotificationPress(notification.id)}
                activeOpacity={0.8}
              >
                {/* Icône */}
                <View style={styles.iconContainer}>
                  <Icon name={notification.icon} size={24} color="#38A169" />
                </View>

                {/* Informations */}
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationDescription}>
                    {notification.description}
                  </Text>
                  <Text style={styles.timestamp}>{notification.timestamp}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Barre de menu en bas */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'home', label: 'Home', route: '/' },
          { icon: 'search', label: 'Search', route: '/search' },
          { icon: 'shopping-cart', label: 'Cart', route: '/cart' },
          { icon: 'user', label: 'Profile', route: '/profile' },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => router.push(item.route)}
          >
            <Icon name={item.icon} size={24} color="#38A169" />
            <Text style={styles.navText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40,
    backgroundColor: '#fff',
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginLeft: 15,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Espace pour la barre de navigation
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F3EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    marginTop: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    padding: 5,
  },
  navText: {
    fontSize: 12,
    color: '#38A169',
    marginTop: 4,
  },
});

export default NotificationsScreen;