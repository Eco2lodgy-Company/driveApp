// SellerDashboardScreen.js
import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Animated,
} from 'react-native';
import { AuthContext } from '../../AuthContext';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';
import tw from 'twrnc'; // npm install twrnc

const SellerDashboardScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const { user } = useContext(AuthContext);

  const stats = {
    totalSales: 2450.75,
    pendingOrders: 8,
    completedOrders: 42,
  };

  const recentOrders = [
    { id: 'ORD126', customer: 'Marie Dupont', total: 89.99, status: 'Pending', date: 'Aujourd’hui' },
    { id: 'ORD127', customer: 'Pierre Leclerc', total: 34.99, status: 'Shipped', date: 'Hier' },
    { id: 'ORD128', customer: 'Sophie Martin', total: 150.50, status: 'Completed', date: '14 mars' },
  ];

  const notifications = [
    { id: '1', message: 'Commande #ORD126 reçue', time: '5 min', type: 'info' },
    { id: '2', message: 'Stock faible: T-shirt XL', time: '1h', type: 'warning' },
  ];

  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(headerAnim, { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={tw`flex-row items-center bg-white rounded-lg py-2 px-3 mb-2 shadow-sm border border-gray-100`}
      onPress={() => router.push(`/sellers/ordersDetails?orderId=${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={tw`w-8 h-8 rounded-full bg-gray-50 justify-center items-center mr-2`}>
        <Icon name="package" size={16} color="#6B7280" />
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-sm font-semibold text-gray-900`}>#{item.id}</Text>
        <Text style={tw`text-xs text-gray-600`}>{item.customer}</Text>
      </View>
      <View style={tw`items-end`}>
        <Text style={tw`text-sm font-semibold text-gray-900`}>${item.total.toFixed(2)}</Text>
        <Text
          style={tw`text-xs font-medium ${
            item.status === 'Pending' ? 'text-yellow-600' :
            item.status === 'Shipped' ? 'text-blue-600' : 'text-green-600'
          }`}
        >
          {item.status === 'Pending' ? 'En attente' :
           item.status === 'Shipped' ? 'Expédiée' : 'Complétée'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <Animated.View
        style={[
          tw`p-4 bg-white rounded-b-xl shadow-md`,
          {
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 10], // Modifié ici pour descendre la barre
              }),
            }],
          },
        ]}
      >
        <LinearGradient colors={['#ffffff', '#F8FAFC']} style={tw`rounded-b-xl`}>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-lg font-bold text-gray-900 tracking-tight`}>{user.email}</Text>
            <TouchableOpacity
              style={tw`p-1 bg-gray-100 rounded-full`}
              onPress={() => router.push('/sellers/profile')}
            >
              <Icon name="user" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        contentContainerStyle={tw`p-3 pb-20`}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[tw`flex-row mb-4`, { opacity: fadeAnim }]}>
          <View style={tw`flex-1 bg-white rounded-lg p-3 mr-1 shadow-sm border border-gray-100`}>
            <Text style={tw`text-lg font-semibold text-gray-900`}>${stats.totalSales.toFixed(2)}</Text>
            <Text style={tw`text-xs text-gray-500`}>Ventes Totales</Text>
            <Icon name="trending-up" size={18} color="#10B981" style={tw`mt-1 self-end`} />
          </View>
          <View style={tw`flex-1 bg-white rounded-lg p-3 ml-1 shadow-sm border border-gray-100`}>
            <Text style={tw`text-lg font-semibold text-gray-900`}>{stats.pendingOrders}</Text>
            <Text style={tw`text-xs text-gray-500`}>En attente</Text>
            <Icon name="clock" size={18} color="#F59E0B" style={tw`mt-1 self-end`} />
          </View>
        </Animated.View>

        <Animated.View style={[tw`flex-row mb-4`, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={tw`flex-1 mr-1 rounded-lg overflow-hidden shadow-sm`}
            onPress={() => router.push('/sellers/addProduct')}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={tw`py-2 px-3 flex-row justify-center items-center`}>
              <Icon name="plus" size={18} color="#fff" />
              <Text style={tw`ml-1 text-white font-medium text-sm`}>Produit</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`flex-1 ml-1 rounded-lg overflow-hidden shadow-sm`}
            onPress={() => router.push('/sellers/orders')}
          >
            <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={tw`py-2 px-3 flex-row justify-center items-center`}>
              <Icon name="package" size={18} color="#fff" />
              <Text style={tw`ml-1 text-white font-medium text-sm`}>Commandes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[tw`mb-4`, { opacity: fadeAnim }]}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-2`}>Notifications</Text>
          {notifications.map((notif) => (
            <View key={notif.id} style={tw`rounded-lg mb-2 overflow-hidden shadow-sm`}>
              <LinearGradient
                colors={notif.type === 'info' ? ['#E5E7EB', '#F9FAFB'] : ['#FEF3C7', '#FFF7ED']}
                style={tw`flex-row items-center py-2 px-3`}
              >
                <Icon
                  name={notif.type === 'info' ? 'info' : 'alert-triangle'}
                  size={16}
                  color={notif.type === 'info' ? '#3B82F6' : '#F59E0B'}
                  style={tw`mr-2`}
                />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-medium text-gray-900`}>{notif.message}</Text>
                  <Text style={tw`text-xs text-gray-500`}>{notif.time}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[tw`mb-4`, { opacity: fadeAnim }]}>
          <Text style={tw`text-base font-semibold text-gray-900 mb-2`}>Activité Récente</Text>
          <FlatList
            data={recentOrders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity
            style={tw`mt-2 items-center`}
            onPress={() => router.push('/sellers/orders')}
          >
            <Text style={tw`text-blue-600 font-medium text-sm`}>Voir plus</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

export default SellerDashboardScreen;