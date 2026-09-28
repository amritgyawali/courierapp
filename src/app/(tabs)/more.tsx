import { type Href, router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { NepalSkyline } from '@/components/brand';
import { BranchListIcon, ContactCardIcon, GearIcon, GiftIcon, InfoIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { ScreenHeader } from '@/components/ui';
import { makeStyles, shadow } from '@/theme';

const ITEMS: { label: string; icon: ReactNode; href: Href }[] = [
  { label: 'Branch List', icon: <BranchListIcon />, href: '/branches' },
  { label: 'Offers', icon: <GiftIcon />, href: '/offers' },
  { label: 'About Us', icon: <InfoIcon />, href: '/about' },
  { label: 'Services', icon: <GearIcon />, href: '/services' },
  { label: 'Contact Us', icon: <ContactCardIcon />, href: '/contact' },
];

export default function MoreScreen() {
  const styles = useStyles();
  return (
    <View style={styles.screen}>
      <ScreenHeader title="More" />
      <ScrollView contentContainerStyle={styles.grid}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            onPress={() => router.push(item.href)}
            style={({ pressed }) => [styles.tile, pressed && { transform: [{ scale: 0.98 }] }]}>
            <View style={styles.tileIcon}>{item.icon}</View>
            <Text style={styles.tileLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <NepalSkyline height={90} />
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
    rowGap: 14,
  },
  tile: {
    width: '48%',
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(243,244,246,0.8)',
    boxShadow: shadow(4, 28, 0.07),
  },
  tileIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  tileLabel: { fontSize: 15, fontWeight: '600', color: C.textStrong, letterSpacing: -0.2 },
}));
