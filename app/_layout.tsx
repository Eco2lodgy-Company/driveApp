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

// Prevent the splash screen from auto-hiding before asset loading is complete.
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
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="vendeurs/home" options={{ headerShown: false }} />
        <Stack.Screen name="vendeurs/shopCreationScreen" options={{ headerShown: false }} />
        <Stack.Screen name="vendeurs/profile" options={{ headerShown: false }} />
        <Stack.Screen name="vendeurs/products" options={{ headerShown: false }} />
        <Stack.Screen name="vendeurs/addProducts" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="vendeurs/orders" options={{ headerShown: false }} />



        <Stack.Screen name="clients/onboarding" options={{ presentation: "modal" }} />
        <Stack.Screen name="clients/login" options={{ presentation: "modal" }} />
        <Stack.Screen name="clients/signup" options={{ presentation: "modal" }} />
        <Stack.Screen name="clients/home" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="clients/productScreen" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="clients/cart" options={{ presentation: "modal" }} />
        <Stack.Screen name="clients/profile" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="clients/shops" options={{ headerShown: false }} />
        <Stack.Screen name="clients/notifications" options={{ headerShown: false }} />
        <Stack.Screen name="clients/shopProfile" options={{ headerShown: false }} />
        <Stack.Screen name="clients/PaymentScreen" options={{ headerShown: false }} />
        <Stack.Screen name="clients/DeliveryScreen" options={{ headerShown: false }} />
        <Stack.Screen name="clients/TrackOrderScreen" options={{ headerShown: false }} />
        <Stack.Screen name="clients/OrderScreen" options={{ headerShown: false }} />
        <Stack.Screen name="clients/ProfileEditScreen" options={{ headerShown: false }} />
        <Stack.Screen name="clients/shopOption" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
     </LocationProvider> 
     </AuthProvider>
    
    </ThemeProvider>
  );
}
