import type { Tabs } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BagIcon, CardIcon, FlagIcon, HomeIcon, ReportIcon } from '@/components/vendor/icons';
import { VendorColors as C } from '@/constants/theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** The five bottom tabs. Other vendor routes (Resources, Customers…) are reached from the drawer. */
const TABS: Record<string, { label: string; icon: (color: string, active: boolean) => ReactNode }> = {
  index: { label: 'Dashboard', icon: (color, active) => <HomeIcon size={23} color={color} filled={active} /> },
  orders: { label: 'Orders', icon: (color) => <BagIcon size={23} color={color} /> },
  accounts: { label: 'Accounts', icon: (color, active) => <CardIcon size={23} color={color} filled={active} /> },
  actions: { label: 'Actions', icon: (color, active) => <FlagIcon size={23} color={color} filled={active} /> },
  reports: { label: 'Report', icon: (color, active) => <ReportIcon size={23} color={color} filled={active} /> },
};

const INACTIVE = '#6B7280';

export function VendorTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const focusedName = state.routes[state.index]?.name;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]} role="tablist">
      {state.routes.map((route) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = route.name === focusedName;
        const color = focused ? C.red : INACTIVE;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        return (
          <Pressable
            key={route.key}
            role="tab"
            aria-selected={focused}
            aria-label={tab.label}
            onPress={onPress}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}>
            {tab.icon(color, focused)}
            <Text style={[styles.label, { color }, focused && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 2 },
  label: { fontSize: 11, fontWeight: '500' },
  labelActive: { fontWeight: '700' },
});
