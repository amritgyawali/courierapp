import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStateProvider, useAppState } from '@/state/app-state';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { ready, user } = useAppState();
  const signedIn = user !== null;
  const isVendor = user?.role === 'vendor';

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  // Guards drive auth navigation: when they change, screens that become unavailable are dropped
  // from history and the stack moves to the first available screen. Customers (and admins, until
  // they get their own portal) land on (tabs) → Track; vendors land on vendor → Dashboard;
  // signing out lands on Login.
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
      <Stack.Protected guard={signedIn && !isVendor}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="account-details" />
        <Stack.Screen name="details-form" />
        <Stack.Screen name="notify" />
        <Stack.Screen name="delivery-preferences" />
        <Stack.Screen name="offers" />
        <Stack.Screen name="branches" />
        <Stack.Screen name="services" />
        <Stack.Screen name="about" />
      </Stack.Protected>

      <Stack.Protected guard={isVendor}>
        <Stack.Screen name="vendor" />
      </Stack.Protected>

      {/* Shared by every signed-in role (vendor drawer → Support Center). */}
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="contact" />
      </Stack.Protected>

      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
