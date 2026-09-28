/**
 * Small colour toolkit used to derive the whole palette from one brand colour and to keep it
 * readable (WCAG contrast) whatever colour an admin picks.
 */

export type Rgb = { r: number; g: number; b: number };

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: string) {
  return HEX_RE.test(value.trim());
}

/** `#abc`, `abc`, `#AABBCC` → `#AABBCC`. Returns `null` for anything else. */
export function normalizeHex(value: string): string | null {
  const match = HEX_RE.exec(value.trim());
  if (!match) return null;
  const hex = match[1].length === 3 ? [...match[1]].map((c) => c + c).join('') : match[1];
  return `#${hex.toUpperCase()}`;
}

export function hexToRgb(hex: string): Rgb {
  const n = Number.parseInt((normalizeHex(hex) ?? '#000000').slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: Rgb) {
  const part = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

/** Linear blend: `amount` 0 keeps `a`, 1 gives `b`. */
export function mix(a: string, b: string, amount: number) {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex({ r: x.r + (y.r - x.r) * amount, g: x.g + (y.g - x.g) * amount, b: x.b + (y.b - x.b) * amount });
}

export const tint = (hex: string, amount: number) => mix(hex, '#FFFFFF', amount);
export const shade = (hex: string, amount: number) => mix(hex, '#000000', amount);

/** `rgba(…)` string for translucent overlays and shadows. */
export function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function channel(v: number) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colours (1–21). */
export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Darkens `hex` in small steps until it reaches `ratio` against `background`, so white text on a
 * brand-coloured button (and brand-coloured text on white) stays legible.
 */
export function ensureContrast(hex: string, background = '#FFFFFF', ratio = 4.5) {
  let color = normalizeHex(hex) ?? '#000000';
  for (let i = 0; i < 20 && contrastRatio(color, background) < ratio; i++) color = shade(color, 0.08);
  return color;
}
