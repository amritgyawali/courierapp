import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Rect, Text as SvgText } from 'react-native-svg';

import { CheckIcon, ChevronRightIcon, CloseIcon, InfoFilledIcon } from '@/components/portal/icons';
import { Text, TextInput } from '@/components/text';
import { makeStyles, type Palette, shadow, useColors, useTheme } from '@/theme';

// ---------------------------------------------------------------------------
// Bottom sheet
// ---------------------------------------------------------------------------

/** Modal bottom sheet with a title, scrollable body and optional sticky footer. */
export function Sheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const C = useColors();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close">
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <View style={styles.flex}>
                <Text style={styles.sheetTitle}>{title}</Text>
                {subtitle && <Text style={styles.sheetSubtitle}>{subtitle}</Text>}
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={onClose} style={styles.sheetClose}>
                <CloseIcon size={16} color={C.muted} />
              </Pressable>
            </View>
            <ScrollView style={styles.sheetBody} contentContainerStyle={styles.sheetBodyContent} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
            {footer && <View style={styles.sheetFooter}>{footer}</View>}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

type ButtonVariant = 'primary' | 'outline' | 'soft' | 'success' | 'danger' | 'ghost';

type ButtonTone = { bg: string; pressed: string; text: string; border?: string };

const buttonTone = (C: Palette, variant: ButtonVariant): ButtonTone =>
  ({
    primary: { bg: C.primary, pressed: C.primaryPressed, text: C.onPrimary },
    outline: { bg: C.card, pressed: C.primaryTint, text: C.primary, border: C.primaryBorder },
    soft: { bg: C.primaryTint, pressed: C.primarySoft, text: C.primary, border: C.primarySoft },
    success: { bg: C.success, pressed: C.successStrong, text: '#FFFFFF' },
    danger: { bg: C.card, pressed: '#FEF2F2', text: C.dangerStrong, border: C.dangerBorder },
    ghost: { bg: '#F3F4F6', pressed: C.border, text: C.text },
  })[variant];

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
  compact,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: (color: string) => ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const styles = useStyles();
  const C = useColors();
  const v = buttonTone(C, variant);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        { backgroundColor: pressed ? v.pressed : v.bg, borderColor: v.border ?? 'transparent' },
        variant === 'primary' && styles.buttonShadow,
        (disabled || loading) && styles.disabled,
        style,
      ]}>
      {loading ? <ActivityIndicator color={v.text} size="small" /> : icon?.(v.text)}
      <Text style={[styles.buttonText, compact && styles.buttonTextCompact, { color: v.text }]}>{title}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

/** SVG text defaults to a serif face on web; fall back to the system UI font there. */
const SVG_FALLBACK_FONT = Platform.select({ web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', default: undefined });

const AVATAR_COLORS = ['#4666E5', '#E91E63', '#0EA5E9', '#F59E0B', '#10B981', '#8B5CF6', '#C0143C', '#0F766E'];

export function avatarColor(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function Avatar({ name, size = 44, status }: { name: string; size?: number; status?: string }) {
  const styles = useStyles();
  const parts = name.trim().split(/\s+/);
  const letters = (parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? ''));
  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: avatarColor(name) }]}>
        <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{letters.toUpperCase()}</Text>
      </View>
      {status && <View style={[styles.statusDot, { backgroundColor: status }]} />}
    </View>
  );
}

export function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

/** Circular progress with the percentage in the middle. */
export function ProgressRing({
  value,
  size = 96,
  stroke = 10,
  color: colorProp,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}) {
  const C = useColors();
  const styles = useStyles();
  const color = colorProp ?? C.success;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`${label ?? 'Progress'} ${clamped}%`}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF0F3" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(circumference * clamped) / 100} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.ringCenter]}>
        <Text style={[styles.ringValue, { fontSize: size * 0.22 }]}>{clamped}%</Text>
        {label && <Text style={styles.ringLabel}>{label}</Text>}
      </View>
    </View>
  );
}

export type BarDatum = { label: string; values: number[]; highlight?: boolean };

