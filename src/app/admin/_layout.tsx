import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { type DrawerConfig, PortalDrawerProvider, useStandardUtilities } from '@/components/portal/drawer';
import {
  AlertTriangleIcon,
  BarsIcon,
  BikeIcon,
  CalculatorOutlineIcon,
  CubeIcon,
  DispatchIcon,
  HistoryIcon,
  HomeIcon,
  MapIcon,
  MegaphoneOutlineIcon,
  MessageIcon,
  OfficeIcon,
  SettingsIcon,
  ShieldCheckIcon,
  StoreSmallIcon,
  WalletIcon,
} from '@/components/portal/icons';
import { ToastProvider } from '@/components/portal/widgets';
import { PortalColors as C } from '@/constants/theme';
import { approvals, ROLE_META, todaySummary } from '@/data/ops';
import { useOps } from '@/state/ops-state';

/**
 * Admin (operations) portal. Bottom tabs for the daily loop (Dashboard, Shipments, Dispatch,
 * Fleet, Finance); everything else lives in the drawer. Detail screens stack above the tabs.
 */
export default function AdminLayout() {
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
      <AdminShell />
    </ToastProvider>
  );
}

function AdminShell() {
  const { data, me } = useAdmin();
  const pending = approvals(data);
  const today = todaySummary(data);
  const utilities = useStandardUtilities();

  const drawer: DrawerConfig = {
    profile: { name: me.name, badge: ROLE_META[me.role].label, editHref: '/admin/settings' },
    items: [
      { section: 'Overview', label: 'Dashboard', href: '/admin', match: '/admin', icon: (p) => <HomeIcon {...p} /> },
      { section: 'Overview', label: 'Reports & Analytics', href: '/admin/reports', match: '/admin/reports', icon: (p) => <BarsIcon {...p} /> },
      { section: 'Overview', label: 'Live Fleet Map', href: '/admin/live-map', match: '/admin/live-map', icon: (p) => <MapIcon {...p} /> },
      { section: 'Operations', label: 'Shipments', href: '/admin/shipments', match: '/admin/shipments', icon: (p) => <CubeIcon {...p} /> },
      { section: 'Operations', label: 'Dispatch', href: '/admin/dispatch', match: '/admin/dispatch', icon: (p) => <DispatchIcon {...p} />, badge: today.unassigned },
      { section: 'Operations', label: 'Returns & Exceptions', href: '/admin/exceptions', match: '/admin/exceptions', icon: (p) => <AlertTriangleIcon {...p} />, badge: today.failed },
      { section: 'Operations', label: 'Support Tickets', href: '/admin/tickets', match: '/admin/tickets', icon: (p) => <MessageIcon {...p} />, badge: pending.tickets },
      { section: 'Network', label: 'Riders', href: '/admin/riders', match: '/admin/riders', icon: (p) => <BikeIcon {...p} />, badge: pending.riders },
      { section: 'Network', label: 'Merchants', href: '/admin/merchants', match: '/admin/merchants', icon: (p) => <StoreSmallIcon {...p} />, badge: pending.merchants },
      { section: 'Network', label: 'Hubs & Branches', href: '/admin/hubs', match: '/admin/hubs', icon: (p) => <OfficeIcon {...p} /> },
      { section: 'Finance', label: 'Finance & COD', href: '/admin/finance', match: '/admin/finance', icon: (p) => <WalletIcon {...p} />, badge: pending.deposits },
      { section: 'Finance', label: 'Rate Card', href: '/admin/rates', match: '/admin/rates', icon: (p) => <CalculatorOutlineIcon {...p} /> },
      { section: 'Administration', label: 'Announcements', href: '/admin/announcements', match: '/admin/announcements', icon: (p) => <MegaphoneOutlineIcon {...p} /> },
      { section: 'Administration', label: 'Staff & Roles', href: '/admin/staff', match: '/admin/staff', icon: (p) => <ShieldCheckIcon {...p} /> },
      { section: 'Administration', label: 'Audit Log', href: '/admin/audit', match: '/admin/audit', icon: (p) => <HistoryIcon {...p} /> },
      { section: 'Administration', label: 'Settings', href: '/admin/settings', match: '/admin/settings', icon: (p) => <SettingsIcon {...p} /> },
    ],
    utilities,
  };

  return (
    <PortalDrawerProvider config={drawer}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.screenBg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="shipment/[id]" />
        <Stack.Screen name="rider/[id]" />
        <Stack.Screen name="merchant/[id]" />
      </Stack>
    </PortalDrawerProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.screenBg },
});
