import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import {
  SAMPLE_COMMENTS,
  SAMPLE_ORDERS,
  SAMPLE_PAYMENTS,
  SAMPLE_PROFILE,
  type VendorComment,
  type VendorOrder,
  type VendorPayment,
  type VendorProfile,
} from '@/data/vendor';

const STORAGE_KEY = 'ksg-vendor-state-v1';

/** What the vendor changes on the device: profile edits and which comments were marked read. */
type PersistedVendorState = { profile: VendorProfile; readCommentIds: string[] };

type VendorState = PersistedVendorState & {
  orders: VendorOrder[];
  payments: VendorPayment[];
  comments: VendorComment[];
  isCommentRead: (id: string) => boolean;
  markCommentRead: (id: string) => void;
  updateProfile: (changes: Partial<VendorProfile>) => void;
};

const VendorStateContext = createContext<VendorState | null>(null);

const initialState: PersistedVendorState = { profile: SAMPLE_PROFILE, readCommentIds: [] };

export function VendorStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<PersistedVendorState>;
        setState({
          profile: { ...SAMPLE_PROFILE, ...saved.profile },
          readCommentIds: Array.isArray(saved.readCommentIds) ? saved.readCommentIds : [],
        });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const value = useMemo<VendorState>(() => {
    const read = new Set(state.readCommentIds);
    return {
      ...state,
      orders: SAMPLE_ORDERS,
      payments: SAMPLE_PAYMENTS,
      comments: SAMPLE_COMMENTS,
      isCommentRead: (id) => read.has(id),
      markCommentRead: (id) =>
        setState((s) => (s.readCommentIds.includes(id) ? s : { ...s, readCommentIds: [...s.readCommentIds, id] })),
      updateProfile: (changes) => setState((s) => ({ ...s, profile: { ...s.profile, ...changes } })),
    };
  }, [state]);

  // Wait for saved read-state so already-closed comments never flash as unclosed.
  if (!ready) return null;

  return <VendorStateContext.Provider value={value}>{children}</VendorStateContext.Provider>;
}

export function useVendorState() {
  const ctx = useContext(VendorStateContext);
  if (!ctx) throw new Error('useVendorState must be used inside VendorStateProvider');
  return ctx;
}
