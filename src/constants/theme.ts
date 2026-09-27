import { Platform } from 'react-native';

export const Colors = {
  red: '#DC1E35',
  redPressed: '#B7182B',
  redDotInactive: '#F8B4B4',
  black: '#111827',
  text: '#1F2937',
  textMuted: '#6B7280',
  placeholder: '#6B7280',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  inputBg: '#EEEEF0',
  grayButton: '#BFBFBF',
  grayButtonSoft: '#E4E6EA',
  screenBg: '#F4F4F6',
  screenBgAlt: '#EDEDED',
  white: '#FFFFFF',
  illustration: '#ADB5BD',
  link: '#2563EB',
  navy: '#1B2A4A',
  skyline: '#A8AFB8',
};

export const Fonts = Platform.select({
  ios: { sans: 'System' },
  android: { sans: 'sans-serif' },
  default: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
})!;

/**
 * Cross-platform drop shadow as a CSS `boxShadow` string. React Native renders it natively on
 * iOS and Android (New Architecture) and on web, replacing the deprecated `shadow*` and
 * `elevation` props.
 */
export function shadow(offsetY: number, blur: number, opacity: number, color = '#000000') {
  const hex = color.replace('#', '');
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  const n = Number.parseInt(full, 16);
  return `0px ${offsetY}px ${blur}px rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
}

export const cardShadow = { boxShadow: shadow(1, 6, 0.06) };

/** Palette for the vendor portal (screens in `vendor ui-ux`), which uses a deeper crimson. */
export const VendorColors = {
  red: '#C0143C',
  redPressed: '#A30F32',
  redTint: '#FDF2F4',
  redTintBorder: '#F5C2CB',
  redSoft: '#FDECEF',
  navy: '#1E3A5F',
  screenBg: '#F5F6FA',
  card: '#FFFFFF',
  cardBorder: '#F0F1F4',
  text: '#1F2937',
  textStrong: '#111827',
  muted: '#6B7280',
  faint: '#9CA3AF',
  divider: '#F1F2F4',
  blue: '#4361EE',
  green: '#22C55E',
  greenDark: '#19A56F',
  amber: '#F59E0B',
  rose: '#E11D48',
};
