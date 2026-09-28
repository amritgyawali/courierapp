import { createContext, type ReactNode, useContext, useMemo } from 'react';

import { DEMO_PERSON_NAME } from '@/constants/identity';
import { DEFAULT_USER_ROLE, isUserRole, type UserRole } from '@/constants/user-roles';
import { isRecord, nonEmptyOr, usePersistedState } from '@/state/persist';

export type Tracking = { id: string; number: string; addedAt: number };

export type User = {
  email: string;
  role: UserRole;
  /** Display name until sign-in returns a real profile. */
  name: string;
};

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
  signIn: (user: Omit<User, 'name'> & { name?: string }) => void;
  signOut: () => void;
  addTracking: (number: string) => boolean;
  removeTracking: (id: string) => void;
  saveDetails: (details: Details) => void;
  saveNotify: (prefs: NotifyPrefs) => void;
  saveDelivery: (prefs: DeliveryPrefs) => void;
};

const AppStateContext = createContext<AppState | null>(null);

/**
 * Merges saved data over defaults. Sessions saved before roles existed become customers, and
 * sessions saved before display names existed get the demo name.
 */
function hydrate(saved: unknown): PersistedState {
  if (!isRecord(saved)) return initialState;
  const state = { ...initialState, ...saved } as PersistedState;
  const user = isRecord(saved.user) ? saved.user : null;
  state.user =
    user && typeof user.email === 'string'
      ? {
          email: user.email,
          role: isUserRole(user.role) ? user.role : DEFAULT_USER_ROLE,
          name: nonEmptyOr(user.name, DEMO_PERSON_NAME),
        }
      : null;
  state.trackings = Array.isArray(state.trackings) ? state.trackings : [];
  state.details = { ...emptyDetails, ...(isRecord(saved.details) ? saved.details : {}) };
  return state;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState, ready] = usePersistedState(STORAGE_KEY, initialState, { hydrate });

  const value = useMemo<AppState>(
    () => ({
      ...state,
      ready,
      signIn: ({ name, ...user }) =>
        setState((s) => ({
          ...s,
          user: { ...user, name: name?.trim() || DEMO_PERSON_NAME },
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
    [state, ready, setState],
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

/** Name to greet the customer with: their own details if filled in, otherwise the account name. */
export function displayName(user: User | null, details: Details) {
  const own = `${details.name} ${details.surname}`.trim();
  return own || user?.name || DEMO_PERSON_NAME;
}
