import { Tabs } from 'expo-router';

import { CubeIcon, HomeIcon, MapIcon, UserCircleIcon, WalletIcon } from '@/components/portal/icons';
import { PortalTabBar, type PortalTab } from '@/components/portal/tab-bar';
import { useRider } from '@/components/rider/use-rider';
import { PortalColors as C } from '@/constants/theme';

export default function RiderTabsLayout() {
  const { stats } = useRider();

  const tabs: Record<string, PortalTab> = {
    index: { label: 'Home', icon: (color, active) => <HomeIcon size={23} color={color} filled={active} /> },
    tasks: { label: 'Tasks', icon: (color) => <CubeIcon size={23} color={color} />, badge: stats.active },
    map: { label: 'Route', icon: (color) => <MapIcon size={23} color={color} /> },
    wallet: { label: 'Wallet', icon: (color) => <WalletIcon size={23} color={color} /> },
    account: { label: 'Account', icon: (color) => <UserCircleIcon size={23} color={color} /> },
  };

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.screenBg } }}
      tabBar={(props) => <PortalTabBar {...props} tabs={tabs} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="account" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="announcements" />
    </Tabs>
  );
}
