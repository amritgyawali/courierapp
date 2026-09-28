/**
 * Design system entry point: palette, fonts, themed styles and shadows.
 *
 * Screens import from `@/theme` only. Colours come from `useColors()` or a `makeStyles` factory
 * (never hard-coded brand hex values), so Admin → Branding can re-theme the app at runtime.
 */
import { hexToRgb } from '@/theme/color';

export { contrastRatio, ensureContrast, isHexColor, mix, normalizeHex, withAlpha } from '@/theme/color';
export { FONT_FAMILIES, FONT_FAMILY_IDS, type FontFamilyId, fontFace, loadFontFamily } from '@/theme/fonts';
export { buildPalette, type Palette } from '@/theme/palette';
export { DEFAULT_PRIMARY_COLOR, TEXT_SCALES, THEME_PRESETS, type TextScaleId } from '@/theme/presets';
export { createTheme, DEFAULT_THEME, type Theme } from '@/theme/theme';
export { makeStyles, ThemeProvider, useColors, useFontsReady, useTheme } from '@/theme/theme-provider';

/**
 * Cross-platform drop shadow as a CSS `boxShadow` string. React Native renders it natively on
 * iOS and Android (New Architecture) and on web, replacing the deprecated `shadow*` and
 * `elevation` props.
 */
export function shadow(offsetY: number, blur: number, opacity: number, color = '#000000') {
  const { r, g, b } = hexToRgb(color);
  return `0px ${offsetY}px ${blur}px rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const cardShadow = { boxShadow: shadow(1, 6, 0.06) };
