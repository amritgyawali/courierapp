/**
 * Courier operations domain shared by the Admin and Rider portals.
 *
 * `createSampleOps()` builds a realistic, internally consistent network (hubs, merchants, riders,
 * ~170 shipments over the last two weeks with full event timelines, COD deposits, payouts,
 * tickets…) relative to "now", so every dashboard looks live. Replace it with the KSG operations
 * API; screens only depend on the types and the pure selectors in this file.
 */
import { DEMO_ADMIN_EMAIL, DEMO_PERSON_NAME, DEMO_VENDOR_BUSINESS_NAME, LEGACY_NAMES } from '@/constants/identity';
import { startOfDay } from '@/utils/format';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ShipmentStatus =
  | 'pickup-requested'
  | 'pickup-assigned'
  | 'picked-up'
  | 'at-hub'
  | 'out-for-delivery'
  | 'delivered'
  | 'failed'
  | 'returning'
  | 'returned'
  | 'cancelled';

export type ZoneId = 'valley' | 'city' | 'outside' | 'remote';
export type KycStatus = 'verified' | 'pending' | 'rejected';
export type Duty = 'online' | 'break' | 'offline';
export type PaymentMethod = 'cash' | 'online';

export type Hub = {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  manager: string;
  phone: string;
  /** Parcels the hub can process per day. */
  capacity: number;
  zone: ZoneId;
  localities: string[];
};

export type Merchant = {
  id: string;
  name: string;
  owner: string;
  phone: string;
  email: string;
  hubId: string;
  pickupAddress: string;
  kyc: KycStatus;
  active: boolean;
  joinedAt: string;
};

export type RiderDocument = { name: string; status: KycStatus; expires?: string };

export type Rider = {
  id: string;
  name: string;
  phone: string;
  email: string;
  hubId: string;
  vehicle: { type: 'Bike' | 'Scooter' | 'Van'; plate: string };
  duty: Duty;
  shiftStartedAt?: string;
  kyc: KycStatus;
  active: boolean;
  rating: number;
  joinedAt: string;
  latitude: number;
  longitude: number;
  documents: RiderDocument[];
};

export type ShipmentEvent = { status: ShipmentStatus; at: string; actor: string; note?: string };

export type ProofOfDelivery = {
  receivedBy: string;
  otpVerified: boolean;
  collected: number;
  method: PaymentMethod;
  at: string;
  riderId: string;
  note?: string;
};

export type Shipment = {
  id: string;
  merchantId: string;
  receiver: { name: string; phone: string; address: string; district: string };
  hubId: string;
  zone: ZoneId;
  latitude: number;
  longitude: number;
  item: string;
  weightKg: number;
  fragile: boolean;
  /** Cash on delivery to collect from the receiver. */
  cod: number;
  /** Delivery charge billed to the merchant. */
  charge: number;
  status: ShipmentStatus;
  /** Rider currently responsible for the parcel (pickup, delivery or return). */
  riderId?: string;
  attempts: number;
  failReason?: string;
  rescheduledFor?: string;
  createdAt: string;
  updatedAt: string;
  promisedBy: string;
  /** One-time code the receiver shares to confirm delivery. */
  otp: string;
  pod?: ProofOfDelivery;
  events: ShipmentEvent[];
};

export type CashDeposit = {
  id: string;
  riderId: string;
  amount: number;
  at: string;
  reference: string;
  status: 'pending' | 'verified' | 'rejected';
  reviewedAt?: string;
};

export type Payout = {
  id: string;
  merchantId: string;
  amount: number;
  shipments: number;
  periodEnd: string;
  status: 'pending' | 'paid';
  paidAt?: string;
  reference?: string;
};

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in-progress' | 'resolved';

export type Ticket = {
  id: string;
  subject: string;
  body: string;
  channel: 'merchant' | 'customer' | 'rider';
  requester: string;
  shipmentId?: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
};

export type Audience = 'all' | 'riders' | 'merchants';

export type Announcement = { id: string; title: string; body: string; audience: Audience; at: string; author: string };

export type StaffRole = 'super-admin' | 'ops-manager' | 'dispatcher' | 'finance' | 'support';

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  hubId?: string;
  active: boolean;
  lastActiveAt: string;
};

export type AuditEntry = { id: string; at: string; actor: string; action: string; target: string };

export type RateZone = { id: ZoneId; label: string; firstKg: number; perExtraKg: number; slaHours: number };

export type RateCard = { zones: RateZone[]; codFeePercent: number; fragileSurcharge: number };

export type OpsSettings = {
  autoAssign: boolean;
  otpRequired: boolean;
  /** Cash a rider may hold before they must deposit at the hub. */
  riderCashLimit: number;
  maxAttempts: number;
  workingHours: string;
};

/** Bump when the stored shape changes, and teach `migrateOpsData` the upgrade. */
export const OPS_DATA_VERSION = 2;

export type OpsData = {
  version: typeof OPS_DATA_VERSION;
  generatedAt: string;
  hubs: Hub[];
  merchants: Merchant[];
  riders: Rider[];
  shipments: Shipment[];
  deposits: CashDeposit[];
  payouts: Payout[];
  tickets: Ticket[];
  announcements: Announcement[];
  staff: Staff[];
  audit: AuditEntry[];
  rateCard: RateCard;
  settings: OpsSettings;
};

// ---------------------------------------------------------------------------
// Labels & presentation metadata
// ---------------------------------------------------------------------------

export const STATUS_META: Record<ShipmentStatus, { label: string; bg: string; color: string }> = {
  'pickup-requested': { label: 'Pickup Requested', bg: '#F1F5F9', color: '#475569' },
  'pickup-assigned': { label: 'Pickup Assigned', bg: '#EEF2FF', color: '#4F46E5' },
  'picked-up': { label: 'Picked Up', bg: '#E0F2FE', color: '#0369A1' },
  'at-hub': { label: 'At Hub', bg: '#F3E8FF', color: '#7E22CE' },
  'out-for-delivery': { label: 'Out for Delivery', bg: '#E9F2FE', color: '#2B6CB0' },
  delivered: { label: 'Delivered', bg: '#EAF8F0', color: '#23A26D' },
  failed: { label: 'Delivery Failed', bg: '#FDECEF', color: '#C0143C' },
  returning: { label: 'Returning', bg: '#FEF3C7', color: '#B45309' },
  returned: { label: 'Returned', bg: '#FFEDD5', color: '#C2410C' },
  cancelled: { label: 'Cancelled', bg: '#F3F4F6', color: '#6B7280' },
};

export const ALL_STATUSES = Object.keys(STATUS_META) as ShipmentStatus[];

/** Statuses after which nothing else happens to a parcel. */
export const CLOSED_STATUSES: ShipmentStatus[] = ['delivered', 'returned', 'cancelled'];

export const FAIL_REASONS = [
  'Receiver not reachable',
  'Receiver refused the parcel',
  'Wrong or incomplete address',
  'Receiver asked to reschedule',
  'Cash not ready for COD',
  'Premises closed',
];

