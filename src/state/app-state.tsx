import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_USER_ROLE, isUserRole, type UserRole } from '@/constants/user-roles';

export type Tracking = { id: string; number: string; addedAt: number };

export type User = { email: string; role: UserRole };

export type Details = {
  name: string;
  surname: string;
  dob: string;
  email: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
};

export type NotifyPrefs = { email: boolean; phone: boolean };

export type DeliveryPrefs = { leaveSafe: boolean; place: string; time: string };

type PersistedState = {
  user: User | null;
  trackings: Tracking[];
  details: Details;
  notify: NotifyPrefs;
  delivery: DeliveryPrefs;
};

const emptyDetails: Details = {
  name: '',
  surname: '',
  dob: '',
  email: '',
  province: '',
  district: '',
  municipality: '',
  ward: '',
};

const initialState: PersistedState = {
  user: null,
  trackings: [],
  details: emptyDetails,
  notify: { email: false, phone: false },
  delivery: { leaveSafe: false, place: '', time: '' },
};

const STORAGE_KEY = 'ksg-app-state-v1';

type AppState = PersistedState & {
  ready: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
  addTracking: (number: string) => boolean;
  removeTracking: (id: string) => void;
  saveDetails: (details: Details) => void;
  saveNotify: (prefs: NotifyPrefs) => void;
  saveDelivery: (prefs: DeliveryPrefs) => void;
};

const AppStateContext = createContext<AppState | null>(null);

/** Merge saved data over defaults. Sessions saved before roles existed become customers. */
function hydrate(saved: Partial<PersistedState>): PersistedState {
  const state = { ...initialState, ...saved };
  const user = state.user as Partial<User> | null;
  state.user =
    user && typeof user.email === 'string'
      ? { email: user.email, role: isUserRole(user.role) ? user.role : DEFAULT_USER_ROLE }
      : null;
  return state;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState(hydrate(JSON.parse(raw)));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const value = useMemo<AppState>(
    () => ({
      ...state,
      ready,
      signIn: (user) =>
        setState((s) => ({
          ...s,
          user,
          details: s.details.email ? s.details : { ...s.details, email: user.email },
        })),
      signOut: () => setState((s) => ({ ...s, user: null })),
      addTracking: (number) => {
        const trimmed = number.trim().toUpperCase();
        if (!trimmed || state.trackings.some((t) => t.number === trimmed)) return false;
        setState((s) => ({
          ...s,
          trackings: [{ id: `${Date.now()}`, number: trimmed, addedAt: Date.now() }, ...s.trackings],
        }));
        return true;
      },
      removeTracking: (id) => setState((s) => ({ ...s, trackings: s.trackings.filter((t) => t.id !== id) })),
      saveDetails: (details) => setState((s) => ({ ...s, details })),
      saveNotify: (notify) => setState((s) => ({ ...s, notify })),
      saveDelivery: (delivery) => setState((s) => ({ ...s, delivery })),
    }),
    [state, ready],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}

export function hasDetails(d: Details) {
  return Boolean(d.name || d.surname || d.dob || d.province || d.district || d.municipality || d.ward);
}
