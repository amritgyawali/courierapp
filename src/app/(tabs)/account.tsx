import { type Href, router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { NepalSkyline } from '@/components/brand';
import { BellIcon, ChevronRightIcon, DeliveryPrefIcon, UserIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { Button, ScreenHeader } from '@/components/ui';
import { USER_ROLE_LABELS } from '@/constants/user-roles';
import { displayName, useAppState } from '@/state/app-state';
import { useBrand } from '@/state/branding-state';
import { cardShadow, makeStyles } from '@/theme';
import { initials } from '@/utils/format';

function MenuRow({ icon, label, href }: { icon: ReactNode; label: string; href: Href }) {
  const styles = useStyles();
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
  const styles = useStyles();
  const { user, details, signOut } = useAppState();
  const { shortName } = useBrand();
  const name = displayName(user, details);

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`My ${shortName} account`} />
      <ScrollView contentContainerStyle={styles.content}>
        {user && (
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(name)}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.signedInAs} numberOfLines={1}>
                {user.email} · {USER_ROLE_LABELS[user.role]}
              </Text>
            </View>
          </View>
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

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 16, paddingTop: 20 },
  card: { backgroundColor: C.card, borderRadius: 12, overflow: 'hidden', ...cardShadow },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: C.onPrimary, fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  profileText: { flex: 1 },
  profileName: { color: C.onPrimary, fontSize: 18, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 17,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: C.textStrong, letterSpacing: -0.2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 12 },
  signOutWrap: { padding: 12, paddingTop: 8 },
  signedInAs: { fontSize: 13, color: C.onPrimaryMuted, marginTop: 2 },
}));
