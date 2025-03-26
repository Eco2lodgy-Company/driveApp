import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthContext, AuthProvider } from '../AuthContext';
import { LocationProvider } from "../LocationContext";
import { useColorScheme } from '@/hooks/useColorScheme';

// Empêche l'écran de chargement de disparaître automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <LocationProvider>
          <Stack screenOptions={{ headerShown: false }}>  {/* Ajout ici */}
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="vendeurs/home" />
            <Stack.Screen name="vendeurs/shopCreationScreen" />
            <Stack.Screen name="vendeurs/profile" />
            <Stack.Screen name="vendeurs/products" />
            <Stack.Screen name="vendeurs/addProducts" />
            <Stack.Screen name="login" />
            <Stack.Screen name="vendeurs/signup" />
            <Stack.Screen name="vendeurs/orders" />
            <Stack.Screen name="vendeurs/editProduct" />
            <Stack.Screen name="vendeurs/productDetails" />
            <Stack.Screen name="vendeurs/orderDetails" />
            <Stack.Screen name="clients/onboarding" options={{ presentation: "modal" }} />
            <Stack.Screen name="clients/login" options={{ presentation: "modal" }} />
            <Stack.Screen name="clients/signup" options={{ presentation: "modal" }} />
            <Stack.Screen name="clients/home" />
            <Stack.Screen name="clients/productScreen" />
            <Stack.Screen name="clients/cart" options={{ presentation: "modal" }} />
            <Stack.Screen name="clients/profile" options={{ presentation: "modal" }} />
            <Stack.Screen name="clients/shops" />
            <Stack.Screen name="clients/notifications" />
            <Stack.Screen name="clients/shopProfile" />
            <Stack.Screen name="clients/PaymentScreen" />
            <Stack.Screen name="clients/DeliveryScreen" />
            <Stack.Screen name="clients/TrackOrderScreen" />
            <Stack.Screen name="clients/OrderScreen" />
            <Stack.Screen name="clients/ProfileEditScreen" />
            <Stack.Screen name="clients/shopOption" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </LocationProvider> 
      </AuthProvider>
    </ThemeProvider>
  );
}
