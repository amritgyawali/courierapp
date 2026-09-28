import type { TextStyle } from 'react-native';

import { type FontFamilyId, fontFace } from '@/theme/fonts';
import { buildPalette, type Palette } from '@/theme/palette';
import { DEFAULT_PRIMARY_COLOR, TEXT_SCALES, type TextScaleId } from '@/theme/presets';

export type Theme = {
  colors: Palette;
  fonts: {
    family: FontFamilyId;
    /** Registered font for a weight; `undefined` means the platform font. */
    face: (weight?: TextStyle['fontWeight']) => string | undefined;
  };
  /** Multiplier applied to every font size (Admin → Branding → Text size). */
  textScale: number;
};

export type ThemeInput = { primaryColor: string; fontFamily: FontFamilyId; textScale: TextScaleId };

export function createTheme({ primaryColor, fontFamily, textScale }: ThemeInput): Theme {
  return {
    colors: buildPalette(primaryColor),
    fonts: { family: fontFamily, face: (weight) => fontFace(fontFamily, weight) },
    textScale: TEXT_SCALES[textScale].factor,
  };
}

/**
 * Theme for anything rendered outside the provider. It uses the platform font because custom
 * faces are only safe to reference once they have loaded.
 */
export const DEFAULT_THEME = createTheme({
  primaryColor: DEFAULT_PRIMARY_COLOR,
  fontFamily: 'system',
  textScale: 'default',
});
