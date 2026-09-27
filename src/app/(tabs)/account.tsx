import { type Href, router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NepalSkyline } from '@/components/brand';
import { BellIcon, ChevronRightIcon, DeliveryPrefIcon, UserIcon } from '@/components/icons';
import { Button, ScreenHeader } from '@/components/ui';
import { Colors, cardShadow } from '@/constants/theme';
import { USER_ROLE_LABELS } from '@/constants/user-roles';
import { useAppState } from '@/state/app-state';

function MenuRow({ icon, label, href }: { icon: ReactNode; label: string; href: Href }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: '#F3F4F6' }]}>
      <View style={styles.rowLeft}>
        {icon}
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <ChevronRightIcon />
    </Pressable>
  );
}

export default function AccountScreen() {
  const { user, signOut } = useAppState();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="My KSG account" />
      <ScrollView contentContainerStyle={styles.content}>
        {user && (
          <Text style={styles.signedInAs} numberOfLines={1}>
            Signed in as <Text style={styles.signedInEmail}>{user.email}</Text> · {USER_ROLE_LABELS[user.role]}
          </Text>
        )}
        <View style={styles.card}>
          <MenuRow icon={<UserIcon />} label="Account Details" href="/account-details" />
          <View style={styles.divider} />
          <MenuRow icon={<DeliveryPrefIcon />} label="Delivery Preferences" href="/delivery-preferences" />
          <View style={styles.divider} />
          <MenuRow icon={<BellIcon />} label="Notification Preferences" href="/notify" />
          <View style={styles.signOutWrap}>
            <Button
              title="Sign out"
              bold={false}
              radius={6}
              style={{ paddingVertical: 12 }}
              onPress={signOut}
            />
          </View>
        </View>
      </ScrollView>
      <NepalSkyline />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingTop: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden', ...cardShadow },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 17,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: Colors.black, letterSpacing: -0.2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 12 },
  signOutWrap: { padding: 12, paddingTop: 8 },
  signedInAs: { fontSize: 13, color: Colors.textMuted, marginBottom: 12, marginLeft: 2 },
  signedInEmail: { fontWeight: '600', color: Colors.text },
});
