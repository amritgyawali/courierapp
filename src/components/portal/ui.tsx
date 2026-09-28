import { type Href, router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePortalDrawer } from '@/components/portal/drawer';
import { ArrowLeftIcon, CloseIcon, InfoCircleIcon, MenuIcon, PlusIcon, SearchIcon } from '@/components/portal/icons';
import { shadow, PortalColors as C } from '@/constants/theme';

export type InfoContent = { title: string; body: string };

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' });

/** White "4" mark and italic wordmark used in the Dashboard header. */
export function PortalLogo() {
  return (
    <View style={styles.logoRow} accessibilityRole="header" accessibilityLabel="Karnali Smart Group">
      <View style={styles.logoMark}>
        <Text style={styles.logoMarkText}>4</Text>
      </View>
      <Text style={styles.logoText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
        karnali smart group
      </Text>
    </View>
  );
}

type HeaderProps = {
  /** Centered title. Omit to show the brand logo instead (Dashboard). */
  title?: string;
  /** Replaces the default right-hand info button. */
  right?: ReactNode;
  /** Content of the sheet opened by the info button. */
  info?: InfoContent;
  /** Show a back arrow instead of the drawer button (detail screens). Falls back to `backHref`. */
  back?: boolean;
  backHref?: Href;
};

/** Crimson app bar: drawer button, centered title or logo, info button. Paints under the status bar. */
export function PortalHeader({ title, right, info, back, backHref }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const drawer = usePortalDrawer();
  const [infoOpen, setInfoOpen] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else if (backHref) router.replace(backHref);
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={back ? 'Go back' : 'Open navigation menu'}
        hitSlop={10}
        onPress={back ? goBack : drawer.open}
        style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
        {back ? <ArrowLeftIcon size={26} color="#FFFFFF" /> : <MenuIcon size={26} color="#FFFFFF" />}
      </Pressable>

      <View style={styles.headerCenter}>
        {title ? (
          <Text style={styles.headerTitle} numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
        ) : (
          <PortalLogo />
        )}
      </View>

      {right ??
        (info ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`About ${title ?? 'this screen'}`}
            hitSlop={10}
            onPress={() => setInfoOpen(true)}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
            <InfoCircleIcon size={26} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View style={styles.headerButton} />
        ))}

      {info && <InfoSheet visible={infoOpen} content={info} onClose={() => setInfoOpen(false)} />}
    </View>
  );
}

export function HeaderIconButton({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Info sheet
// ---------------------------------------------------------------------------

export function InfoSheet({ visible, content, onClose }: { visible: boolean; content: InfoContent; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} accessibilityLabel="Close">
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{content.title}</Text>
          <Text style={styles.sheetBody}>{content.body}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.sheetButton, pressed && { backgroundColor: C.redPressed }]}>
            <Text style={styles.sheetButtonText}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Chips (pill tabs)
// ---------------------------------------------------------------------------

type ChipVariant = 'outline' | 'tint' | 'neutral';

const CHIP_INACTIVE: Record<ChipVariant, { bg: string; border: string; text: string; icon: string }> = {
  outline: { bg: C.card, border: '#F4C8D2', text: C.red, icon: C.red },
  tint: { bg: C.redTint, border: '#F9D7DE', text: C.red, icon: C.red },
  neutral: { bg: C.card, border: '#FBD5DC', text: '#374151', icon: '#D92C55' },
};

export function Chip({
  label,
  icon,
  active,
  onPress,
  variant = 'outline',
  fill,
  style,
}: {
  label: string;
  icon?: (color: string) => ReactNode;
  active: boolean;
  onPress: () => void;
  variant?: ChipVariant;
  /** Stretch to share the row equally. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inactive = CHIP_INACTIVE[variant];
  const textColor = active ? '#FFFFFF' : inactive.text;
  return (
    <Pressable
      role="tab"
      aria-selected={active}
      aria-label={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        fill && styles.chipFill,
        active
          ? [styles.chipActive, pressed && { backgroundColor: C.redPressed }]
          : { backgroundColor: inactive.bg, borderColor: inactive.border, opacity: pressed ? 0.75 : 1 },
        style,
      ]}>
      {icon?.(active ? '#FFFFFF' : inactive.icon)}
      <Text style={[styles.chipText, { color: textColor }, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function IconTile({
  children,
  bg,
  size = 32,
  radius = 8,
}: {
  children: ReactNode;
  bg: string;
  size?: number;
  radius?: number;
}) {
  return <View style={[styles.tile, { width: size, height: size, borderRadius: radius, backgroundColor: bg }]}>{children}</View>;
}

export function SectionHeading({ icon, title, right }: { icon: ReactNode; title: string; right?: ReactNode }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingLeft}>
        {icon}
        <Text style={styles.sectionHeadingText} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

/** Square toolbar button next to search bars (search, filter, sort). */
export function ToolButton({
  label,
  onPress,
  children,
  tint,
  active,
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
  tint?: boolean;
  active?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.toolButton,
        tint && styles.toolButtonTint,
        active && styles.toolButtonActive,
        pressed && styles.pressed,
      ]}>
      {children}
    </Pressable>
  );
}

/**
 * White pill showing a count ("6 Orders"). When `searching`, it becomes a search input and the
 * trailing search button turns into a close button.
 */
export function SearchCountBar({
  icon,
  label,
  searching,
  onToggleSearch,
  query,
  onQueryChange,
  placeholder,
  searchInside = true,
  searchIconColor = C.faint,
}: {
  icon: ReactNode;
  label: string;
  searching: boolean;
  onToggleSearch: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  placeholder: string;
  /** Show the search toggle inside the pill (Orders, Resources) instead of as a separate button. */
  searchInside?: boolean;
  searchIconColor?: string;
}) {
  const toggle = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={searching ? 'Close search' : 'Search'}
      hitSlop={8}
      onPress={onToggleSearch}>
      {searching ? <CloseIcon size={20} color={C.faint} /> : <SearchIcon size={20} color={searchIconColor} />}
    </Pressable>
  );

  return (
    <View style={styles.countBar}>
      {icon}
      {searching ? (
        <TextInput
          autoFocus
          value={query}
          onChangeText={onQueryChange}
          placeholder={placeholder}
          placeholderTextColor={C.faint}
          style={styles.countInput}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
      ) : (
        <Text style={styles.countText} numberOfLines={1}>
          {label}
        </Text>
      )}
      {(searchInside || searching) && toggle}
    </View>
  );
}

