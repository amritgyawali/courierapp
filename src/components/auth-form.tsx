import { type ComponentType, type ReactNode, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogoLarge } from '@/components/brand';
import { MotorbikeIcon, ShieldIcon, StorefrontIcon, UserIcon } from '@/components/icons';
import { Colors, shadow } from '@/constants/theme';
import { USER_ROLE_LABELS, USER_ROLES, type UserRole } from '@/constants/user-roles';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shared layout for the Login and Register screens. */
export function AuthLayout({ title, bold, children }: { title: string; bold?: boolean; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 96, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <BrandLogoLarge />
          <Text style={[styles.title, bold && { fontWeight: '700' }]}>{title}</Text>
        </View>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function OrDivider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>OR</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const ROLE_ICONS: Record<UserRole, ComponentType<{ size?: number; color?: string }>> = {
  customer: UserIcon,
  vendor: StorefrontIcon,
  rider: MotorbikeIcon,
  admin: ShieldIcon,
};

const TRACK_PADDING = 4;

/** Segmented control for picking the account type, with a sliding red indicator. */
export function RoleSelector({ value, onChange }: { value: UserRole; onChange: (role: UserRole) => void }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const segmentWidth = (trackWidth - TRACK_PADDING * 2) / USER_ROLES.length;
  const offset = USER_ROLES.indexOf(value) * segmentWidth;

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(offset, { duration: 220 }) }],
  }));

  return (
    <View>
      <Text style={styles.roleHeading}>Sign in as</Text>
      <View
        role="radiogroup"
        aria-label="Account type"
        style={styles.roleTrack}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
        {trackWidth > 0 && <Animated.View style={[styles.roleIndicator, { width: segmentWidth }, indicatorStyle]} />}
        {USER_ROLES.map((role) => {
          const selected = role === value;
          const color = selected ? Colors.white : Colors.text;
          const Icon = ROLE_ICONS[role];
          return (
            <Pressable
              key={role}
              role="radio"
              aria-checked={selected}
              aria-label={`${USER_ROLE_LABELS[role]} account`}
              onPress={() => onChange(role)}
              style={styles.roleOption}>
              <Icon size={18} color={color} />
              <Text style={[styles.roleText, { color }, selected && styles.roleTextSelected]}>
                {USER_ROLE_LABELS[role]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flexGrow: 1, paddingHorizontal: 28, width: '100%', maxWidth: 420, alignSelf: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { marginTop: 26, fontSize: 30, color: Colors.black, letterSpacing: -0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#D1D5DB' },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 1,
  },
  error: { color: Colors.red, fontSize: 13, marginTop: -4 },
  roleHeading: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, marginBottom: 8, marginLeft: 2 },
  roleTrack: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: TRACK_PADDING,
  },
  roleIndicator: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: TRACK_PADDING,
    borderRadius: 9,
    backgroundColor: Colors.red,
    boxShadow: shadow(2, 8, 0.3, Colors.red),
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 9,
  },
  roleText: { fontSize: 12, fontWeight: '500' },
  roleTextSelected: { fontWeight: '700' },
});
