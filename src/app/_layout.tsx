import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStateProvider, useAppState } from '@/state/app-state';
import { OpsStateProvider } from '@/state/ops-state';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { ready, user } = useAppState();
  const role = user?.role;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  // One guard per role. When the signed-in role changes, screens that become unavailable are
  // dropped from history and the stack moves to the first available screen: customers land on
  // (tabs) → Track, vendors on the vendor Dashboard, riders on the rider Home, admins on the
  // admin Dashboard, and signing out lands on Login.
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
      <Stack.Protected guard={role === 'customer'}>
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

      <Stack.Protected guard={role === 'vendor'}>
        <Stack.Screen name="vendor" />
      </Stack.Protected>

      <Stack.Protected guard={role === 'rider'}>
        <Stack.Screen name="rider" />
      </Stack.Protected>

      <Stack.Protected guard={role === 'admin'}>
        <Stack.Screen name="admin" />
      </Stack.Protected>

      {/* Shared by every signed-in role (drawer → Support Center). */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="contact" />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppStateProvider>
          <OpsStateProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </OpsStateProvider>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
