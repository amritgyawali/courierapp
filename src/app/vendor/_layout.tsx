import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { VendorDrawerProvider } from '@/components/vendor/drawer';
import { VendorTabBar } from '@/components/vendor/tab-bar';
import { VendorStateProvider } from '@/state/vendor-state';

/**
 * Vendor portal (designs in `vendor ui-ux`). Five bottom tabs in design order; Resources,
 * Customers, Manage Staffs and Profile are opened from the navigation drawer.
 */
export default function VendorLayout() {
  return (
    <VendorStateProvider>
      <StatusBar style="light" />
      <VendorDrawerProvider>
        <Tabs
          backBehavior="history"
          screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#F5F6FA' } }}
          tabBar={(props) => <VendorTabBar {...props} />}>
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
      </VendorDrawerProvider>
    </VendorStateProvider>
  );
}
