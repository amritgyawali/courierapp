import { Tabs } from 'expo-router';

import { BikeIcon, CubeIcon, DispatchIcon, HomeIcon, WalletIcon } from '@/components/portal/icons';
import { PortalTabBar, type PortalTab } from '@/components/portal/tab-bar';
import { approvals, todaySummary } from '@/data/ops';
import { useOps } from '@/state/ops-state';
import { useColors } from '@/theme';

const HIDDEN = [
  'merchants',
  'hubs',
  'tickets',
  'exceptions',
  'rates',
  'announcements',
  'staff',
  'audit',
  'reports',
  'settings',
  'branding',
  'live-map',
];

export default function AdminTabsLayout() {
  const C = useColors();
  const { data } = useOps();
  const today = todaySummary(data);
  const pending = approvals(data);

  const tabs: Record<string, PortalTab> = {
    index: { label: 'Dashboard', icon: (color, active) => <HomeIcon size={23} color={color} filled={active} /> },
    shipments: { label: 'Shipments', icon: (color) => <CubeIcon size={23} color={color} /> },
    dispatch: { label: 'Dispatch', icon: (color) => <DispatchIcon size={23} color={color} />, badge: today.unassigned },
    riders: { label: 'Fleet', icon: (color) => <BikeIcon size={23} color={color} />, badge: pending.riders },
    finance: { label: 'Finance', icon: (color) => <WalletIcon size={23} color={color} />, badge: pending.deposits },
  };

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.screenBg } }}
      tabBar={(props) => <PortalTabBar {...props} tabs={tabs} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="shipments" />
      <Tabs.Screen name="dispatch" />
      <Tabs.Screen name="riders" />
      <Tabs.Screen name="finance" />
      {HIDDEN.map((name) => (
        <Tabs.Screen key={name} name={name} />
      ))}
    </Tabs>
  );
}
