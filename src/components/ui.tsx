import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  type StyleProp,
  StyleSheet,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogoSmall } from '@/components/brand';
import { BackArrowIcon, CheckIcon, EyeIcon, EyeSlashIcon, PlusIcon } from '@/components/icons';
import { Text, TextInput } from '@/components/text';
import { cardShadow, makeStyles, shadow, useColors } from '@/theme';

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

type HeaderProps = {
  title: string;
  /** Show the brand-coloured back arrow. */
  back?: boolean;
  /** Replaces the default brand logo on the right. Pass `null` to hide it. */
  right?: ReactNode | null;
  compactLogo?: boolean;
};

export function ScreenHeader({ title, back = false, right, compactLogo }: HeaderProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerLeft}>
        {back && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}>
            <BackArrowIcon />
          </Pressable>
        )}
        <Text style={[styles.headerTitle, !back && styles.headerTitleRoot]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.headerRight}>{right === undefined ? <BrandLogoSmall compact={compactLogo ?? back} /> : right}</View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

type IconInputProps = TextInputProps & {
  icon: ReactNode;
  secureToggle?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function IconInput({ icon, secureToggle, containerStyle, style, ...rest }: IconInputProps) {
  const styles = useStyles();
  const C = useColors();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.inputRow, focused && styles.inputRowFocused, containerStyle]}>
      <View style={styles.inputIcon}>{icon}</View>
      <TextInput
        placeholderTextColor={C.placeholder}
        {...rest}
        style={[styles.input, style]}
        secureTextEntry={secureToggle ? hidden : rest.secureTextEntry}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
      />
      {secureToggle && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle password visibility"
          hitSlop={8}
          onPress={() => setHidden((h) => !h)}
          style={styles.eyeButton}>
          {hidden ? <EyeSlashIcon /> : <EyeIcon />}
        </Pressable>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'gray' | 'soft';
  style?: StyleProp<ViewStyle>;
  radius?: number;
  bold?: boolean;
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
  radius = 12,
  bold = true,
  disabled,
}: ButtonProps) {
  const styles = useStyles();
  const C = useColors();
  const tone = {
    primary: { bg: C.primary, pressed: C.primaryPressed, text: C.onPrimary },
    gray: { bg: C.grayButtonSoft, pressed: C.border, text: C.textStrong },
    soft: { bg: C.primarySoft, pressed: C.primaryBorder, text: C.primaryStrong },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? tone.pressed : tone.bg, borderRadius: radius },
        variant === 'primary' && styles.buttonShadow,
        disabled && { opacity: 0.6 },
        style,
      ]}>
      <Text
        style={[
          styles.buttonText,
          { color: tone.text },
          !bold && { fontWeight: '500' },
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function Fab({ onPress, label, bottom = 24 }: { onPress: () => void; label: string; bottom?: number }) {
  const styles = useStyles();
  const C = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { bottom, backgroundColor: pressed ? C.primaryPressed : C.primary },
      ]}>
      <PlusIcon />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------

export function Checkbox({
  checked,
  onChange,
  size = 22,
  borderColor = '#4B5563',
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  size?: number;
  borderColor?: string;
  label?: string;
}) {
  const styles = useStyles();
  const C = useColors();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      hitSlop={10}
      onPress={() => onChange(!checked)}
      style={[
        styles.checkbox,
        {
          width: size,
          height: size,
          borderColor: checked ? C.primary : borderColor,
          backgroundColor: checked ? C.primary : 'transparent',
        },
      ]}>
      {checked && <CheckIcon size={size * 0.7} />}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Select sheet (bottom sheet list)
// ---------------------------------------------------------------------------

export function SelectSheet({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  accent: accentProp,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  /** Colour of the selected row. */
  accent?: string;
}) {
  const C = useColors();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const accent = accentProp ?? C.primary;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            style={{ maxHeight: 420 }}
            ItemSeparatorComponent={() => <View style={styles.sheetDivider} />}
            renderItem={({ item }) => {
              const active = item === selected;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={({ pressed }) => [styles.sheetItem, pressed && { backgroundColor: '#F9FAFB' }]}>
                  <Text style={[styles.sheetItemText, active && [styles.sheetItemTextActive, { color: accent }]]}>
                    {item}
                  </Text>
                  {active && <CheckIcon size={18} color={accent} />}
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------------------------------------------------------------------------

const useStyles = makeStyles(({ colors: C }) => ({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1D5DB',
    boxShadow: shadow(2, 6, 0.06),
    zIndex: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 8 },
  // The logo gives way before the screen title does.
  headerRight: { flexShrink: 2, alignItems: 'flex-end' },
  backButton: { marginRight: 18, padding: 2 },
  headerTitle: { fontSize: 19, fontWeight: '700', color: C.textStrong, letterSpacing: -0.3, flexShrink: 1 },
  headerTitleRoot: { fontSize: 22, marginLeft: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 54,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputRowFocused: { borderColor: C.primary, backgroundColor: C.card },
  inputIcon: { marginRight: 14, width: 24, alignItems: 'center' },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 14,
    outlineWidth: 0,
  },
  eyeButton: { marginLeft: 8, padding: 4 },
  button: { paddingVertical: 15, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  buttonShadow: {
    boxShadow: shadow(3, 12, 0.22, C.primaryShadow),
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow(4, 20, 0.4, C.primary),
  },
  checkbox: { borderWidth: 1.5, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  sheetBackdrop: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    ...cardShadow,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: C.textStrong, paddingHorizontal: 20, paddingBottom: 8 },
  sheetDivider: { height: StyleSheet.hairlineWidth, backgroundColor: C.border, marginHorizontal: 20 },
  sheetItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetItemText: { fontSize: 15, color: C.text },
  sheetItemTextActive: { color: C.primary, fontWeight: '600' },
}));
