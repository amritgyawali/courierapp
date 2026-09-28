import type { Tabs } from 'expo-router';
import type { ComponentProps, ReactElement } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountTabIcon, FindUsTabIcon, MoreTabIcon, TrackTabIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { makeStyles, useColors } from '@/theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TABS: Record<string, { label: string; Icon: (p: { color: string }) => ReactElement }> = {
  track: { label: 'Track', Icon: TrackTabIcon },
  'find-us': { label: 'Find Us', Icon: FindUsTabIcon },
  account: { label: 'Account', Icon: AccountTabIcon },
  more: { label: 'More', Icon: MoreTabIcon },
};

/** Bottom tabs of the customer app (Track, Find Us, Account, More). */
export function CustomerTabBar({ state, navigation }: TabBarProps) {
  const styles = useStyles();
  const C = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const color = focused ? C.primary : C.muted;
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
            <View style={[styles.iconPill, focused && styles.iconPillActive]}>
              <tab.Icon color={color} />
            </View>
            <Text style={[styles.label, { color: focused ? C.primary : C.textSecondary }, focused && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  bar: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  iconPill: { paddingHorizontal: 18, paddingVertical: 3, borderRadius: 999 },
  iconPillActive: { backgroundColor: C.primarySoft },
  label: { fontSize: 12, marginTop: 3, fontWeight: '500' },
  labelActive: { fontWeight: '700' },
}));
