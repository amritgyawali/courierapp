import type { Tabs } from 'expo-router';
import type { ComponentProps, ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountTabIcon, FindUsTabIcon, MoreTabIcon, TrackTabIcon } from '@/components/icons';
import { Colors } from '@/constants/theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TABS: Record<string, { label: string; Icon: (p: { color: string }) => ReactElement }> = {
  track: { label: 'Track', Icon: TrackTabIcon },
  'find-us': { label: 'Find Us', Icon: FindUsTabIcon },
  account: { label: 'Account', Icon: AccountTabIcon },
  more: { label: 'More', Icon: MoreTabIcon },
};

const INACTIVE = '#6B7280';

export function KsgTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const color = focused ? Colors.red : INACTIVE;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            onPress={onPress}
            style={styles.item}>
            <tab.Icon color={color} />
            <Text style={[styles.label, { color: focused ? Colors.red : '#374151' }, focused && styles.labelActive]}>
              {tab.label}
            </Text>
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
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  label: { fontSize: 12, marginTop: 4, fontWeight: '400' },
  labelActive: { fontWeight: '600' },
});
