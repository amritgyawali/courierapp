import Constants from 'expo-constants';
import { type Href, router, usePathname } from 'expo-router';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { BackHandler, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/brand';
import {
  ArrowDownIcon,
  AvatarIcon,
  ChevronRightIcon,
  LogoutIcon,
  PencilIcon,
  type PortalIconProps,
  StarIcon,
  SupportIcon,
} from '@/components/portal/icons';
import { Text } from '@/components/text';
import { useAppState } from '@/state/app-state';
import { useBrand } from '@/state/branding-state';
import { makeStyles, shadow, useColors } from '@/theme';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export type DrawerNavItem = {
  label: string;
  href: Href;
  /** Pathname that marks the item as the current screen, e.g. `/admin/riders`. */
  match: string;
  icon: (p: PortalIconProps) => ReactNode;
  /** Optional count bubble (open tickets, pending approvals…). */
  badge?: number;
  /** Items sharing a section are grouped under a small heading. */
  section?: string;
};

export type DrawerUtility = {
  key: string;
  title: string;
  subtitle?: string;
  icon: (color: string) => ReactNode;
  onPress: () => void;
  danger?: boolean;
};

export type DrawerConfig = {
  profile: { name: string; badge: string; editHref?: Href; avatar?: ReactNode };
  items: DrawerNavItem[];
  utilities: DrawerUtility[];
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type DrawerApi = { open: () => void; close: () => void };

const DrawerContext = createContext<DrawerApi | null>(null);

export function usePortalDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('usePortalDrawer must be used inside PortalDrawerProvider');
  return ctx;
}

/** Hosts the slide-in navigation drawer above a portal's screens and exposes `open` / `close`. */
export function PortalDrawerProvider({ config, children }: { config: DrawerConfig; children: ReactNode }) {
  const styles = useStyles();
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
        {visible && <DrawerPanel config={config} onClose={api.close} />}
      </View>
    </DrawerContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Standard utility cards (app update, rating, support, log out)
// ---------------------------------------------------------------------------

/** Store listing for the package id configured in app.json. */
const PACKAGE_ID = Constants.expoConfig?.android?.package ?? 'com.karnalismartgroup.app';
const STORE_WEB_URL = `https://play.google.com/store/apps/details?id=${PACKAGE_ID}`;
const STORE_URL = Platform.OS === 'android' ? `market://details?id=${PACKAGE_ID}` : STORE_WEB_URL;

function openStore() {
  Linking.openURL(STORE_URL).catch(() => Linking.openURL(STORE_WEB_URL).catch(() => {}));
}

export function appVersionLabel() {
  const config = Constants.expoConfig;
  const build = Platform.OS === 'ios' ? config?.ios?.buildNumber : config?.android?.versionCode;
  return `Version ${config?.version ?? '1.0.0'}${build ? ` • Build ${build}` : ''}`;
}

/** The cards every portal shows under its navigation, with optional extras placed before Log out. */
export function useStandardUtilities(extra: DrawerUtility[] = []): DrawerUtility[] {
  const { signOut } = useAppState();
  return [
    {
      key: 'update',
      title: 'Check App Update',
      subtitle: appVersionLabel(),
      icon: (c) => <ArrowDownIcon size={16} color={c} />,
      onPress: openStore,
    },
    {
      key: 'rate',
      title: 'Rate Our App',
      subtitle: 'Share your experience with us',
      icon: (c) => <StarIcon size={16} color={c} />,
      onPress: openStore,
    },
    {
      key: 'support',
      title: 'Support Center',
      subtitle: 'Need help? Tap to view contacts',
      icon: (c) => <SupportIcon size={16} color={c} />,
      onPress: () => router.push('/contact'),
    },
    ...extra,
    { key: 'logout', title: 'Log out', icon: (c) => <LogoutIcon size={16} color={c} />, onPress: signOut, danger: true },
  ];
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function DrawerPanel({ config, onClose }: { config: DrawerConfig; onClose: () => void }) {
  const styles = useStyles();
  const C = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { profile, items, utilities } = config;
  const { appName } = useBrand();

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
          <View style={styles.brand}>
            <AppIcon size={24} />
            <Text style={styles.brandName} numberOfLines={1}>
              {appName}
            </Text>
          </View>
          <View style={styles.profile}>
            <View style={styles.avatar}>{profile.avatar ?? <AvatarIcon size={28} color={C.primary} />}</View>
            <View style={styles.profileText}>
              <Text style={styles.profileName} numberOfLines={2}>
                {profile.name}
              </Text>
              <View style={styles.idPill}>
                <View style={styles.idDot} />
                <Text style={styles.idText}>{profile.badge}</Text>
              </View>
            </View>
            {profile.editHref && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit profile"
                onPress={() => go(profile.editHref!)}
                style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.7 }]}>
                <PencilIcon size={14} color={C.primary} />
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.nav}>
            {items.map((item, i) => {
              const active = pathname === item.match;
              const showSection = item.section && item.section !== items[i - 1]?.section;
              return (
                <View key={item.label}>
                  {showSection && <Text style={styles.section}>{item.section}</Text>}
                  <Pressable
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={item.badge ? `${item.label}, ${item.badge} pending` : item.label}
                    onPress={() => go(item.href)}
                    style={({ pressed }) => [
                      styles.navItem,
                      active && styles.navItemActive,
                      pressed && !active && { backgroundColor: '#F8FAFC' },
                    ]}>
                    {item.icon({ size: 24, color: active ? C.onPrimary : '#475569' })}
                    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                    {!!item.badge && (
                      <View style={[styles.badge, active && styles.badgeActive]}>
                        <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View style={styles.utilities}>
            {utilities.map((u) => (
              <Pressable
                key={u.key}
                accessibilityRole="button"
                onPress={() => {
                  onClose();
                  u.onPress();
                }}
                style={({ pressed }) => [styles.utility, pressed && { borderColor: u.danger ? C.dangerBorder : C.primaryBorder }]}>
                <View style={[styles.utilityIcon, u.danger && styles.utilityIconDanger]}>{u.icon(u.danger ? C.danger : C.primary)}</View>
                <View style={styles.utilityText}>
                  <Text style={[styles.utilityTitle, u.danger && styles.utilityTitleDanger]}>{u.title}</Text>
                  {u.subtitle && <Text style={styles.utilitySubtitle}>{u.subtitle}</Text>}
                </View>
                <ChevronRightIcon size={16} color={u.danger ? C.danger : '#94A3B8'} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  host: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.overlay },
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
  content: { paddingHorizontal: 16, paddingTop: 22 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2, paddingBottom: 18 },
  brandName: { flex: 1, fontSize: 15, fontWeight: '800', color: C.primary, letterSpacing: -0.2 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 20 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primaryTint,
    borderWidth: 1,
    borderColor: C.primarySoft,
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
  idDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary, marginRight: 6 },
  idText: { fontSize: 11, fontWeight: '500', color: '#334155' },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: C.primaryTint,
    borderWidth: 1,
    borderColor: C.primaryBorder,
  },
  editText: { fontSize: 12, fontWeight: '700', color: C.primary },
  nav: { gap: 4 },
  section: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 12 },
  navItemActive: { backgroundColor: C.primary, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 13, boxShadow: shadow(1, 3, 0.12) },
  navLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#334155' },
  navLabelActive: { color: C.onPrimary, fontWeight: '700' },
  badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  badgeText: { fontSize: 11, fontWeight: '700', color: C.primary },
  badgeTextActive: { color: C.onPrimary },
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
    backgroundColor: C.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilityIconDanger: { backgroundColor: C.dangerSoft },
  utilityText: { flex: 1 },
  utilityTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  utilityTitleDanger: { fontSize: 14, color: C.danger },
  utilitySubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
}));