export const KYC_META: Record<KycStatus, { label: string; bg: string; color: string }> = {
  verified: { label: 'Verified', bg: '#DCFCE7', color: '#15803D' },
  pending: { label: 'KYC Pending', bg: '#FEF3C7', color: '#B45309' },
  rejected: { label: 'Rejected', bg: '#FEE2E2', color: '#B91C1C' },
};

export const DUTY_META: Record<Duty, { label: string; color: string }> = {
  online: { label: 'Online', color: '#16A34A' },
  break: { label: 'On break', color: '#F59E0B' },
  offline: { label: 'Offline', color: '#9CA3AF' },
};

export const PRIORITY_META: Record<TicketPriority, { label: string; bg: string; color: string; rank: number }> = {
  urgent: { label: 'Urgent', bg: '#FEE2E2', color: '#B91C1C', rank: 0 },
  high: { label: 'High', bg: '#FFEDD5', color: '#C2410C', rank: 1 },
  medium: { label: 'Medium', bg: '#FEF3C7', color: '#B45309', rank: 2 },
  low: { label: 'Low', bg: '#F1F5F9', color: '#475569', rank: 3 },
};

export const TICKET_STATUS_META: Record<TicketStatus, { label: string; bg: string; color: string }> = {
  open: { label: 'Open', bg: '#FDECEF', color: '#C0143C' },
  'in-progress': { label: 'In Progress', bg: '#E9F2FE', color: '#2B6CB0' },
  resolved: { label: 'Resolved', bg: '#DCFCE7', color: '#15803D' },
};

export const ROLE_META: Record<StaffRole, { label: string; permissions: string[] }> = {
  'super-admin': {
    label: 'Super Admin',
    permissions: ['Shipments', 'Dispatch', 'Riders', 'Merchants', 'Finance', 'Rate card', 'Staff', 'Settings'],
  },
  'ops-manager': { label: 'Operations Manager', permissions: ['Shipments', 'Dispatch', 'Riders', 'Merchants', 'Tickets'] },
  dispatcher: { label: 'Dispatcher', permissions: ['Shipments', 'Dispatch', 'Riders'] },
  finance: { label: 'Finance', permissions: ['Finance', 'Payouts', 'COD deposits', 'Reports'] },
  support: { label: 'Support Agent', permissions: ['Tickets', 'Shipments (view)', 'Announcements'] },
};

export const ALL_PERMISSIONS = [
  'Shipments',
  'Dispatch',
  'Riders',
  'Merchants',
  'Tickets',
  'Finance',
  'Payouts',
  'COD deposits',
  'Rate card',
  'Reports',
  'Announcements',
  'Staff',
  'Settings',
];

/** What a rider is paid per completed task. */
export const RIDER_PAY = { delivery: 60, pickup: 25, return: 40, dailyTarget: 15, targetBonus: 300 };

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export const DEFAULT_RATE_CARD: RateCard = {
  zones: [
    { id: 'valley', label: 'Inside Valley', firstKg: 100, perExtraKg: 20, slaHours: 24 },
    { id: 'city', label: 'Major Cities', firstKg: 150, perExtraKg: 30, slaHours: 48 },
    { id: 'outside', label: 'Outside Valley', firstKg: 180, perExtraKg: 40, slaHours: 72 },
    { id: 'remote', label: 'Remote Areas', firstKg: 250, perExtraKg: 60, slaHours: 120 },
  ],
  codFeePercent: 1,
  fragileSurcharge: 50,
};

export type Quote = { base: number; weightCharge: number; codFee: number; fragile: number; total: number; slaHours: number };