export function EmptyState({ icon, title, message }: { icon: ReactNode; title: string; message: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

export function PortalFab({
  label,
  onPress,
  variant = 'solid',
  bottom = 20,
}: {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
  bottom?: number;
}) {
  const solid = variant === 'solid';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        solid ? styles.fabSolid : styles.fabOutline,
        { bottom, transform: [{ scale: pressed ? 0.95 : 1 }] },
      ]}>
      <PlusIcon size={solid ? 32 : 28} color={solid ? '#FFFFFF' : C.red} />
    </Pressable>
  );
}

/** Row of equal-width cells, padded with blanks so a short last row keeps the grid alignment. */
export function GridRow({ children, columns, gap = 6 }: { children: ReactNode[]; columns: number; gap?: number }) {
  const cells = [...children];
  while (cells.length < columns) cells.push(null);
  return (
    <View style={[styles.gridRow, { gap }]}>
      {cells.map((cell, i) => (
        <View key={i} style={styles.gridCell}>
          {cell}
        </View>
      ))}
    </View>
  );
}

export function chunk<T>(items: T[], size: number) {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  header: {
    backgroundColor: C.red,
    paddingHorizontal: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: shadow(2, 6, 0.12),
    zIndex: 10,
  },
  headerButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  headerCenter: {
    position: 'absolute',
    left: 56,
    right: 56,
    bottom: 12,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '700', letterSpacing: 0.3 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoMark: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, transform: [{ rotate: '-12deg' }] },
  logoText: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontWeight: '700',
    fontSize: 19,
    letterSpacing: -0.3,
  },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 22, paddingTop: 10 },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: C.textStrong, marginBottom: 8 },
  sheetBody: { fontSize: 14, lineHeight: 21, color: C.muted, marginBottom: 20 },
  sheetButton: { backgroundColor: C.red, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  sheetButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipFill: { flex: 1, paddingHorizontal: 8 },
  chipActive: { backgroundColor: C.red, borderColor: C.red, boxShadow: shadow(1, 3, 0.12) },
  chipText: { fontSize: 13, fontWeight: '500' },
  chipTextActive: { fontWeight: '700' },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    boxShadow: shadow(1, 6, 0.05),
  },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  tile: { alignItems: 'center', justifyContent: 'center' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHeadingLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  sectionHeadingText: { fontSize: 15, fontWeight: '700', color: C.navy },
  toolButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow(1, 3, 0.04),
  },
  toolButtonTint: { backgroundColor: C.redTint, borderColor: '#F7C6D0' },
  toolButtonActive: { borderColor: C.red },
  countBar: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: '#EDEEF1',
    borderRadius: 12,
    paddingHorizontal: 14,
    boxShadow: shadow(1, 3, 0.04),
  },
  countText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#374151' },
  countInput: { flex: 1, fontSize: 15, color: C.text, paddingVertical: 10, outlineWidth: 0 },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textStrong, textAlign: 'center' },
  emptyMessage: { fontSize: 13, lineHeight: 19, color: C.muted, textAlign: 'center', marginTop: 6 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabSolid: { backgroundColor: C.red, boxShadow: shadow(4, 14, 0.4, C.red) },
  fabOutline: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: C.red, boxShadow: shadow(4, 12, 0.18) },
  gridRow: { flexDirection: 'row' },
  gridCell: { flex: 1 },
});
