import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useReducer, useState } from 'react';

import {
  type Announcement,
  createSampleOps,
  type Duty,
  type KycStatus,
  type OpsData,
  type OpsSettings,
  type PaymentMethod,
  type RateCard,
  type Shipment,
  type ShipmentStatus,
  type Staff,
  type TicketStatus,
} from '@/data/ops';

const STORAGE_KEY = 'ksg-ops-data-v1';

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** `silent` skips the audit log (routine rider actions). */
type Actor = { actor: string; silent?: boolean };

export type OpsAction =
  | { type: 'load'; data: OpsData }
  | ({ type: 'assign'; ids: string[]; riderId: string } & Actor)
  | ({ type: 'setStatus'; id: string; status: ShipmentStatus; note?: string } & Actor)
  | ({
      type: 'deliver';
      id: string;
      riderId: string;
      receivedBy: string;
      otpVerified: boolean;
      collected: number;
      method: PaymentMethod;
      note?: string;
    } & Actor)
  | ({ type: 'fail'; id: string; reason: string; rescheduledFor?: string } & Actor)
  | ({ type: 'reattempt'; id: string } & Actor)
  | ({ type: 'returnToMerchant'; id: string } & Actor)
  | ({ type: 'riderDuty'; riderId: string; duty: Duty } & Actor)
  | ({ type: 'riderKyc'; riderId: string; kyc: KycStatus } & Actor)
  | ({ type: 'riderActive'; riderId: string; active: boolean } & Actor)
  | ({ type: 'merchantKyc'; merchantId: string; kyc: KycStatus } & Actor)
  | ({ type: 'merchantActive'; merchantId: string; active: boolean } & Actor)
  | ({ type: 'deposit'; riderId: string; amount: number; reference: string } & Actor)
  | ({ type: 'reviewDeposit'; id: string; approve: boolean } & Actor)
  | ({ type: 'payout'; id: string; reference: string } & Actor)
  | ({ type: 'ticket'; id: string; status: TicketStatus; assignee?: string } & Actor)
  | ({ type: 'announce'; title: string; body: string; audience: Announcement['audience'] } & Actor)
  | ({ type: 'rateCard'; rateCard: RateCard } & Actor)
  | ({ type: 'settings'; settings: OpsSettings } & Actor)
  | ({ type: 'inviteStaff'; staff: Omit<Staff, 'id' | 'lastActiveAt' | 'active'> } & Actor)
  | ({ type: 'staffActive'; id: string; active: boolean } & Actor);

const nowIso = () => new Date().toISOString();

let idCounter = Date.now() % 100000;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

function audit(data: OpsData, actor: string, action: string, target: string): OpsData {
  return { ...data, audit: [{ id: nextId('AU'), at: nowIso(), actor, action, target }, ...data.audit].slice(0, 300) };
}

function patchShipment(data: OpsData, id: string, fn: (s: Shipment) => Shipment): OpsData {
  return { ...data, shipments: data.shipments.map((s) => (s.id === id ? fn(s) : s)) };
}

function withEvent(s: Shipment, status: ShipmentStatus, actor: string, note?: string, extra: Partial<Shipment> = {}): Shipment {
  const at = nowIso();
  return { ...s, ...extra, status, updatedAt: at, events: [...s.events, { status, at, actor, note }] };
}

/** Rider hands-off: these statuses release the parcel from its rider. */
const RELEASES_RIDER: ShipmentStatus[] = ['at-hub', 'delivered', 'failed', 'returned', 'cancelled', 'pickup-requested'];

