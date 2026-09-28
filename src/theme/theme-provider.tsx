import { createContext, type ReactNode, use, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useBranding } from '@/state/branding-state';
import { type FontFamilyId, loadFontFamily } from '@/theme/fonts';
import type { Palette } from '@/theme/palette';
import { createTheme, DEFAULT_THEME, type Theme } from '@/theme/theme';

const ThemeContext = createContext<Theme>(DEFAULT_THEME);
const FontsReadyContext = createContext(true);

/** Give up waiting for a font after this long and show the platform font instead. */
const FONT_TIMEOUT_MS = 6000;

/**
 * Loads the requested font family and reports which one is safe to render with. The previous
 * family stays active while a new one loads, so switching fonts never flashes unstyled text.
 */
function useActiveFontFamily(requested: FontFamilyId | null) {
  const [active, setActive] = useState<FontFamilyId | null>(null);

  useEffect(() => {
    if (!requested) return;
    let cancelled = false;
    const fallback = setTimeout(() => {
      if (!cancelled) setActive((prev) => prev ?? 'system');
    }, FONT_TIMEOUT_MS);
    loadFontFamily(requested)
      .then(() => {
        if (!cancelled) setActive(requested);
      })
      .catch(() => {
        if (!cancelled) setActive((prev) => prev ?? 'system');
      })
      .finally(() => clearTimeout(fallback));
    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, [requested]);

  return { family: active ?? 'system', ready: active !== null };
}

/** Builds the theme from the branding settings and shares it with the whole app. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, ready: brandingReady } = useBranding();
  const fonts = useActiveFontFamily(brandingReady ? settings.fontFamily : null);

  const theme = useMemo(
    () => createTheme({ primaryColor: settings.primaryColor, fontFamily: fonts.family, textScale: settings.textScale }),
    [settings.primaryColor, settings.textScale, fonts.family],
  );

  return (
    <ThemeContext value={theme}>
      <FontsReadyContext value={fonts.ready}>{children}</FontsReadyContext>
    </ThemeContext>
  );
}

export function useTheme() {
  return use(ThemeContext);
}

export function useColors(): Palette {
  return use(ThemeContext).colors;
}

/** False until the branded font has loaded (the root keeps the splash screen up until then). */
export function useFontsReady() {
  return use(FontsReadyContext);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

type NamedStyles<T> = StyleSheet.NamedStyles<T>;

const styleCache = new WeakMap<Theme, WeakMap<object, unknown>>();

/** One stylesheet per (theme, factory), shared by every component instance. */
function resolveStyles<T>(theme: Theme, factory: (theme: Theme) => T): T {
  let perTheme = styleCache.get(theme);
  if (!perTheme) {
    perTheme = new WeakMap();
    styleCache.set(theme, perTheme);
  }
  let styles = perTheme.get(factory) as T | undefined;
  if (!styles) {
    styles = factory(theme);
    perTheme.set(factory, styles);
  }
  return styles;
}

/**
 * Themed `StyleSheet.create`. Declare styles once at module level and call the returned hook in
 * components; styles are rebuilt only when the theme (brand colour, font, text size) changes.
 *
 *   const useStyles = makeStyles(({ colors: C }) => ({ title: { color: C.primary } }));
 *   function Title() { const styles = useStyles(); … }
 */
export function makeStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  factory: (theme: Theme) => T & NamedStyles<any>,
): () => T {
  const build = (theme: Theme) => StyleSheet.create(factory(theme));
  return function useStyles() {
    return resolveStyles(use(ThemeContext), build);
  };
}
