import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { type DrawerConfig, PortalDrawerProvider, useStandardUtilities } from '@/components/portal/drawer';
import {
  BikeIcon,
  CubeIcon,
  HistoryIcon,
  HomeIcon,
  MapIcon,
  MegaphoneOutlineIcon,
  SirenIcon,
  UserCircleIcon,
  WalletIcon,
} from '@/components/portal/icons';
import { ToastProvider, useNow } from '@/components/portal/widgets';
import { SosSheet } from '@/components/rider/sos-sheet';
import { useRider } from '@/components/rider/use-rider';
import { PortalColors as C } from '@/constants/theme';
import { useOps } from '@/state/ops-state';

/**
 * Rider portal: today's work (Home), the task list, route map, COD wallet & earnings and the
 * account. Task details stack above the tabs.
 */
export default function RiderLayout() {
  const { ready } = useOps();
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={C.red} size="large" />
      </View>
    );
  }
  return (
    <ToastProvider>
      <StatusBar style="light" />
      <RiderShell />
    </ToastProvider>
  );
}

function RiderShell() {
  const now = useNow(60000);
  const { me, stats, data } = useRider(now);
  const [sos, setSos] = useState(false);
  const utilities = useStandardUtilities([
    {
      key: 'sos',
      title: 'Emergency SOS',
      subtitle: 'Police, ambulance, hub manager',
      icon: (c) => <SirenIcon size={16} color={c} />,
      onPress: () => setSos(true),
    },
  ]);
  const unread = data.announcements.filter((a) => a.audience !== 'merchants' && now.getTime() - new Date(a.at).getTime() < 24 * 3600000).length;

  const drawer: DrawerConfig = {
    profile: { name: me.name, badge: `Rider ID: ${me.id}`, editHref: '/rider/account', avatar: <BikeIcon size={28} color={C.red} /> },
    items: [
      { label: 'Home', href: '/rider', match: '/rider', icon: (p) => <HomeIcon {...p} /> },
      { label: 'My Tasks', href: '/rider/tasks', match: '/rider/tasks', icon: (p) => <CubeIcon {...p} />, badge: stats.active },
      { label: 'Route Map', href: '/rider/map', match: '/rider/map', icon: (p) => <MapIcon {...p} /> },
      { label: 'Wallet & Earnings', href: '/rider/wallet', match: '/rider/wallet', icon: (p) => <WalletIcon {...p} /> },
      { label: 'History', href: '/rider/history', match: '/rider/history', icon: (p) => <HistoryIcon {...p} /> },
      { label: 'Announcements', href: '/rider/announcements', match: '/rider/announcements', icon: (p) => <MegaphoneOutlineIcon {...p} />, badge: unread },
      { label: 'Account', href: '/rider/account', match: '/rider/account', icon: (p) => <UserCircleIcon {...p} /> },
    ],
    utilities,
  };

  return (
    <PortalDrawerProvider config={drawer}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.screenBg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="task/[id]" />
      </Stack>
      <SosSheet visible={sos} onClose={() => setSos(false)} />
    </PortalDrawerProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.screenBg },
});
