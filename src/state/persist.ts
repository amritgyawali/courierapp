import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

/** Reads and parses a stored JSON value; `undefined` when nothing is saved or it is unreadable. */
export async function readJson(key: string): Promise<unknown> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function writeJson(key: string, value: unknown) {
  return AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}

type PersistOptions<T> = {
  /**
   * Turns whatever was saved (possibly by an older app version) into valid state. Pass a
   * module-level function: a new function on every render would reload the saved value.
   */
  hydrate: (saved: unknown) => T;
  /** Batch rapid changes: write this long after the last one. */
  debounceMs?: number;
};

/**
 * `useState` that is loaded from and saved to device storage. `ready` turns true once the saved
 * value (if any) has been applied, so screens can wait instead of flashing defaults.
 */
export function usePersistedState<T>(key: string, initial: T | (() => T), { hydrate, debounceMs = 0 }: PersistOptions<T>) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    readJson(key)
      .then((saved) => {
        if (!cancelled && saved !== undefined) setState(hydrate(saved));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [key, hydrate]);

  useEffect(() => {
    if (!ready) return;
    if (!debounceMs) {
      writeJson(key, state);
      return;
    }
    const handle = setTimeout(() => writeJson(key, state), debounceMs);
    return () => clearTimeout(handle);
  }, [key, state, ready, debounceMs]);

  return [state, setState, ready] as const;
}

/** Narrowing helpers for hydrate functions. */
export const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export const stringOr = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback);

export const nonEmptyOr = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() ? v : fallback);