/** Grouped bar chart (one or two series) drawn with SVG. */
export function BarChart({
  data,
  colors: colorsProp,
  height = 150,
  legend,
}: {
  data: BarDatum[];
  colors?: string[];
  height?: number;
  legend?: string[];
}) {
  const { colors: C, fonts } = useTheme();
  const styles = useStyles();
  const colors = colorsProp ?? [C.primary, C.primaryMuted];
  const [width, setWidth] = useState(0);
  const max = Math.max(1, ...data.flatMap((d) => d.values));
  const series = Math.max(1, ...data.map((d) => d.values.length));
  const labelH = 18;
  const valueH = 14;
  const plotH = height - labelH - valueH;
  const slot = width / Math.max(1, data.length);
  const barW = Math.min(16, (slot * 0.62) / series);

  return (
    <View>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <Rect key={f} x={0} y={valueH + plotH * (1 - f)} width={width} height={1} fill="#F1F2F4" />
            ))}
            {data.map((d, i) => {
              const groupW = barW * d.values.length + (d.values.length - 1) * 3;
              const x0 = i * slot + (slot - groupW) / 2;
              return (
                <G key={d.label}>
                  {d.values.map((v, j) => {
                    const h = Math.max(v > 0 ? 3 : 0, (v / max) * plotH);
                    return (
                      <Rect
                        key={j}
                        x={x0 + j * (barW + 3)}
                        y={valueH + plotH - h}
                        width={barW}
                        height={h}
                        rx={3}
                        fill={colors[j % colors.length]}
                        opacity={d.highlight || data.every((x) => !x.highlight) ? 1 : 0.55}
                      />
                    );
                  })}
                  <SvgText
                    x={i * slot + slot / 2}
                    y={valueH + plotH - (Math.max(...d.values) / max) * plotH - 4}
                    fontSize={10}
                    fontFamily={fonts.face('700') ?? SVG_FALLBACK_FONT}
                    fontWeight={fonts.face('700') ? 'normal' : '700'}
                    fill="#475569"
                    textAnchor="middle">
                    {Math.max(...d.values)}
                  </SvgText>
                  <SvgText
                    x={i * slot + slot / 2}
                    y={height - 4}
                    fontSize={10}
                    fontFamily={fonts.face(d.highlight ? '700' : '500') ?? SVG_FALLBACK_FONT}
                    fontWeight={fonts.face('700') ? 'normal' : d.highlight ? '700' : '500'}
                    fill={d.highlight ? C.primary : '#6B7280'}
                    textAnchor="middle">
                    {d.label}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        )}
      </View>
      {legend && (
        <View style={styles.legend}>
          {legend.map((l, i) => (
            <View key={l} style={styles.legendItem}>
              <Dot color={colors[i % colors.length]} />
              <Text style={styles.legendText}>{l}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function ProgressBar({
  value,
  color: colorProp,
  track = '#F1F2F4',
  height = 8,
}: {
  value: number;
  color?: string;
  track?: string;
  height?: number;
}) {
  const C = useColors();
  const color = colorProp ?? C.primary;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${clamped}%`, height: '100%', borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Rows & fields
// ---------------------------------------------------------------------------

export function KeyValue({ label, value, valueColor, bold }: { label: string; value: string; valueColor?: string; bold?: boolean }) {
  const styles = useStyles();
  return (
    <View style={styles.kv}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={[styles.kvValue, bold && styles.kvBold, valueColor ? { color: valueColor } : null]} selectable>
        {value}
      </Text>
    </View>
  );
}

export function ListRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  chevron = !!onPress,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
}) {
  const styles = useStyles();
  const C = useColors();
  const content = (
    <>
      {icon}
      <View style={styles.flex}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.rowSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
      {chevron && <ChevronRightIcon size={16} color={C.faint} />}
    </>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: '#FAFAFB' }]}>
      {content}
    </Pressable>
  ) : (
    <View style={styles.row}>{content}</View>
  );
}

export function TextField({ label, hint, error, style, ...input }: { label: string; hint?: string; error?: string } & TextInputProps) {
  const styles = useStyles();
  const C = useColors();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={C.faint}
        {...input}
        onFocus={(e) => {
          setFocused(true);
          input.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          input.onBlur?.(e);
        }}
        style={[styles.input, focused && styles.inputFocused, !!error && styles.inputError, input.multiline && styles.inputMultiline, style]}
      />
      {!!(error || hint) && <Text style={[styles.fieldHint, !!error && styles.fieldError]}>{error || hint}</Text>}
    </View>
  );
}

/** Accessible on/off switch in the brand colour. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const styles = useStyles();
  return (
    <Pressable
      role="switch"
      aria-checked={value}
      aria-label={label}
      onPress={() => onChange(!value)}
      hitSlop={8}
      style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.knob, value && styles.knobOn]} />
    </Pressable>
  );
}

/** Compact KPI tile: tinted icon, big value, label, optional footnote. */
export function StatTile({
  icon,
  tint,
  value,
  label,
  note,
  noteColor,
  onPress,
}: {
  icon: ReactNode;
  tint: string;
  value: string | number;
  label: string;
  note?: string;
  noteColor?: string;
  onPress?: () => void;
}) {
  const C = useColors();
  const styles = useStyles();
  const body = (
    <>
      <View style={styles.statTop}>
        <View style={[styles.statIcon, { backgroundColor: tint }]}>{icon}</View>
        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      </View>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
      {note && (
        <Text style={[styles.statNote, { color: noteColor ?? C.muted }]} numberOfLines={1}>
          {note}
        </Text>
      )}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [styles.stat, pressed && { opacity: 0.85 }]}>
      {body}
    </Pressable>
  ) : (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      {body}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------

type Tone = 'success' | 'info' | 'error';
type ToastItem = { id: number; message: string; tone: Tone };

const ToastContext = createContext<((message: string, tone?: Tone) => void) | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

/** Stacks short confirmations ("Parcel delivered") above the tab bar. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const styles = useStyles();
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const insets = useSafeAreaInsets();

  const show = useCallback((message: string, tone: Tone = 'success') => {
    const id = ++counter.current;
    setItems((xs) => [...xs.slice(-2), { id, message, tone }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 2800);
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.flex}>
        {children}
        <View style={[styles.toasts, { bottom: insets.bottom + 84 }]}>
          {items.map((t) => (
            <Animated.View key={t.id} entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)} style={[styles.toast, styles[`toast_${t.tone}`]]}>
              {t.tone === 'success' ? <CheckIcon size={16} color="#FFFFFF" /> : <InfoFilledIcon size={16} color="#FFFFFF" />}
              <Text style={styles.toastText} accessibilityLiveRegion="polite">
                {t.message}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </ToastContext.Provider>
  );
}

/** Re-renders every `ms` so time-based labels ("12m ago", shift timers) stay current. */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

// ---------------------------------------------------------------------------

const useStyles = makeStyles(({ colors: C }) => ({
  flex: { flex: 1 },
  disabled: { opacity: 0.5 },
  backdrop: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 10,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', marginBottom: 10 },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 20, paddingBottom: 8 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: C.textStrong },
  sheetSubtitle: { fontSize: 13, color: C.muted, marginTop: 2 },
  sheetClose: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  sheetBody: { flexGrow: 0 },
  sheetBodyContent: { paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  sheetFooter: { paddingHorizontal: 20, paddingTop: 10, gap: 10, borderTopWidth: 1, borderTopColor: '#F1F2F4' },
  button: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonCompact: { minHeight: 38, borderRadius: 10, paddingHorizontal: 12 },
  buttonShadow: { boxShadow: shadow(2, 8, 0.18, C.primary) },
  buttonText: { fontSize: 15, fontWeight: '700' },
  buttonTextCompact: { fontSize: 13 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.5 },
  statusDot: { position: 'absolute', right: 0, bottom: 0, width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: '#FFFFFF' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringValue: { fontWeight: '800', color: C.textStrong },
  ringLabel: { fontSize: 10, fontWeight: '600', color: C.muted, marginTop: -1 },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 12, color: C.muted, fontWeight: '500' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, paddingVertical: 7 },
  kvLabel: { fontSize: 13, color: C.muted },
  kvValue: { flexShrink: 1, fontSize: 13, fontWeight: '600', color: C.textStrong, textAlign: 'right' },
  kvBold: { fontSize: 15, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: C.textStrong },
  rowSubtitle: { fontSize: 12, color: C.muted, marginTop: 2 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.muted },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: C.text,
    backgroundColor: '#FFFFFF',
    outlineWidth: 0,
  },
  inputFocused: { borderColor: C.primary },
  inputError: { borderColor: C.danger },
  inputMultiline: { minHeight: 90, textAlignVertical: 'top' },
  fieldHint: { fontSize: 12, color: C.muted },
  fieldError: { color: C.danger },
  toggle: { width: 46, height: 28, borderRadius: 14, backgroundColor: '#D1D5DB', padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: C.primary },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', boxShadow: shadow(1, 3, 0.2) },
  knobOn: { alignSelf: 'flex-end' },
  stat: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 14,
    boxShadow: shadow(1, 6, 0.05),
  },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  statIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statValue: { flexShrink: 1, fontSize: 20, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#475569', letterSpacing: 0.6, textTransform: 'uppercase' },
  statNote: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  toasts: { position: 'absolute', left: 16, right: 16, alignItems: 'center', gap: 8, pointerEvents: 'none' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    maxWidth: 480,
    boxShadow: shadow(4, 16, 0.25),
  },
  toast_success: { backgroundColor: '#15803D' },
  toast_info: { backgroundColor: '#1F2937' },
  toast_error: { backgroundColor: '#B91C1C' },
  toastText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flexShrink: 1 },
}));
