import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { type DrawerConfig, PortalDrawerProvider, useStandardUtilities } from '@/components/portal/drawer';
import {
  BagIcon,
  BarsIcon,
  BookIcon,
  CardDotsIcon,
  CardIcon,
  CubeIcon,
  FlagIcon,
  HomeIcon,
  ReportIcon,
  UserCircleIcon,
  UsersIcon,
} from '@/components/portal/icons';
import { PortalTabBar, type PortalTab } from '@/components/portal/tab-bar';
import { PortalColors as C } from '@/constants/theme';
import { useVendorState, VendorStateProvider } from '@/state/vendor-state';

const TABS: Record<string, PortalTab> = {
  index: { label: 'Dashboard', icon: (color, active) => <HomeIcon size={23} color={color} filled={active} /> },
  orders: { label: 'Orders', icon: (color) => <BagIcon size={23} color={color} /> },
  accounts: { label: 'Accounts', icon: (color, active) => <CardIcon size={23} color={color} filled={active} /> },
  actions: { label: 'Actions', icon: (color, active) => <FlagIcon size={23} color={color} filled={active} /> },
  reports: { label: 'Report', icon: (color, active) => <ReportIcon size={23} color={color} filled={active} /> },
};

/**
 * Vendor portal (designs in `vendor ui-ux`). Five bottom tabs in design order; Resources,
 * Customers, Manage Staffs and Profile are opened from the navigation drawer.
 */
export default function VendorLayout() {
  return (
    <VendorStateProvider>
      <StatusBar style="light" />
      <VendorShell />
    </VendorStateProvider>
  );
}

function VendorShell() {
  const { profile } = useVendorState();
  const utilities = useStandardUtilities();

  const drawer: DrawerConfig = {
    profile: { name: profile.businessName, badge: `Vendor ID: ${profile.vendorId}`, editHref: '/vendor/profile' },
    items: [
      { label: 'Dashboard', href: '/vendor', match: '/vendor', icon: (p) => <HomeIcon {...p} /> },
      { label: 'Customers', href: '/vendor/customers', match: '/vendor/customers', icon: (p) => <UsersIcon {...p} /> },
      { label: 'Manage Staffs', href: '/vendor/staffs', match: '/vendor/staffs', icon: (p) => <UserCircleIcon {...p} /> },
      { label: 'Orders', href: '/vendor/orders', match: '/vendor/orders', icon: (p) => <CubeIcon {...p} /> },
      { label: 'Accounts', href: '/vendor/accounts', match: '/vendor/accounts', icon: (p) => <CardDotsIcon {...p} /> },
      { label: 'Reports', href: '/vendor/reports', match: '/vendor/reports', icon: (p) => <BarsIcon {...p} /> },
      { label: 'Actions', href: '/vendor/actions', match: '/vendor/actions', icon: (p) => <FlagIcon {...p} /> },
      { label: 'Resources', href: '/vendor/resources', match: '/vendor/resources', icon: (p) => <BookIcon {...p} /> },
    ],
    utilities,
  };

  return (
    <PortalDrawerProvider config={drawer}>
      <Tabs
        backBehavior="history"
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.screenBg } }}
        tabBar={(props) => <PortalTabBar {...props} tabs={TABS} />}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="orders" />
        <Tabs.Screen name="accounts" />
        <Tabs.Screen name="actions" />
        <Tabs.Screen name="reports" />
        <Tabs.Screen name="resources" />
        <Tabs.Screen name="customers" />
        <Tabs.Screen name="staffs" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </PortalDrawerProvider>
  );
}
