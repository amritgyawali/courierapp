import { createContext, type ReactNode, use, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';

import { DEFAULT_SUPPORT_CONTACTS, type SupportContacts } from '@/data/content';
import { isRecord, nonEmptyOr, stringOr, usePersistedState } from '@/state/persist';
import { normalizeHex } from '@/theme/color';
import { DEFAULT_FONT_FAMILY, type FontFamilyId, isFontFamilyId } from '@/theme/fonts';
import { DEFAULT_PRIMARY_COLOR, isTextScaleId, type TextScaleId } from '@/theme/presets';

/**
 * White-label settings an admin edits in Admin → Branding & Appearance: names, logos, brand
 * colour, typography and public contact details. Every screen reads them through
 * `useBranding()` / `useTheme()`, so a change re-brands the whole app instantly.
 *
 * Saved on this device. When the backend exists, load these from it so every user sees the
 * same branding.
 */
export type BrandingSettings = {
  appName: string;
  /** Short form used in tight spots and messages, e.g. "KSG". */
  shortName: string;
  tagline: string;
  /** Wide logo for light backgrounds (Login, customer headers). Data URI; null = built-in wordmark. */
  logoUri: string | null;
  /** Square app icon for coloured headers and the drawer. Data URI; null = built-in mark. */
  iconUri: string | null;
  primaryColor: string;
  fontFamily: FontFamilyId;
  textScale: TextScaleId;
  support: SupportContacts;
  updatedAt: string | null;
};

export const DEFAULT_BRANDING: BrandingSettings = {
  appName: 'Karnali Smart Group',
  shortName: 'KSG',
  tagline: 'Courier & logistics across Nepal',
  logoUri: null,
  iconUri: null,
  primaryColor: DEFAULT_PRIMARY_COLOR,
  fontFamily: DEFAULT_FONT_FAMILY,
  textScale: 'default',
  support: DEFAULT_SUPPORT_CONTACTS,
  updatedAt: null,
};

export const BRANDING_LIMITS = { appName: 40, shortName: 8, tagline: 80 } as const;

const STORAGE_KEY = 'ksg-branding-v1';

const imageOrNull = (v: unknown) => (typeof v === 'string' && /^(data:image\/|https?:|file:)/.test(v) ? v : null);

/** Accepts settings saved by any app version and fills gaps with defaults. */
export function hydrateBranding(saved: unknown): BrandingSettings {
  if (!isRecord(saved)) return DEFAULT_BRANDING;
  const support = isRecord(saved.support) ? saved.support : {};
  const d = DEFAULT_BRANDING;
  return {
    appName: nonEmptyOr(saved.appName, d.appName).slice(0, BRANDING_LIMITS.appName),
    shortName: nonEmptyOr(saved.shortName, d.shortName).slice(0, BRANDING_LIMITS.shortName),
    tagline: stringOr(saved.tagline, d.tagline).slice(0, BRANDING_LIMITS.tagline),
    logoUri: imageOrNull(saved.logoUri),
    iconUri: imageOrNull(saved.iconUri),
    primaryColor: normalizeHex(stringOr(saved.primaryColor, '')) ?? d.primaryColor,
    fontFamily: isFontFamilyId(saved.fontFamily) ? saved.fontFamily : d.fontFamily,
    textScale: isTextScaleId(saved.textScale) ? saved.textScale : d.textScale,
    support: Object.fromEntries(
      Object.entries(d.support).map(([k, fallback]) => [k, stringOr(support[k], fallback)]),
    ) as SupportContacts,
    updatedAt: typeof saved.updatedAt === 'string' ? saved.updatedAt : null,
  };
}

type BrandingContextValue = {
  settings: BrandingSettings;
  ready: boolean;
  update: (changes: Partial<BrandingSettings>) => void;
  reset: () => void;
};

const BrandingContext = createContext<BrandingContextValue | null>(null);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings, ready] = usePersistedState(STORAGE_KEY, DEFAULT_BRANDING, { hydrate: hydrateBranding });

  // Browser tab title follows the app name on web.
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.title = settings.appName;
  }, [settings.appName]);

  const value = useMemo<BrandingContextValue>(
    () => ({
      settings,
      ready,
      update: (changes) =>
        setSettings((s) => hydrateBranding({ ...s, ...changes, updatedAt: new Date().toISOString() })),
      reset: () => setSettings({ ...DEFAULT_BRANDING, updatedAt: new Date().toISOString() }),
    }),
    [settings, ready, setSettings],
  );

  return <BrandingContext value={value}>{children}</BrandingContext>;
}

export function useBranding() {
  const ctx = use(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used inside BrandingProvider');
  return ctx;
}

/** Shorthand for components that only read the brand. */
export function useBrand() {
  return useBranding().settings;
}

/** Replaces `{brand}` in copy with the configured app name. */
export function brandText(text: string, brand: Pick<BrandingSettings, 'appName'>) {
  return text.replaceAll('{brand}', brand.appName);
}
