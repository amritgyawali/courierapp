import { createContext, type ReactNode, useContext, useMemo } from 'react';

import { LEGACY_NAMES } from '@/constants/identity';
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
import { isRecord, nonEmptyOr, stringOr, usePersistedState } from '@/state/persist';
import { generateVendorId } from '@/utils/id';

const STORAGE_KEY = 'ksg-vendor-state-v1';

/** What the vendor changes on the device: profile edits and which comments were marked read. */
type PersistedVendorState = { profile: VendorProfile; readCommentIds: string[] };

type VendorState = PersistedVendorState & {
  orders: VendorOrder[];
  payments: VendorPayment[];
  comments: VendorComment[];
  isCommentRead: (id: string) => boolean;
  markCommentRead: (id: string) => void;
  updateProfile: (changes: Partial<Omit<VendorProfile, 'vendorId'>>) => void;
};

const VendorStateContext = createContext<VendorState | null>(null);

const freshState = (): PersistedVendorState => ({
  profile: { ...SAMPLE_PROFILE, vendorId: generateVendorId() },
  readCommentIds: [],
});

/**
 * Restores saved vendor data. Installs from earlier builds are migrated: the old sample shop
 * name becomes the current demo name and the shared sample ID `16500` gets a random ID.
 */
function hydrate(saved: unknown): PersistedVendorState {
  if (!isRecord(saved)) return freshState();
  const p = isRecord(saved.profile) ? saved.profile : {};
  const savedId = stringOr(p.vendorId, '');
  const savedName = nonEmptyOr(p.businessName, SAMPLE_PROFILE.businessName);
  return {
    profile: {
      businessName: savedName === LEGACY_NAMES.vendorBusiness ? SAMPLE_PROFILE.businessName : savedName,
      ownerName: nonEmptyOr(p.ownerName, SAMPLE_PROFILE.ownerName),
      vendorId: /^\d{5,8}$/.test(savedId) && savedId !== LEGACY_NAMES.vendorId ? savedId : generateVendorId(),
      phone: nonEmptyOr(p.phone, SAMPLE_PROFILE.phone),
      address: stringOr(p.address, SAMPLE_PROFILE.address),
    },
    readCommentIds: Array.isArray(saved.readCommentIds)
      ? saved.readCommentIds.filter((id): id is string => typeof id === 'string')
      : [],
  };
}

export function VendorStateProvider({ children }: { children: ReactNode }) {
  const [state, setState, ready] = usePersistedState(STORAGE_KEY, freshState, { hydrate });

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
  }, [state, setState]);

  // Wait for saved read-state so already-closed comments never flash as unclosed.
  if (!ready) return null;

  return <VendorStateContext.Provider value={value}>{children}</VendorStateContext.Provider>;
}

export function useVendorState() {
  const ctx = useContext(VendorStateContext);
  if (!ctx) throw new Error('useVendorState must be used inside VendorStateProvider');
  return ctx;
}
