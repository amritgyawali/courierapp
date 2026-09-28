import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_500Medium } from '@expo-google-fonts/nunito/500Medium';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { Poppins_800ExtraBold } from '@expo-google-fonts/poppins/800ExtraBold';
import * as Font from 'expo-font';
import type { TextStyle } from 'react-native';

export const FONT_FAMILY_IDS = ['jakarta', 'poppins', 'nunito', 'system'] as const;

export type FontFamilyId = (typeof FONT_FAMILY_IDS)[number];

export const DEFAULT_FONT_FAMILY: FontFamilyId = 'jakarta';

/** Weights bundled for every custom family; other weights snap to the nearest one. */
type FaceWeight = 400 | 500 | 600 | 700 | 800;

type FamilyDefinition = {
  label: string;
  description: string;
  /** Registered font name per weight, with its bundled file. `null` = platform font. */
  faces: Record<FaceWeight, { name: string; source: number }> | null;
};

const face = (name: string, source: number) => ({ name, source });

export const FONT_FAMILIES: Record<FontFamilyId, FamilyDefinition> = {
  jakarta: {
    label: 'Plus Jakarta Sans',
    description: 'Modern and friendly (default)',
    faces: {
      400: face('PlusJakartaSans_400Regular', PlusJakartaSans_400Regular),
      500: face('PlusJakartaSans_500Medium', PlusJakartaSans_500Medium),
      600: face('PlusJakartaSans_600SemiBold', PlusJakartaSans_600SemiBold),
      700: face('PlusJakartaSans_700Bold', PlusJakartaSans_700Bold),
      800: face('PlusJakartaSans_800ExtraBold', PlusJakartaSans_800ExtraBold),
    },
  },
  poppins: {
    label: 'Poppins',
    description: 'Geometric and bold',
    faces: {
      400: face('Poppins_400Regular', Poppins_400Regular),
      500: face('Poppins_500Medium', Poppins_500Medium),
      600: face('Poppins_600SemiBold', Poppins_600SemiBold),
      700: face('Poppins_700Bold', Poppins_700Bold),
      800: face('Poppins_800ExtraBold', Poppins_800ExtraBold),
    },
  },
  nunito: {
    label: 'Nunito',
    description: 'Rounded, soft and easy to read',
    faces: {
      400: face('Nunito_400Regular', Nunito_400Regular),
      500: face('Nunito_500Medium', Nunito_500Medium),
      600: face('Nunito_600SemiBold', Nunito_600SemiBold),
      700: face('Nunito_700Bold', Nunito_700Bold),
      800: face('Nunito_800ExtraBold', Nunito_800ExtraBold),
    },
  },
  system: {
    label: 'System default',
    description: 'San Francisco on iPhone, Roboto on Android',
    faces: null,
  },
};

export function isFontFamilyId(value: unknown): value is FontFamilyId {
  return typeof value === 'string' && (FONT_FAMILY_IDS as readonly string[]).includes(value);
}

const NAMED_WEIGHTS: Record<string, number> = {
  normal: 400,
  bold: 700,
  ultralight: 200,
  thin: 100,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  condensedBold: 700,
  condensed: 400,
  heavy: 800,
  black: 900,
};

/** Numeric weight of a React Native `fontWeight` value (400 when unset). */
export function numericWeight(weight: TextStyle['fontWeight'] | undefined) {
  if (weight == null) return 400;
  if (typeof weight === 'number') return weight;
  return NAMED_WEIGHTS[weight] ?? (Number.parseInt(weight, 10) || 400);
}

function snap(weight: number): FaceWeight {
  if (weight <= 400) return 400;
  if (weight >= 800) return 800;
  return (Math.round(weight / 100) * 100) as FaceWeight;
}

/** Registered font name for a family and weight; `undefined` means "use the platform font". */
export function fontFace(family: FontFamilyId, weight?: TextStyle['fontWeight']) {
  return FONT_FAMILIES[family].faces?.[snap(numericWeight(weight))].name;
}

const loading = new Map<FontFamilyId, Promise<void>>();

/** Loads every face of a family once; later calls reuse the same promise. */
export function loadFontFamily(family: FontFamilyId): Promise<void> {
  const faces = FONT_FAMILIES[family].faces;
  if (!faces) return Promise.resolve();
  let pending = loading.get(family);
  if (!pending) {
    const map = Object.fromEntries(Object.values(faces).map((f) => [f.name, f.source]));
    pending = Font.loadAsync(map).catch((error: unknown) => {
      loading.delete(family);
      throw error;
    });
    loading.set(family, pending);
  }
  return pending;
}
