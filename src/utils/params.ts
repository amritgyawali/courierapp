/**
 * Narrows an untrusted route param to one of the allowed values. Deep links and typos can put
 * anything in the URL, so screens never cast params straight to their filter types.
 */
export function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T;
export function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: null): T | null;
export function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T | null): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}
