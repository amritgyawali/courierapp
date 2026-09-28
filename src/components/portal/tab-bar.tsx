import type { Tabs } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PortalColors as C } from '@/constants/theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

export type PortalTab = {
  label: string;
  icon: (color: string, active: boolean) => ReactNode;
  /** Small count bubble on the icon. */
  badge?: number;
};

const INACTIVE = '#6B7280';

/**
 * Bottom tab bar shared by the vendor, rider and admin portals. Only routes listed in `tabs`
 * get a button; other tab routes (reached from the drawer) keep the bar visible with no tab lit.
 */
export function PortalTabBar({ state, navigation, tabs }: TabBarProps & { tabs: Record<string, PortalTab> }) {
  const insets = useSafeAreaInsets();
  const focusedName = state.routes[state.index]?.name;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]} role="tablist">
      {state.routes.map((route) => {
        const tab = tabs[route.name];
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
            aria-label={tab.badge ? `${tab.label}, ${tab.badge} pending` : tab.label}
            onPress={onPress}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}>
            <View>
              {tab.icon(color, focused)}
              {!!tab.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color }, focused && styles.labelActive]} numberOfLines={1}>
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
    paddingHorizontal: 4,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 2 },
  label: { fontSize: 11, fontWeight: '500' },
  labelActive: { fontWeight: '700' },
  badge: {
    position: 'absolute',
    top: -5,
    right: -11,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: C.red,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
});
