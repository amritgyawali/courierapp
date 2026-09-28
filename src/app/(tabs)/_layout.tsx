import { Tabs } from 'expo-router';

import { CustomerTabBar } from '@/components/tab-bar';

// Access is guarded by the root stack; Track is listed first so it is the landing tab.
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomerTabBar {...props} />}>
      <Tabs.Screen name="track" />
      <Tabs.Screen name="find-us" />
      <Tabs.Screen name="account" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