function reducer(data: OpsData, action: OpsAction): OpsData {
  switch (action.type) {
    case 'load':
      return action.data;

    case 'assign': {
      const rider = data.riders.find((r) => r.id === action.riderId);
      if (!rider) return data;
      let next = data;
      for (const id of action.ids) {
        next = patchShipment(next, id, (s) => {
          const status: ShipmentStatus =
            s.status === 'pickup-requested' || s.status === 'pickup-assigned'
              ? 'pickup-assigned'
              : s.status === 'returning'
                ? 'returning'
                : s.status === 'picked-up'
                  ? 'picked-up'
                  : 'out-for-delivery';
          return withEvent(s, status, action.actor, `Assigned to ${rider.name}`, { riderId: rider.id });
        });
      }
      return audit(next, action.actor, `Assigned ${action.ids.length} parcel${action.ids.length === 1 ? '' : 's'}`, rider.name);
    }

    case 'setStatus': {
      const next = patchShipment(data, action.id, (s) =>
        withEvent(s, action.status, action.actor, action.note, RELEASES_RIDER.includes(action.status) ? { riderId: undefined } : {}),
      );
      return action.silent ? next : audit(next, action.actor, `Set status to ${action.status}`, action.id);
    }

    case 'deliver':
      return patchShipment(data, action.id, (s) =>
        withEvent(s, 'delivered', action.actor, action.note, {
          riderId: undefined,
          attempts: s.attempts + 1,
          pod: {
            receivedBy: action.receivedBy,
            otpVerified: action.otpVerified,
            collected: action.collected,
            method: action.method,
            at: nowIso(),
            riderId: action.riderId,
            note: action.note,
          },
        }),
      );

    case 'fail':
      return patchShipment(data, action.id, (s) =>
        withEvent(s, 'failed', action.actor, action.reason, {
          riderId: undefined,
          attempts: s.attempts + 1,
          failReason: action.reason,
          rescheduledFor: action.rescheduledFor,
        }),
      );

    case 'reattempt':
      return audit(
        patchShipment(data, action.id, (s) => withEvent(s, 'at-hub', action.actor, 'Queued for another delivery attempt', { riderId: undefined })),
        action.actor,
        'Queued re-attempt',
        action.id,
      );

    case 'returnToMerchant':
      return audit(
        patchShipment(data, action.id, (s) => withEvent(s, 'returning', action.actor, 'Return to merchant initiated', { riderId: undefined })),
        action.actor,
        'Initiated return to merchant',
        action.id,
      );

    case 'riderDuty':
      return {
        ...data,
        riders: data.riders.map((r) =>
          r.id === action.riderId
            ? {
                ...r,
                duty: action.duty,
                shiftStartedAt: action.duty === 'offline' ? undefined : r.duty === 'offline' ? nowIso() : r.shiftStartedAt,
              }
            : r,
        ),
      };

    case 'riderKyc': {
      const rider = data.riders.find((r) => r.id === action.riderId);
      const next = {
        ...data,
        riders: data.riders.map((r) =>
          r.id === action.riderId ? { ...r, kyc: action.kyc, documents: r.documents.map((d) => ({ ...d, status: action.kyc })) } : r,
        ),
      };
      return audit(next, action.actor, action.kyc === 'verified' ? 'Approved rider KYC' : 'Rejected rider KYC', rider?.name ?? action.riderId);
    }

    case 'riderActive': {
      const rider = data.riders.find((r) => r.id === action.riderId);
      const next = {
        ...data,
        riders: data.riders.map((r) => (r.id === action.riderId ? { ...r, active: action.active, duty: action.active ? r.duty : ('offline' as Duty) } : r)),
      };
      return audit(next, action.actor, action.active ? 'Reactivated rider' : 'Suspended rider', rider?.name ?? action.riderId);
    }

    case 'merchantKyc': {
      const m = data.merchants.find((x) => x.id === action.merchantId);
      const next = { ...data, merchants: data.merchants.map((x) => (x.id === action.merchantId ? { ...x, kyc: action.kyc } : x)) };
      return audit(next, action.actor, action.kyc === 'verified' ? 'Approved merchant KYC' : 'Rejected merchant KYC', m?.name ?? action.merchantId);
    }

    case 'merchantActive': {
      const m = data.merchants.find((x) => x.id === action.merchantId);
      const next = { ...data, merchants: data.merchants.map((x) => (x.id === action.merchantId ? { ...x, active: action.active } : x)) };
      return audit(next, action.actor, action.active ? 'Activated merchant' : 'Suspended merchant', m?.name ?? action.merchantId);
    }

    case 'deposit':
      return {
        ...data,
        deposits: [
          { id: nextId('DP'), riderId: action.riderId, amount: action.amount, at: nowIso(), reference: action.reference, status: 'pending' },
          ...data.deposits,
        ],
      };

    case 'reviewDeposit': {
      const next = {
        ...data,
        deposits: data.deposits.map((d) =>
          d.id === action.id ? { ...d, status: action.approve ? ('verified' as const) : ('rejected' as const), reviewedAt: nowIso() } : d,
        ),
      };
      return audit(next, action.actor, action.approve ? 'Verified COD deposit' : 'Rejected COD deposit', action.id);
    }

    case 'payout': {
      const next = {
        ...data,
        payouts: data.payouts.map((p) =>
          p.id === action.id ? { ...p, status: 'paid' as const, paidAt: nowIso(), reference: action.reference } : p,
        ),
      };
      return audit(next, action.actor, 'Marked payout as paid', action.id);
    }

    case 'ticket': {
      const next = {
        ...data,
        tickets: data.tickets.map((t) =>
          t.id === action.id ? { ...t, status: action.status, assignee: action.assignee ?? t.assignee, updatedAt: nowIso() } : t,
        ),
      };
      return audit(next, action.actor, `Ticket ${action.status}`, action.id);
    }

    case 'announce': {
      const next = {
        ...data,
        announcements: [
          { id: nextId('AN'), title: action.title, body: action.body, audience: action.audience, at: nowIso(), author: action.actor },
          ...data.announcements,
        ],
      };
      return audit(next, action.actor, 'Published announcement', action.title);
    }

    case 'rateCard':
      return audit({ ...data, rateCard: action.rateCard }, action.actor, 'Updated rate card', 'All zones');

    case 'settings':
      return audit({ ...data, settings: action.settings }, action.actor, 'Updated settings', 'Operations');

    case 'inviteStaff': {
      const next = {
        ...data,
        staff: [...data.staff, { ...action.staff, id: nextId('ST'), active: true, lastActiveAt: nowIso() }],
      };
      return audit(next, action.actor, 'Invited staff member', action.staff.email);
    }

    case 'staffActive': {
      const member = data.staff.find((s) => s.id === action.id);
      const next = { ...data, staff: data.staff.map((s) => (s.id === action.id ? { ...s, active: action.active } : s)) };
      return audit(next, action.actor, action.active ? 'Reactivated staff' : 'Deactivated staff', member?.name ?? action.id);
    }
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

type OpsContextValue = {
  ready: boolean;
  data: OpsData;
  dispatch: (action: OpsAction) => void;
  /** Rebuild the sample network (Settings → Reset demo data). */
  reset: () => void;
};

const OpsContext = createContext<OpsContextValue | null>(null);

/** Shared operations data for the Admin and Rider portals, persisted on the device. */
export function OpsStateProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, () => createSampleOps());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const saved = raw ? (JSON.parse(raw) as OpsData) : null;
        if (saved?.version === 1 && Array.isArray(saved.shipments)) dispatch({ type: 'load', data: saved });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const handle = setTimeout(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {}), 300);
    return () => clearTimeout(handle);
  }, [data, ready]);

  const value = useMemo<OpsContextValue>(
    () => ({ ready, data, dispatch, reset: () => dispatch({ type: 'load', data: createSampleOps() }) }),
    [ready, data],
  );

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>;
}

export function useOps() {
  const ctx = useContext(OpsContext);
  if (!ctx) throw new Error('useOps must be used inside OpsStateProvider');
  return ctx;
}
