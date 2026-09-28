import { ensureContrast, shade, tint, withAlpha } from '@/theme/color';

/**
 * Every colour the UI uses. Brand tokens (`primary*`) are derived from the admin-selected theme
 * colour; the rest are fixed neutrals and status colours, so success stays green and errors stay
 * red whatever the brand colour is.
 */
export type Palette = {
  /** Brand fill: headers, primary buttons, active chips, links. Always ≥ 4.5:1 against white. */
  primary: string;
  primaryPressed: string;
  /** Deeper shade for text on brand tints and for emphasis. */
  primaryStrong: string;
  /** Faint wash for selected rows, icon tiles and tinted buttons. */
  primaryTint: string;
  primarySoft: string;
  primaryBorder: string;
  /** Inactive dots and the secondary series in brand charts. */
  primaryMuted: string;
  primaryShadow: string;
  onPrimary: string;
  onPrimaryMuted: string;

  screenBg: string;
  screenBgAlt: string;
  card: string;
  cardBorder: string;
  inputBg: string;
  overlay: string;

  textStrong: string;
  text: string;
  textSecondary: string;
  muted: string;
  faint: string;
  placeholder: string;

  border: string;
  borderStrong: string;
  divider: string;

  success: string;
  successStrong: string;
  successSoft: string;
  danger: string;
  dangerStrong: string;
  dangerSoft: string;
  dangerBorder: string;
  amber: string;
  amberStrong: string;
  amberSoft: string;
  green: string;
  greenDark: string;
  blue: string;
  rose: string;

  navy: string;
  link: string;
  skyline: string;
  illustration: string;
  grayButton: string;
  grayButtonSoft: string;
};

const NEUTRALS = {
  screenBg: '#F5F6FA',
  screenBgAlt: '#EDEEF0',
  card: '#FFFFFF',
  cardBorder: '#EEF0F3',
  inputBg: '#EEF0F2',
  overlay: 'rgba(15, 23, 42, 0.45)',

  textStrong: '#111827',
  text: '#1F2937',
  textSecondary: '#374151',
  muted: '#6B7280',
  faint: '#9CA3AF',
  placeholder: '#6B7280',

  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  divider: '#F1F2F4',

  success: '#16A34A',
  successStrong: '#15803D',
  successSoft: '#DCFCE7',
  danger: '#DC2626',
  dangerStrong: '#B91C1C',
  dangerSoft: '#FEE2E2',
  dangerBorder: '#FECACA',
  amber: '#F59E0B',
  amberStrong: '#B45309',
  amberSoft: '#FEF3C7',
  green: '#22C55E',
  greenDark: '#19A56F',
  blue: '#4361EE',
  rose: '#E11D48',

  navy: '#1E3A5F',
  link: '#2563EB',
  skyline: '#A8AFB8',
  illustration: '#ADB5BD',
  grayButton: '#C4C7CC',
  grayButtonSoft: '#E4E6EA',
} as const;

/** Builds the full palette around one brand colour. */
export function buildPalette(brand: string): Palette {
  const primary = ensureContrast(brand, '#FFFFFF', 4.5);
  return {
    primary,
    primaryPressed: shade(primary, 0.16),
    primaryStrong: shade(primary, 0.3),
    primaryTint: tint(primary, 0.94),
    primarySoft: tint(primary, 0.89),
    primaryBorder: tint(primary, 0.72),
    primaryMuted: tint(primary, 0.58),
    primaryShadow: primary,
    onPrimary: '#FFFFFF',
    onPrimaryMuted: withAlpha('#FFFFFF', 0.82),
    ...NEUTRALS,
  };
}
