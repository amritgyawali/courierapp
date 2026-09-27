import Constants from 'expo-constants';
import { type Href, router, usePathname } from 'expo-router';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { BackHandler, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ArrowDownIcon,
  AvatarIcon,
  BarsIcon,
  BookIcon,
  CardDotsIcon,
  ChevronRightIcon,
  CubeIcon,
  FlagIcon,
  HomeIcon,
  LogoutIcon,
  PencilIcon,
  StarIcon,
  SupportIcon,
  UserCircleIcon,
  UsersIcon,
  type VendorIconProps,
} from '@/components/vendor/icons';
import { shadow, VendorColors as C } from '@/constants/theme';
import { useAppState } from '@/state/app-state';
import { useVendorState } from '@/state/vendor-state';

type DrawerApi = { open: () => void; close: () => void };

const DrawerContext = createContext<DrawerApi | null>(null);

export function useVendorDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useVendorDrawer must be used inside VendorDrawerProvider');
  return ctx;
}

/** Hosts the navigation drawer above the vendor tabs and exposes `open` / `close`. */
export function VendorDrawerProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const api = useMemo<DrawerApi>(() => ({ open: () => setVisible(true), close: () => setVisible(false) }), []);

  // Android back button closes the drawer before leaving the screen.
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setVisible(false);
      return true;
    });
    return () => sub.remove();
  }, [visible]);

  return (
    <DrawerContext.Provider value={api}>
      <View style={styles.host}>
        {children}
        {visible && <DrawerPanel onClose={api.close} />}
      </View>
    </DrawerContext.Provider>
  );
}

type NavItem = { label: string; href: Href; path: string; Icon: (p: VendorIconProps) => ReactNode };

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/vendor', path: '/vendor', Icon: (p) => <HomeIcon {...p} /> },
  { label: 'Customers', href: '/vendor/customers', path: '/vendor/customers', Icon: UsersIcon },
  { label: 'Manage Staffs', href: '/vendor/staffs', path: '/vendor/staffs', Icon: UserCircleIcon },
  { label: 'Orders', href: '/vendor/orders', path: '/vendor/orders', Icon: CubeIcon },
  { label: 'Accounts', href: '/vendor/accounts', path: '/vendor/accounts', Icon: CardDotsIcon },
  { label: 'Reports', href: '/vendor/reports', path: '/vendor/reports', Icon: BarsIcon },
  { label: 'Actions', href: '/vendor/actions', path: '/vendor/actions', Icon: (p) => <FlagIcon {...p} /> },
  { label: 'Resources', href: '/vendor/resources', path: '/vendor/resources', Icon: BookIcon },
];

const STORE_URL =
  Platform.OS === 'android'
    ? 'market://details?id=com.karnalismartgroup.app'
    : 'https://play.google.com/store/apps/details?id=com.karnalismartgroup.app';

function openStore() {
  Linking.openURL(STORE_URL).catch(() =>
    Linking.openURL('https://play.google.com/store/apps/details?id=com.karnalismartgroup.app').catch(() => {}),
  );
}

function versionLabel() {
  const config = Constants.expoConfig;
  const build = Platform.OS === 'ios' ? config?.ios?.buildNumber : config?.android?.versionCode;
  return `Version ${config?.version ?? '1.0.0'}${build ? ` • Build ${build}` : ''}`;
}

function DrawerPanel({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { signOut } = useAppState();
  const { profile } = useVendorState();

  const go = (href: Href) => {
    onClose();
    router.navigate(href);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Close menu" onPress={onClose} />
      </Animated.View>

      <Animated.View
        entering={SlideInLeft.duration(260)}
        exiting={SlideOutLeft.duration(220)}
        style={[styles.panel, { top: insets.top }]}
        accessibilityViewIsModal>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <AvatarIcon size={28} color={C.red} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName} numberOfLines={2}>
                {profile.businessName}
              </Text>
              <View style={styles.idPill}>
                <View style={styles.idDot} />
                <Text style={styles.idText}>Vendor ID: {profile.vendorId}</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              onPress={() => go('/vendor/profile')}
              style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.7 }]}>
              <PencilIcon size={14} color={C.red} />
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>

          <View style={styles.nav}>
            {NAV_ITEMS.map(({ label, href, path, Icon }) => {
              const active = pathname === path;
              return (
                <Pressable
                  key={label}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: active }}
                  onPress={() => go(href)}
                  style={({ pressed }) => [
                    styles.navItem,
                    active && styles.navItemActive,
                    pressed && !active && { backgroundColor: '#F8FAFC' },
                  ]}>
                  <Icon size={24} color={active ? '#FFFFFF' : '#475569'} />
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.utilities}>
            <UtilityCard
              icon={<ArrowDownIcon size={16} color={C.red} />}
              title="Check App Update"
              subtitle={versionLabel()}
              onPress={openStore}
            />
            <UtilityCard
              icon={<StarIcon size={16} color={C.red} />}
              title="Rate Our App"
              subtitle="Share your experience with us"
              onPress={openStore}
            />
            <UtilityCard
              icon={<SupportIcon size={16} color={C.red} />}
              title="Support Center"
              subtitle="Need help? Tap to view contacts"
              onPress={() => go('/contact')}
            />
            <UtilityCard icon={<LogoutIcon size={16} color={C.red} />} title="Log out" danger onPress={signOut} />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function UtilityCard({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.utility, pressed && { borderColor: danger ? '#FECDD3' : '#CBD5E1' }]}>
      <View style={styles.utilityIcon}>{icon}</View>
      <View style={styles.utilityText}>
        <Text style={[styles.utilityTitle, danger && styles.utilityTitleDanger]}>{title}</Text>
        {subtitle && <Text style={styles.utilitySubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRightIcon size={16} color={danger ? C.red : '#94A3B8'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  panel: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '86%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    boxShadow: shadow(0, 30, 0.25),
  },
  content: { paddingHorizontal: 16, paddingTop: 28 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 20 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF0F3',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '700', color: '#0F172A', letterSpacing: -0.2 },
  idPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  idDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.red, marginRight: 6 },
  idText: { fontSize: 11, fontWeight: '500', color: '#334155' },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FFF5F6',
    borderWidth: 1,
    borderColor: '#FCD7DE',
  },
  editText: { fontSize: 12, fontWeight: '700', color: C.red },
  nav: { gap: 4 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 12 },
  navItemActive: { backgroundColor: C.red, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 13, boxShadow: shadow(1, 3, 0.12) },
  navLabel: { fontSize: 15, fontWeight: '500', color: '#334155' },
  navLabelActive: { color: '#FFFFFF', fontWeight: '700' },
  utilities: { marginTop: 18, gap: 10 },
  utility: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  utilityIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFF2F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilityText: { flex: 1 },
  utilityTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  utilityTitleDanger: { fontSize: 14, color: C.red },
  utilitySubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
});