/** Delivery charge for a parcel under a rate card. Weight is rounded up to the next half kilo. */
export function quote(card: RateCard, zone: ZoneId, weightKg: number, cod: number, fragile: boolean): Quote {
  const z = card.zones.find((x) => x.id === zone) ?? card.zones[0];
  const billable = Math.max(0.5, Math.ceil(weightKg * 2) / 2);
  const weightCharge = Math.ceil(Math.max(0, billable - 1) * z.perExtraKg);
  const codFee = Math.round((cod * card.codFeePercent) / 100);
  const fragileFee = fragile ? card.fragileSurcharge : 0;
  return {
    base: z.firstKg,
    weightCharge,
    codFee,
    fragile: fragileFee,
    total: z.firstKg + weightCharge + codFee + fragileFee,
    slaHours: z.slaHours,
  };
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

const DAY = 24 * 60 * 60 * 1000;

/** Rounded percentage; 0 when there is nothing to divide by. */
const percentOf = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

const onDay = (iso: string | undefined, day: Date) =>
  !!iso && startOfDay(new Date(iso)).getTime() === startOfDay(day).getTime();

export const isClosed = (s: Shipment) => CLOSED_STATUSES.includes(s.status);

export const isOverdue = (s: Shipment, now = new Date()) =>
  !isClosed(s) && s.status !== 'returning' && new Date(s.promisedBy).getTime() < now.getTime();

/**
 * Hub whose riders handle the parcel's current leg: pickups and returns happen at the merchant's
 * hub, everything else at the destination hub.
 */
export function operatingHubId(data: Pick<OpsData, 'merchants'>, s: Shipment) {
  const merchantLeg = s.status === 'pickup-requested' || s.status === 'pickup-assigned' || s.status === 'returning' || s.status === 'returned';
  return merchantLeg ? (data.merchants.find((m) => m.id === s.merchantId)?.hubId ?? s.hubId) : s.hubId;
}

/** Parcels waiting for a rider: pickups to collect, parcels at a hub, returns to send back. */
export const needsRider = (s: Shipment) =>
  !s.riderId && (s.status === 'pickup-requested' || s.status === 'at-hub' || s.status === 'returning');

export function deliveredOn(data: OpsData, day: Date) {
  return data.shipments.filter((s) => s.status === 'delivered' && onDay(s.pod?.at, day));
}

/** Headline numbers for the admin dashboard. */
export function todaySummary(data: OpsData, now = new Date()) {
  const s = data.shipments;
  const deliveredToday = deliveredOn(data, now);
  const failedToday = s.filter((x) => x.events.some((e) => e.status === 'failed' && onDay(e.at, now)));
  const attempts = deliveredToday.length + failedToday.length;
  return {
    booked: s.filter((x) => onDay(x.createdAt, now)).length,
    delivered: deliveredToday.length,
    outForDelivery: s.filter((x) => x.status === 'out-for-delivery').length,
    pickupsPending: s.filter((x) => x.status === 'pickup-requested' || x.status === 'pickup-assigned').length,
    atHub: s.filter((x) => x.status === 'at-hub').length,
    failed: s.filter((x) => x.status === 'failed').length,
    returns: s.filter((x) => x.status === 'returning').length,
    unassigned: s.filter(needsRider).length,
    overdue: s.filter((x) => isOverdue(x, now)).length,
    successRate: attempts ? Math.round((deliveredToday.length / attempts) * 100) : 0,
    chargesToday: deliveredToday.reduce((sum, x) => sum + x.charge, 0),
    codToday: deliveredToday.reduce((sum, x) => sum + (x.pod?.collected ?? 0), 0),
  };
}

/** Delivery success rate (delivered ÷ delivery attempts) over the last `days` days. */
export function successRate(data: OpsData, days: number, now = new Date()) {
  const from = startOfDay(new Date(now.getTime() - (days - 1) * DAY)).getTime();
  let delivered = 0;
  let failed = 0;
  for (const s of data.shipments) {
    for (const e of s.events) {
      if (new Date(e.at).getTime() < from) continue;
      if (e.status === 'delivered') delivered++;
      if (e.status === 'failed') failed++;
    }
  }
  return { delivered, failed, rate: delivered + failed ? Math.round((delivered / (delivered + failed)) * 100) : 0 };
}

/** Booked and delivered counts per day, oldest first. */
export function dailyVolume(data: OpsData, days: number, now = new Date()) {
  return Array.from({ length: days }, (_, i) => {
    const day = startOfDay(new Date(now.getTime() - (days - 1 - i) * DAY));
    return {
      day,
      booked: data.shipments.filter((s) => onDay(s.createdAt, day)).length,
      delivered: deliveredOn(data, day).length,
    };
  });
}

export function statusBreakdown(shipments: Shipment[]) {
  return ALL_STATUSES.map((status) => ({ status, count: shipments.filter((s) => s.status === status).length })).filter(
    (x) => x.count > 0,
  );
}

export function shipmentsBetween(data: OpsData, from: Date, to: Date) {
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime() + DAY;
  return data.shipments.filter((s) => {
    const t = new Date(s.createdAt).getTime();
    return t >= a && t < b;
  });
}

export type RiderTaskKind = 'pickup' | 'drop' | 'delivery' | 'return';

/** What the rider has to do next with a parcel they hold. */
export function taskKind(s: Shipment): RiderTaskKind | null {
  switch (s.status) {
    case 'pickup-assigned':
      return 'pickup';
    case 'picked-up':
      return 'drop';
    case 'out-for-delivery':
      return 'delivery';
    case 'returning':
      return s.riderId ? 'return' : null;
    default:
      return null;
  }
}

export const TASK_META: Record<RiderTaskKind, { label: string; bg: string; color: string; verb: string }> = {
  pickup: { label: 'Pickup', bg: '#EEF2FF', color: '#4F46E5', verb: 'Collect from merchant' },
  drop: { label: 'Hub drop', bg: '#F3E8FF', color: '#7E22CE', verb: 'Hand over at hub' },
  delivery: { label: 'Delivery', bg: '#E9F2FE', color: '#2B6CB0', verb: 'Deliver to receiver' },
  return: { label: 'Return', bg: '#FEF3C7', color: '#B45309', verb: 'Return to merchant' },
};

export function riderTasks(data: OpsData, riderId: string) {
  return data.shipments.filter((s) => s.riderId === riderId && taskKind(s) !== null);
}

/** Every event this rider produced (used for history and earnings). */
function riderEvents(data: OpsData, riderId: string, name: string) {
  const out: { shipment: Shipment; event: ShipmentEvent }[] = [];
  for (const s of data.shipments) {
    for (const e of s.events) if (e.actor === name) out.push({ shipment: s, event: e });
    if (s.pod?.riderId === riderId && !s.events.some((e) => e.actor === name && e.status === 'delivered')) {
      const e = s.events.find((x) => x.status === 'delivered');
      if (e) out.push({ shipment: s, event: e });
    }
  }
  return out;
}

export function riderStats(data: OpsData, riderId: string, now = new Date()) {
  const rider = data.riders.find((r) => r.id === riderId);
  const delivered = data.shipments.filter((s) => s.status === 'delivered' && s.pod?.riderId === riderId);
  const deliveredToday = delivered.filter((s) => onDay(s.pod?.at, now));
  const events = rider ? riderEvents(data, riderId, rider.name) : [];
  const failedEvents = events.filter((x) => x.event.status === 'failed');
  const failedToday = failedEvents.filter((x) => onDay(x.event.at, now));
  const cashCollected = delivered.filter((s) => s.pod?.method === 'cash').reduce((sum, s) => sum + (s.pod?.collected ?? 0), 0);
  const deposits = data.deposits.filter((d) => d.riderId === riderId);
  const verified = deposits.filter((d) => d.status === 'verified').reduce((sum, d) => sum + d.amount, 0);
  const pending = deposits.filter((d) => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);
  const tasks = riderTasks(data, riderId);
  const onTime = delivered.filter((s) => s.pod && new Date(s.pod.at) <= new Date(s.promisedBy)).length;
  return {
    tasks,
    active: tasks.length,
    deliveredToday: deliveredToday.length,
    failedToday: failedToday.length,
    deliveredTotal: delivered.length,
    successRate: delivered.length + failedEvents.length
      ? Math.round((delivered.length / (delivered.length + failedEvents.length)) * 100)
      : 0,
    onTimeRate: delivered.length ? Math.round((onTime / delivered.length) * 100) : 0,
    codToCollect: tasks.filter((s) => s.status === 'out-for-delivery').reduce((sum, s) => sum + s.cod, 0),
    codCollectedToday: deliveredToday.reduce((sum, s) => sum + (s.pod?.collected ?? 0), 0),
    /** Cash still physically with the rider. */
    cashInHand: cashCollected - verified - pending,
    /** Cash handed to the hub but not yet verified by finance. */
    pendingDeposit: pending,
    /** Liability shown to admins: collected and not yet verified. */
    codHeld: cashCollected - verified,
  };
}

/** Earnings for completed work between two dates (inclusive days). */
export function riderEarnings(data: OpsData, riderId: string, from: Date, to: Date) {
  const rider = data.riders.find((r) => r.id === riderId);
  if (!rider) return { deliveries: 0, pickups: 0, returns: 0, bonus: 0, total: 0, days: [] as { day: Date; total: number }[] };
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime() + DAY;
  const inRange = (iso: string) => {
    const t = new Date(iso).getTime();
    return t >= a && t < b;
  };
  const deliveries = data.shipments.filter((s) => s.pod?.riderId === riderId && s.pod && inRange(s.pod.at));
  const events = riderEvents(data, riderId, rider.name).filter((x) => inRange(x.event.at));
  const pickups = events.filter((x) => x.event.status === 'picked-up').length;
  const returns = events.filter((x) => x.event.status === 'returned').length;

  const perDay = new Map<number, number>();
  for (const s of deliveries) {
    const k = startOfDay(new Date(s.pod!.at)).getTime();
    perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }
  const bonusDays = [...perDay.values()].filter((n) => n >= RIDER_PAY.dailyTarget).length;
  const bonus = bonusDays * RIDER_PAY.targetBonus;

  const days = [...perDay.entries()]
    .sort((x, y) => y[0] - x[0])
    .map(([t, n]) => ({ day: new Date(t), total: n * RIDER_PAY.delivery + (n >= RIDER_PAY.dailyTarget ? RIDER_PAY.targetBonus : 0) }));

  const total = deliveries.length * RIDER_PAY.delivery + pickups * RIDER_PAY.pickup + returns * RIDER_PAY.return + bonus;
  return { deliveries: deliveries.length, pickups, returns, bonus, total, days };
}

export function merchantStats(data: OpsData, merchantId: string) {
  const all = data.shipments.filter((s) => s.merchantId === merchantId);
  const delivered = all.filter((s) => s.status === 'delivered');
  const codDelivered = delivered.reduce((sum, s) => sum + (s.pod?.collected ?? 0), 0);
  const charges = all.filter((s) => s.status === 'delivered' || s.status === 'returned').reduce((sum, s) => sum + s.charge, 0);
  const paid = data.payouts.filter((p) => p.merchantId === merchantId && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayouts = data.payouts.filter((p) => p.merchantId === merchantId && p.status === 'pending');
  return {
    total: all.length,
    active: all.filter((s) => !isClosed(s)).length,
    delivered: delivered.length,
    returned: all.filter((s) => s.status === 'returned' || s.status === 'returning').length,
    successRate: percentOf(delivered.length, all.filter((s) => s.status !== 'cancelled').length),
    codDelivered,
    charges,
    paid,
    pendingPayout: pendingPayouts.reduce((sum, p) => sum + p.amount, 0),
    balance: codDelivered - charges - paid,
  };
}

export function hubStats(data: OpsData, hubId: string, now = new Date()) {
  const hubShipments = data.shipments.filter((s) => s.hubId === hubId);
  const today = hubShipments.filter((s) => onDay(s.createdAt, now)).length;
  const riders = data.riders.filter((r) => r.hubId === hubId && r.active);
  const delivered = hubShipments.filter((s) => s.status === 'delivered').length;
  const failed = hubShipments.filter((s) => s.events.some((e) => e.status === 'failed')).length;
  const hub = data.hubs.find((h) => h.id === hubId);
  return {
    today,
    backlog: hubShipments.filter((s) => s.status === 'at-hub').length,
    outForDelivery: hubShipments.filter((s) => s.status === 'out-for-delivery').length,
    ridersOnline: riders.filter((r) => r.duty === 'online').length,
    riders: riders.length,
    successRate: delivered + failed ? Math.round((delivered / (delivered + failed)) * 100) : 0,
    load: hub ? Math.min(100, Math.round((today / hub.capacity) * 100)) : 0,
  };
}

/** Finance totals across the network. */
export function financeSummary(data: OpsData, now = new Date()) {
  const delivered = data.shipments.filter((s) => s.status === 'delivered');
  const codCollected = delivered.reduce((sum, s) => sum + (s.pod?.collected ?? 0), 0);
  const revenue = data.shipments
    .filter((s) => s.status === 'delivered' || s.status === 'returned')
    .reduce((sum, s) => sum + s.charge, 0);
  const codWithRiders = data.riders.reduce((sum, r) => sum + riderStats(data, r.id, now).codHeld, 0);
  const pendingDeposits = data.deposits.filter((d) => d.status === 'pending');
  const pendingPayouts = data.payouts.filter((p) => p.status === 'pending');
  return {
    revenue,
    codCollected,
    codWithRiders,
    depositsToVerify: pendingDeposits.length,
    depositsToVerifyAmount: pendingDeposits.reduce((sum, d) => sum + d.amount, 0),
    payoutsPending: pendingPayouts.length,
    payoutsPendingAmount: pendingPayouts.reduce((sum, p) => sum + p.amount, 0),
    paidOut: data.payouts.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
  };
}

/** Items that need an admin decision. */
export function approvals(data: OpsData) {
  return {
    riders: data.riders.filter((r) => r.kyc === 'pending').length,
    merchants: data.merchants.filter((m) => m.kyc === 'pending').length,
    deposits: data.deposits.filter((d) => d.status === 'pending').length,
    tickets: data.tickets.filter((t) => t.status !== 'resolved').length,
  };
}

/** Online, active riders of a hub ordered by how many tasks they already hold (least first). */
export function suggestRiders(data: OpsData, hubId: string) {
  return data.riders
    .filter((r) => r.active && r.kyc === 'verified' && r.hubId === hubId)
    .map((r) => ({ rider: r, load: riderTasks(data, r.id).length }))
    .sort((a, b) => Number(b.rider.duty === 'online') - Number(a.rider.duty === 'online') || a.load - b.load);
}

export function searchShipments(shipments: Shipment[], query: string, merchants: Merchant[]) {
  const q = query.trim().toLowerCase();
  if (!q) return shipments;
  const merchantName = new Map(merchants.map((m) => [m.id, m.name.toLowerCase()]));
  return shipments.filter(
    (s) =>
      s.id.toLowerCase().includes(q) ||
      s.receiver.name.toLowerCase().includes(q) ||
      s.receiver.phone.includes(q) ||
      s.receiver.address.toLowerCase().includes(q) ||
      (merchantName.get(s.merchantId) ?? '').includes(q),
  );
}

/** Order stops by repeatedly visiting the nearest remaining one (greedy nearest-neighbour). */
export function optimizeRoute<T extends { latitude: number; longitude: number }>(start: { latitude: number; longitude: number }, stops: T[]) {
  const remaining = [...stops];
  const route: T[] = [];
  let here = start;
  let distanceKm = 0;
  while (remaining.length) {
    let best = 0;
    let bestD = Infinity;
    remaining.forEach((s, i) => {
      const d = haversineKm(here, s);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    distanceKm += bestD;
    here = remaining[best];
    route.push(...remaining.splice(best, 1));
  }
  return { route, distanceKm };
}

export function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** CSV export of shipments (shared through the system share sheet). */
export function shipmentsCsv(data: OpsData, shipments: Shipment[]) {
  const merchant = new Map(data.merchants.map((m) => [m.id, m.name]));
  const hub = new Map(data.hubs.map((h) => [h.id, h.name]));
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = shipments.map((s) =>
    [
      s.id,
      s.createdAt,
      merchant.get(s.merchantId) ?? s.merchantId,
      s.receiver.name,
      s.receiver.phone,
      s.receiver.district,
      hub.get(s.hubId) ?? s.hubId,
      STATUS_META[s.status].label,
      s.cod,
      s.charge,
      s.pod?.collected ?? '',
      s.pod?.at ?? '',
    ]
      .map(esc)
      .join(','),
  );
  return ['Tracking ID,Booked,Merchant,Receiver,Phone,District,Hub,Status,COD,Charge,Collected,Delivered At', ...rows].join('\n');
}

// ---------------------------------------------------------------------------
// Sample network
// ---------------------------------------------------------------------------

/** Deterministic PRNG so the sample network is the same on every fresh install. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rider account used when someone signs in with the Rider role (until auth returns a rider id). */
export const CURRENT_RIDER_ID = 'R-101';
/** Staff account used when someone signs in with the Admin role. */
export const CURRENT_ADMIN_ID = 'ST-1';

const HUBS: Hub[] = [
  { id: 'KTM', name: 'Kathmandu Hub', district: 'KATHMANDU', latitude: 27.6866, longitude: 85.3486, manager: 'Bikash Shrestha', phone: '9801234501', capacity: 180, zone: 'valley', localities: ['Tinkune', 'Baneshwor', 'Koteshwor', 'Thamel', 'Chabahil', 'Kalanki', 'Maharajgunj', 'Budhanilkantha'] },
  { id: 'LTP', name: 'Lalitpur Hub', district: 'LALITPUR', latitude: 27.6644, longitude: 85.3188, manager: 'Anita Maharjan', phone: '9801234502', capacity: 90, zone: 'valley', localities: ['Pulchowk', 'Jawalakhel', 'Satdobato', 'Kupondole', 'Imadol'] },
  { id: 'BKT', name: 'Bhaktapur Hub', district: 'BHAKTAPUR', latitude: 27.671, longitude: 85.4298, manager: 'Suman Prajapati', phone: '9801234503', capacity: 60, zone: 'valley', localities: ['Suryabinayak', 'Kamalbinayak', 'Thimi', 'Sallaghari'] },
  { id: 'PKR', name: 'Pokhara Hub', district: 'KASKI', latitude: 28.2096, longitude: 83.9856, manager: 'Deepak Gurung', phone: '9801234504', capacity: 80, zone: 'city', localities: ['Lakeside', 'Prithvi Chowk', 'Mahendrapul', 'Chipledhunga', 'Bagar'] },
  { id: 'BTW', name: 'Butwal Hub', district: 'RUPANDEHI', latitude: 27.7006, longitude: 83.4484, manager: 'Ramila Pandey', phone: '9801234505', capacity: 60, zone: 'city', localities: ['Traffic Chowk', 'Milanchowk', 'Golpark', 'Kalikanagar'] },
  { id: 'BRT', name: 'Biratnagar Hub', district: 'MORANG', latitude: 26.4525, longitude: 87.2718, manager: 'Nabin Karki', phone: '9801234506', capacity: 60, zone: 'city', localities: ['Main Road', 'Traffic Chowk', 'Bargachhi', 'Tinpaini'] },
  { id: 'CTW', name: 'Chitwan Hub', district: 'CHITWAN', latitude: 27.6833, longitude: 84.4333, manager: 'Sarita Adhikari', phone: '9801234507', capacity: 60, zone: 'city', localities: ['Narayangarh', 'Bharatpur Chowk', 'Chaubiskothi', 'Pulchowk'] },
  { id: 'DHN', name: 'Dhangadhi Hub', district: 'KAILALI', latitude: 28.6852, longitude: 80.6216, manager: 'Hari Bhatta', phone: '9801234508', capacity: 40, zone: 'outside', localities: ['Campus Road', 'Hasanpur', 'Chauraha', 'Uttarbehadi'] },
];

const MERCHANTS: [string, string, string, KycStatus, boolean][] = [
  [DEMO_VENDOR_BUSINESS_NAME, DEMO_PERSON_NAME, 'KTM', 'verified', true],
  ['Everest Electronics', 'Prakash Shrestha', 'KTM', 'verified', true],
  ['Thamel Fashion House', 'Srijana Tamang', 'KTM', 'verified', true],
  ['Pokhara Organics', 'Kiran Gurung', 'PKR', 'verified', true],
  ['Book Bazaar Nepal', 'Rabin Joshi', 'LTP', 'verified', true],
  ['Kitchen Kart', 'Manisha KC', 'KTM', 'verified', true],
  ['Gadget Ghar', 'Sujan Lama', 'BTW', 'verified', true],
  ['Namaste Beauty', 'Pooja Basnet', 'LTP', 'verified', true],
  ['Mithila Arts', 'Sita Jha', 'BRT', 'verified', true],
  ['Summit Sports', 'Dawa Sherpa', 'KTM', 'pending', true],
  ['Urban Kicks', 'Rohan Thapa', 'CTW', 'pending', true],
  ['Himal Herbs', 'Laxmi Bhandari', 'DHN', 'verified', false],
];

const RIDERS: [string, string, Rider['vehicle']['type'], Duty, KycStatus, boolean][] = [
  ['Ramesh Thapa', 'KTM', 'Bike', 'online', 'verified', true],
  ['Sagar Magar', 'KTM', 'Bike', 'online', 'verified', true],
  ['Bishal Tamang', 'KTM', 'Scooter', 'online', 'verified', true],
  ['Kamal Rai', 'KTM', 'Bike', 'break', 'verified', true],
  ['Nirajan KC', 'KTM', 'Van', 'offline', 'verified', true],
  ['Sunil Maharjan', 'LTP', 'Bike', 'online', 'verified', true],
  ['Prabin Shakya', 'LTP', 'Scooter', 'online', 'verified', true],
  ['Rojan Prajapati', 'BKT', 'Bike', 'online', 'verified', true],
  ['Aashish Gurung', 'PKR', 'Bike', 'online', 'verified', true],
  ['Milan Pun', 'PKR', 'Bike', 'offline', 'verified', true],
  ['Santosh Yadav', 'BTW', 'Bike', 'online', 'verified', true],
  ['Rajan Chaudhary', 'BRT', 'Bike', 'online', 'verified', true],
  ['Dipesh Poudel', 'CTW', 'Scooter', 'online', 'verified', true],
  ['Bhim Bohara', 'DHN', 'Bike', 'online', 'verified', true],
  ['Anil Khadka', 'KTM', 'Bike', 'offline', 'pending', true],
  ['Suresh Lama', 'LTP', 'Scooter', 'offline', 'pending', true],
  ['Kiran Oli', 'BTW', 'Bike', 'offline', 'verified', false],
];

const FIRST = ['Aarati', 'Bibek', 'Chandra', 'Dipika', 'Gita', 'Hari', 'Ishwor', 'Jyoti', 'Kabita', 'Laxman', 'Mina', 'Nabin', 'Parbati', 'Rabin', 'Sabina', 'Tek', 'Usha', 'Yam', 'Asmita', 'Bijay', 'Rupa', 'Sanjay', 'Prerana', 'Manoj'];
const LAST = ['Shrestha', 'Gurung', 'Tamang', 'Rai', 'Karki', 'Adhikari', 'Thapa', 'Magar', 'Poudel', 'Khadka', 'Bhattarai', 'KC', 'Lama', 'Maharjan', 'Joshi'];
const ITEMS = ['Mobile accessories', 'Clothing', 'Books', 'Cosmetics', 'Kitchenware', 'Shoes', 'Electronics', 'Handicraft', 'Groceries', 'Sports gear', 'Documents', 'Toys'];

const HOUR = 60 * 60 * 1000;

export function createSampleOps(now = new Date()): OpsData {
  const rand = mulberry32(20260928);
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const iso = (t: number) => new Date(t).toISOString();
  const phone = () => `98${int(0, 6)}${String(int(1000000, 9999999))}`;

  const merchants: Merchant[] = MERCHANTS.map(([name, owner, hubId, kyc, active], i) => ({
    id: i === 0 ? 'M-16500' : `M-${16501 + i}`,
    name,
    owner,
    phone: phone(),
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/\.$/, '')}@example.com`,
    hubId,
    pickupAddress: `${pick(HUBS.find((h) => h.id === hubId)!.localities)}, ${HUBS.find((h) => h.id === hubId)!.district}`,
    kyc,
    active,
    joinedAt: iso(now.getTime() - int(20, 600) * 24 * HOUR),
  }));

  const riders: Rider[] = RIDERS.map(([name, hubId, type, duty, kyc, active], i) => {
    const hub = HUBS.find((h) => h.id === hubId)!;
    const zoneLetter = hubId === 'KTM' || hubId === 'LTP' || hubId === 'BKT' ? 'BA' : pick(['GA', 'LU', 'KO', 'SE']);
    return {
      id: `R-${101 + i}`,
      name,
      phone: phone(),
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@ksg.example`,
      hubId,
      vehicle: { type, plate: `${zoneLetter} ${int(1, 99)} PA ${int(1000, 9999)}` },
      duty,
      shiftStartedAt: duty === 'offline' ? undefined : iso(now.getTime() - int(1, 5) * HOUR - int(0, 59) * 60000),
      kyc,
      active,
      rating: Math.round((4.2 + rand() * 0.75) * 10) / 10,
      joinedAt: iso(now.getTime() - int(10, 900) * 24 * HOUR),
      latitude: hub.latitude + (rand() - 0.5) * 0.06,
      longitude: hub.longitude + (rand() - 0.5) * 0.06,
      documents: [
        { name: 'Driving licence', status: kyc === 'pending' ? 'pending' : 'verified', expires: iso(now.getTime() + int(90, 1500) * 24 * HOUR) },
        { name: 'Citizenship', status: kyc === 'pending' ? 'pending' : 'verified' },
        { name: 'Vehicle blue book', status: kyc === 'pending' ? 'pending' : 'verified', expires: iso(now.getTime() + int(30, 365) * 24 * HOUR) },
      ],
    };
  });

  const activeRidersOf = (hubId: string) => riders.filter((r) => r.hubId === hubId && r.active && r.kyc === 'verified');
  const me = riders[0];

  const shipments: Shipment[] = [];
  let serial = 24630100;
  const today0 = startOfDay(now).getTime();

  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const count = daysAgo === 0 ? 24 : int(9, 15);
    for (let n = 0; n < count; n++) {
      const merchant = pick(merchants.filter((m) => m.active));
      const hub = rand() < 0.45 ? HUBS[0] : pick(HUBS);
      const created =
        daysAgo === 0
          ? now.getTime() - int(20, Math.max(40, Math.min(9 * 60, (now.getTime() - today0) / 60000))) * 60000
          : today0 - daysAgo * 24 * HOUR + int(8, 17) * HOUR + int(0, 59) * 60000;
      const weightKg = Math.round((0.3 + rand() * 4.5) * 10) / 10;
      const cod = rand() < 0.65 ? int(10, 100) * 50 : 0;
      const fragile = rand() < 0.12;
      const q = quote(DEFAULT_RATE_CARD, hub.zone, weightKg, cod, fragile);
      const name = `${pick(FIRST)} ${pick(LAST)}`;

      // Status by age.
      const r = rand();
      let status: ShipmentStatus;
      if (daysAgo >= 3) status = r < 0.82 ? 'delivered' : r < 0.88 ? 'returned' : r < 0.91 ? 'returning' : r < 0.95 ? 'failed' : 'cancelled';
      else if (daysAgo >= 1)
        status = r < 0.62 ? 'delivered' : r < 0.74 ? 'out-for-delivery' : r < 0.84 ? 'at-hub' : r < 0.93 ? 'failed' : 'returning';
      else
        status =
          r < 0.14 ? 'pickup-requested' : r < 0.3 ? 'pickup-assigned' : r < 0.4 ? 'picked-up' : r < 0.55 ? 'at-hub' : r < 0.82 ? 'out-for-delivery' : r < 0.94 ? 'delivered' : 'failed';

      // Riders: pickups and returns are handled at the merchant's hub, deliveries at the destination
      // hub (Ramesh, the demo rider, gets a healthy share of Kathmandu work).
      const riderFrom = (hubId: string) => {
        const pool = activeRidersOf(hubId).filter((x) => x.duty !== 'offline');
        return hubId === 'KTM' && rand() < 0.45 ? me : pool.length ? pick(pool) : undefined;
      };
      const handler = riderFrom(hub.id);
      const pickupRider = riderFrom(merchant.hubId);

      // Build the timeline, compressing today's events into the time that has actually passed.
      const chain: ShipmentStatus[] = ['pickup-requested'];
      const flow: ShipmentStatus[] = ['pickup-assigned', 'picked-up', 'at-hub', 'out-for-delivery'];
      const target: Record<ShipmentStatus, number> = {
        'pickup-requested': 0,
        'pickup-assigned': 1,
        'picked-up': 2,
        'at-hub': 3,
        'out-for-delivery': 4,
        delivered: 4,
        failed: 4,
        returning: 4,
        returned: 4,
        cancelled: 0,
      };
      chain.push(...flow.slice(0, target[status]));
      if (status === 'delivered') chain.push('delivered');
      if (status === 'failed') chain.push('failed');
      if (status === 'returning') chain.push('failed', 'returning');
      if (status === 'returned') chain.push('failed', 'returning', 'returned');
      if (status === 'cancelled') chain.push('cancelled');

      // Events never run past "now": a parcel booked late yesterday cannot have been delivered tomorrow.
      const elapsed = Math.max(60000, now.getTime() - created - 5 * 60000);
      const span = daysAgo === 0 ? elapsed : Math.min(int(20, 40) * HOUR, elapsed);
      const step = span / Math.max(1, chain.length);
      const events: ShipmentEvent[] = chain.map((st, i) => {
        const at = created + Math.round(i * step);
        const actor =
          st === 'pickup-requested'
            ? merchant.name
            : st === 'pickup-assigned' || st === 'at-hub' || st === 'returning' || st === 'cancelled'
              ? 'Dispatch'
              : st === 'picked-up'
                ? (pickupRider?.name ?? 'Rider')
                : (handler?.name ?? 'Rider');
        const note =
          st === 'failed'
            ? pick(FAIL_REASONS)
            : st === 'at-hub'
              ? `Received at ${hub.name}`
              : st === 'returning'
                ? 'Return to merchant initiated'
                : undefined;
        return { status: st, at: iso(at), actor, note };
      });

      const last = events[events.length - 1];
      const failEvent = [...events].reverse().find((e) => e.status === 'failed');
      const activeWithRider: ShipmentStatus[] = ['pickup-assigned', 'picked-up', 'out-for-delivery'];
      const riderId = activeWithRider.includes(status)
        ? (status === 'picked-up' || status === 'pickup-assigned' ? pickupRider : handler)?.id
        : status === 'returning' && rand() < 0.4
          ? pickupRider?.id
          : undefined;
      if (riderId) {
        const holder = riders.find((x) => x.id === riderId)!;
        const lastRiderEvent = [...events].reverse().find((e) => e.status === status);
        if (lastRiderEvent && lastRiderEvent.actor !== 'Dispatch' && lastRiderEvent.actor !== merchant.name) lastRiderEvent.actor = holder.name;
      }

      const locality = pick(hub.localities);
      serial += int(1, 9);
      shipments.push({
        id: `KSG${serial}`,
        merchantId: merchant.id,
        receiver: {
          name,
          phone: phone(),
          address: `${locality}-${int(1, 32)}, ${hub.district.charAt(0) + hub.district.slice(1).toLowerCase()}`,
          district: hub.district,
        },
        hubId: hub.id,
        zone: hub.zone,
        latitude: hub.latitude + (rand() - 0.5) * 0.07,
        longitude: hub.longitude + (rand() - 0.5) * 0.07,
        item: pick(ITEMS),
        weightKg,
        fragile,
        cod,
        charge: q.total,
        status,
        riderId,
        attempts: events.filter((e) => e.status === 'failed').length + (status === 'delivered' ? 1 : 0),
        failReason: failEvent?.note,
        createdAt: iso(created),
        updatedAt: last.at,
        promisedBy: iso(created + q.slaHours * HOUR),
        otp: String(int(1000, 9999)),
        pod:
          status === 'delivered'
            ? {
                receivedBy: rand() < 0.8 ? name : `${pick(FIRST)} (family)`,
                otpVerified: true,
                collected: cod,
                method: cod === 0 || rand() < 0.8 ? 'cash' : 'online',
                at: last.at,
                riderId: handler?.id ?? me.id,
              }
            : undefined,
        events,
      });
    }
  }

  // COD deposits: riders hand over each day's cash the next day; yesterday's cash is still being verified.
  const deposits: CashDeposit[] = [];
  let depositSerial = 5001;
  for (const rider of riders) {
    const byDay = new Map<number, number>();
    for (const s of shipments) {
      if (s.pod?.riderId !== rider.id || s.pod.method !== 'cash' || s.pod.collected === 0) continue;
      const day = startOfDay(new Date(s.pod.at)).getTime();
      byDay.set(day, (byDay.get(day) ?? 0) + s.pod.collected);
    }
    for (const [day, amount] of [...byDay.entries()].sort((a, b) => a[0] - b[0])) {
      const age = Math.round((today0 - day) / (24 * HOUR));
      if (age === 0) continue;
      const pending = age === 1 && rand() < 0.6;
      deposits.push({
        id: `DP-${depositSerial++}`,
        riderId: rider.id,
        amount,
        at: iso(Math.min(day + 33 * HOUR, now.getTime() - 10 * 60000)),
        reference: `CASH-${rider.hubId}-${int(1000, 9999)}`,
        status: pending ? 'pending' : 'verified',
        reviewedAt: pending ? undefined : iso(day + 35 * HOUR),
      });
    }
  }

  // Merchant payouts: weekly settlements; last week's is waiting to be paid.
  const payouts: Payout[] = [];
  let payoutSerial = 3001;
  for (const m of merchants) {
    for (const [fromAgo, toAgo, paid] of [
      [13, 7, true],
      [6, 1, false],
    ] as const) {
      const periodShipments = shipments.filter((s) => {
        if (s.merchantId !== m.id || s.status !== 'delivered' || !s.pod) return false;
        const age = Math.round((today0 - startOfDay(new Date(s.pod.at)).getTime()) / (24 * HOUR));
        return age <= fromAgo && age >= toAgo;
      });
      const amount = periodShipments.reduce((sum, s) => sum + s.pod!.collected - s.charge, 0);
      if (periodShipments.length === 0 || amount <= 0) continue;
      payouts.push({
        id: `PO-${payoutSerial++}`,
        merchantId: m.id,
        amount,
        shipments: periodShipments.length,
        periodEnd: iso(today0 - toAgo * 24 * HOUR),
        status: paid ? 'paid' : 'pending',
        paidAt: paid ? iso(today0 - (toAgo - 1) * 24 * HOUR) : undefined,
        reference: paid ? `NIBL-${int(100000, 999999)}` : undefined,
      });
    }
  }

  const failedOnes = shipments.filter((s) => s.status === 'failed' || s.status === 'returning');
  const overdueOnes = shipments.filter((s) => isOverdue(s, now));
  const ticketSeed: [string, string, Ticket['channel'], TicketPriority, TicketStatus, Shipment | undefined][] = [
    ['Parcel not delivered yet', 'My order was promised yesterday but still shows out for delivery. Please update.', 'customer', 'high', 'open', overdueOnes[0]],
    ['COD amount mismatch', 'Payout for last week is Rs. 450 less than our records.', 'merchant', 'urgent', 'open', undefined],
    ['Receiver refused parcel', 'Receiver says the item was not ordered. Please advise whether to return.', 'rider', 'medium', 'in-progress', failedOnes[0]],
    ['Change delivery address', 'Please deliver to Baneshwor instead of Koteshwor.', 'customer', 'medium', 'open', shipments.find((s) => s.status === 'at-hub')],
    ['Pickup missed', 'Rider did not come for pickup scheduled this morning.', 'merchant', 'high', 'open', shipments.find((s) => s.status === 'pickup-requested')],
    ['Damaged packaging', 'Box arrived slightly crushed, item fine. Logging for record.', 'customer', 'low', 'resolved', shipments.find((s) => s.status === 'delivered')],
    ['App login issue', 'Unable to log in to rider app after password reset.', 'rider', 'medium', 'resolved', undefined],
    ['Bulk pickup request', 'We have 40 parcels ready for pickup tomorrow morning.', 'merchant', 'low', 'in-progress', undefined],
    ['Wrong COD collected', 'Rider collected Rs. 1,500 but COD was Rs. 1,200.', 'customer', 'urgent', 'open', shipments.find((s) => s.status === 'delivered' && s.cod > 0)],
  ];
  const tickets: Ticket[] = ticketSeed.map(([subject, body, channel, priority, status, shipment], i) => {
    const created = now.getTime() - int(1, 70) * HOUR;
    return {
      id: `TK-${1001 + i}`,
      subject,
      body,
      channel,
      requester:
        channel === 'merchant'
          ? pick(merchants).name
          : channel === 'rider'
            ? pick(riders).name
            : (shipment?.receiver.name ?? `${pick(FIRST)} ${pick(LAST)}`),
      shipmentId: shipment?.id,
      priority,
      status,
      assignee: status === 'open' ? undefined : 'Pratima Shah',
      createdAt: iso(created),
      updatedAt: iso(created + int(0, 5) * HOUR),
    };
  });

  const announcements: Announcement[] = [
    {
      id: 'AN-3',
      title: 'Festival rush: extended hours',
      body: 'Hubs stay open until 8 PM through the festival season. Riders on evening shifts get a Rs. 150 bonus per day.',
      audience: 'all',
      at: iso(now.getTime() - 5 * HOUR),
      author: DEMO_PERSON_NAME,
    },
    {
      id: 'AN-2',
      title: 'Always verify the delivery OTP',
      body: 'Do not hand over parcels without the receiver OTP. Deliveries without OTP will be flagged for review.',
      audience: 'riders',
      at: iso(now.getTime() - 28 * HOUR),
      author: 'Operations',
    },
    {
      id: 'AN-1',
      title: 'Weekly COD payouts every Sunday',
      body: 'COD settlements are transferred every Sunday for deliveries completed up to Friday.',
      audience: 'merchants',
      at: iso(now.getTime() - 3 * 24 * HOUR),
      author: 'Finance',
    },
  ];

  const staff: Staff[] = [
    { id: CURRENT_ADMIN_ID, name: DEMO_PERSON_NAME, email: DEMO_ADMIN_EMAIL, role: 'super-admin', active: true, lastActiveAt: iso(now.getTime()) },
    { id: 'ST-2', name: 'Bikash Shrestha', email: 'bikash.shrestha@ksg.example', role: 'ops-manager', hubId: 'KTM', active: true, lastActiveAt: iso(now.getTime() - 40 * 60000) },
    { id: 'ST-3', name: 'Rekha Thapa', email: 'rekha.thapa@ksg.example', role: 'dispatcher', hubId: 'KTM', active: true, lastActiveAt: iso(now.getTime() - 12 * 60000) },
    { id: 'ST-4', name: 'Manoj Adhikari', email: 'manoj.adhikari@ksg.example', role: 'finance', active: true, lastActiveAt: iso(now.getTime() - 3 * HOUR) },
    { id: 'ST-5', name: 'Pratima Shah', email: 'pratima.shah@ksg.example', role: 'support', active: true, lastActiveAt: iso(now.getTime() - 25 * 60000) },
    { id: 'ST-6', name: 'Deepak Gurung', email: 'deepak.gurung@ksg.example', role: 'ops-manager', hubId: 'PKR', active: true, lastActiveAt: iso(now.getTime() - 2 * HOUR) },
    { id: 'ST-7', name: 'Nisha Bista', email: 'nisha.bista@ksg.example', role: 'dispatcher', hubId: 'LTP', active: false, lastActiveAt: iso(now.getTime() - 20 * 24 * HOUR) },
  ];

  const audit: AuditEntry[] = [
    { id: 'AU-5', at: iso(now.getTime() - 25 * 60000), actor: 'Rekha Thapa', action: 'Assigned 6 parcels', target: 'Sagar Magar' },
    { id: 'AU-4', at: iso(now.getTime() - 2 * HOUR), actor: 'Manoj Adhikari', action: 'Verified COD deposit', target: 'DP-5001' },
    { id: 'AU-3', at: iso(now.getTime() - 4 * HOUR), actor: DEMO_PERSON_NAME, action: 'Published announcement', target: 'Festival rush: extended hours' },
    { id: 'AU-2', at: iso(now.getTime() - 26 * HOUR), actor: 'Bikash Shrestha', action: 'Approved rider KYC', target: 'Dipesh Poudel' },
    { id: 'AU-1', at: iso(now.getTime() - 50 * HOUR), actor: DEMO_PERSON_NAME, action: 'Updated rate card', target: 'Inside Valley' },
  ];

  return {
    version: OPS_DATA_VERSION,
    generatedAt: iso(now.getTime()),
    hubs: HUBS,
    merchants,
    riders,
    shipments: shipments.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    deposits: deposits.sort((a, b) => b.at.localeCompare(a.at)),
    payouts: payouts.sort((a, b) => b.periodEnd.localeCompare(a.periodEnd)),
    tickets,
    announcements,
    staff,
    audit,
    rateCard: DEFAULT_RATE_CARD,
    settings: { autoAssign: true, otpRequired: true, riderCashLimit: 25000, maxAttempts: 3, workingHours: '9:00 AM – 7:00 PM' },
  };
}

// ---------------------------------------------------------------------------
// Stored data migrations
// ---------------------------------------------------------------------------

/**
 * Upgrades operations data saved by an earlier app version, or returns `null` when it is not
 * recognisable (the caller then keeps the fresh sample network).
 *
 * v1 → v2: the demo admin, the first demo merchant and their audit / announcement entries were
 * renamed to the current demo identity.
 */
export function migrateOpsData(saved: unknown): OpsData | null {
  if (typeof saved !== 'object' || saved === null) return null;
  const data = saved as Partial<OpsData> & { version?: number };
  if (!Array.isArray(data.shipments) || !Array.isArray(data.staff) || !Array.isArray(data.merchants)) return null;
  if (data.version === OPS_DATA_VERSION) return data as OpsData;
  if (data.version !== 1) return null;

  const rename = (name: string) => (name === LEGACY_NAMES.admin ? DEMO_PERSON_NAME : name);
  return {
    ...(data as OpsData),
    version: OPS_DATA_VERSION,
    staff: data.staff.map((st) =>
      st.id === CURRENT_ADMIN_ID && st.name === LEGACY_NAMES.admin
        ? { ...st, name: DEMO_PERSON_NAME, email: st.email === LEGACY_NAMES.adminEmail ? DEMO_ADMIN_EMAIL : st.email }
        : st,
    ),
    merchants: data.merchants.map((m) =>
      m.name === LEGACY_NAMES.vendorBusiness
        ? { ...m, name: DEMO_VENDOR_BUSINESS_NAME, owner: m.owner === LEGACY_NAMES.merchantOwner ? DEMO_PERSON_NAME : m.owner }
        : m,
    ),
    shipments: data.shipments.map((sh) =>
      sh.events.some((e) => e.actor === LEGACY_NAMES.vendorBusiness)
        ? { ...sh, events: sh.events.map((e) => (e.actor === LEGACY_NAMES.vendorBusiness ? { ...e, actor: DEMO_VENDOR_BUSINESS_NAME } : e)) }
        : sh,
    ),
    tickets: (data.tickets ?? []).map((t) => ({
      ...t,
      requester: t.requester === LEGACY_NAMES.vendorBusiness ? DEMO_VENDOR_BUSINESS_NAME : t.requester,
    })),
    announcements: (data.announcements ?? []).map((a) => ({ ...a, author: rename(a.author) })),
    audit: (data.audit ?? []).map((a) => ({ ...a, actor: rename(a.actor) })),
  };
}
