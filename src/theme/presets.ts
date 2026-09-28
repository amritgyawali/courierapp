/**
 * Brand colours offered in Admin → Branding & Appearance. Every preset keeps white text readable
 * (contrast ≥ 4.5:1); custom colours are darkened automatically until they do too.
 */
export type ThemePreset = { id: string; name: string; color: string };

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'teal', name: 'Teal', color: '#0F766E' },
  { id: 'ocean', name: 'Ocean', color: '#0369A1' },
  { id: 'indigo', name: 'Indigo', color: '#4338CA' },
  { id: 'emerald', name: 'Emerald', color: '#047857' },
  { id: 'violet', name: 'Violet', color: '#6D28D9' },
  { id: 'slate', name: 'Slate', color: '#334155' },
  { id: 'sunset', name: 'Sunset', color: '#C2410C' },
  { id: 'crimson', name: 'Crimson', color: '#C0143C' },
];

/** Calm teal: easy on the eyes, distinct from the green / amber / red status colours. */
export const DEFAULT_PRIMARY_COLOR = THEME_PRESETS[0].color;

export const TEXT_SCALES = {
  compact: { label: 'Compact', factor: 0.92 },
  default: { label: 'Default', factor: 1 },
  large: { label: 'Large', factor: 1.1 },
} as const;

export type TextScaleId = keyof typeof TEXT_SCALES;

export function isTextScaleId(value: unknown): value is TextScaleId {
  return typeof value === 'string' && value in TEXT_SCALES;
}
