/**
 * Vendor portal data model and sample records.
 *
 * The sample records mirror the figures in the `vendor ui-ux` designs so every screen renders
 * as designed. Replace the `SAMPLE_*` exports with the KSG vendor API; every total on the
 * Dashboard, Accounts and Reports screens is derived from these records by the helpers below.
 */
import { DEMO_PERSON_NAME, DEMO_VENDOR_BUSINESS_NAME } from '@/constants/identity';
import { daysInclusive, isSameDay, startOfDay } from '@/utils/format';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OrderStatus = 'delivered' | 'in-transit' | 'returned' | 'return-pending';

/** Which Orders chip a record belongs to. */
export type OrderStage = 'orders' | 'warehouse' | 'rtv' | 'unattended';

export type VendorOrder = {
  id: string;
  receiver: string;
  branch: string;
  /** Cash on delivery value of the package, in rupees. */
  amount: number;
  phone: string;
  address: string;
  createdAt: string;
  deliveredAt?: string;
  status: OrderStatus;
  stage: OrderStage;
  fragile?: boolean;
};

export type VendorPayment = {
  orderId: string;
  cod: number;
  charge: number;
  returned: number;
  /** Amount already settled between KSG and the vendor (negative when charges were deducted). */
  codTransferred: number;
  codTransferredAt?: string;
};

export type CommentType = 'Info' | 'Issue' | 'Request';

export type VendorComment = {
  id: string;
  orderId: string;
  text: string;
  type: CommentType;
  createdAt: string;
};

export type VendorProfile = {
  businessName: string;
  ownerName: string;
  /** Six-digit ID, generated randomly per install until the vendor API issues one. */
  vendorId: string;
  phone: string;
  address: string;
};

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  delivered: 'Delivered',
  'in-transit': 'In Transit',
  returned: 'Returned',
  'return-pending': 'Return Pending',
};

export const ORDER_STAGES: { key: OrderStage; label: string }[] = [
  { key: 'orders', label: 'Orders' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'rtv', label: "RTV's" },
  { key: 'unattended', label: 'Unattended' },
];

// ---------------------------------------------------------------------------
// Sample records (from the designs)
// ---------------------------------------------------------------------------

/** Profile defaults; the vendor state fills in a random `vendorId` on first launch. */
export const SAMPLE_PROFILE: Omit<VendorProfile, 'vendorId'> = {
  businessName: DEMO_VENDOR_BUSINESS_NAME,
  ownerName: DEMO_PERSON_NAME,
  phone: '9867335830',
  address: 'Kathmandu, Nepal',
};

export const SAMPLE_ORDERS: VendorOrder[] = [
  {
    id: '24629896',
    receiver: 'amrit',
    branch: 'BASUNDHARA',
    amount: 0,
    phone: '9867335830',
    address: 'teaching paxadi',
    createdAt: '2026-08-12T15:15:00',
    deliveredAt: '2026-08-13T11:43:00',
    status: 'delivered',
    stage: 'orders',
  },
  {
    id: '24022140',
    receiver: 'amrit',
    branch: 'BUTWAL',
    amount: 0,
    phone: '9867335830',
    address: 'butwal 10 ramnagar',
    createdAt: '2026-07-26T18:07:00',
    deliveredAt: '2026-07-28T13:20:00',
    status: 'delivered',
    stage: 'orders',
    fragile: true,
  },
  {
    id: '17000702',
    receiver: 'sita',
    branch: 'POKHARA',
    amount: 150,
    phone: '9846012345',
    address: 'lakeside 6, pokhara',
    createdAt: '2026-06-18T10:30:00',
    deliveredAt: '2026-06-19T16:05:00',
    status: 'delivered',
    stage: 'orders',
  },
  {
    id: '17998392',
    receiver: 'ram',
    branch: 'ITAHARI',
    amount: 0,
    phone: '9812345678',
    address: 'itahari 4, sunsari',
    createdAt: '2026-06-02T09:10:00',
    deliveredAt: '2026-06-02T17:45:00',
    status: 'delivered',
    stage: 'orders',
  },
  {
    id: '16804521',
    receiver: 'gita',
    branch: 'KATHMANDU',
    amount: 91,
    phone: '9801122334',
    address: 'baneshwor, kathmandu',
    createdAt: '2026-05-21T12:00:00',
    deliveredAt: '2026-05-22T11:30:00',
    status: 'delivered',
    stage: 'orders',
  },
  {
    id: '16522310',
    receiver: 'hari',
    branch: 'BHAKTAPUR',
    amount: 50,
    phone: '9841556677',
    address: 'suryabinayak, bhaktapur',
    createdAt: '2026-05-09T14:25:00',
    deliveredAt: '2026-05-10T10:15:00',
    status: 'delivered',
    stage: 'orders',
  },
];

export const SAMPLE_PAYMENTS: VendorPayment[] = [
  { orderId: '24629896', cod: 0, charge: 185, returned: 0, codTransferred: 0 },
  { orderId: '24022140', cod: 0, charge: 399, returned: 0, codTransferred: -399, codTransferredAt: '2026-08-02T12:00:00' },
  { orderId: '17998392', cod: 0, charge: 170, returned: 0, codTransferred: -170, codTransferredAt: '2026-06-09T12:00:00' },
  { orderId: '17000702', cod: 150, charge: 160, returned: 0, codTransferred: -10, codTransferredAt: '2026-06-26T12:00:00' },
  { orderId: '16804521', cod: 91, charge: 120, returned: 0, codTransferred: 0 },
  { orderId: '16522310', cod: 50, charge: 110, returned: 0, codTransferred: -60, codTransferredAt: '2026-05-17T12:00:00' },
];

const COMMENT_ROWS: [orderId: string, text: string, type: CommentType, createdAt: string][] = [
  ['24629896', 'Order is Sent for Delivery', 'Info', '2026-08-13T11:43:00'],
  ['24629896', 'Confirm for Delivery', 'Info', '2026-08-13T10:04:00'],
  ['24629896', 'pick up ko lagi', 'Info', '2026-08-12T16:20:00'],
  ['24629896', 'Package received at BASUNDHARA branch', 'Info', '2026-08-12T15:40:00'],
  ['24022140', 'Fragile item, handle with care', 'Request', '2026-07-28T09:30:00'],
  ['24022140', 'Receiver asked for delivery after 1 PM', 'Request', '2026-07-27T17:10:00'],
  ['24022140', 'Order is Sent for Delivery', 'Info', '2026-07-27T08:45:00'],
  ['24022140', 'Package dispatched to BUTWAL', 'Info', '2026-07-26T19:02:00'],
  ['17000702', 'Receiver not reachable on first attempt', 'Issue', '2026-06-19T11:15:00'],
  ['17000702', 'Order is Sent for Delivery', 'Info', '2026-06-19T08:30:00'],
  ['17000702', 'Package received at POKHARA branch', 'Info', '2026-06-18T18:40:00'],
  ['17998392', 'Confirm for Delivery', 'Info', '2026-06-02T12:05:00'],
  ['17998392', 'Order is Sent for Delivery', 'Info', '2026-06-02T09:40:00'],
  ['16804521', 'Receiver requested evening delivery', 'Request', '2026-05-21T16:00:00'],
  ['16804521', 'Order is Sent for Delivery', 'Info', '2026-05-22T08:20:00'],
  ['16522310', 'Address landmark updated by receiver', 'Info', '2026-05-09T18:30:00'],
  ['16522310', 'Order is Sent for Delivery', 'Info', '2026-05-10T08:05:00'],
];

export const SAMPLE_COMMENTS: VendorComment[] = COMMENT_ROWS.map(([orderId, text, type, createdAt], index) => ({
  id: `c${index + 1}`,
  orderId,
  text,
  type,
  createdAt,
}));

// ---------------------------------------------------------------------------
// Derived figures
// ---------------------------------------------------------------------------

const sum = (orders: VendorOrder[]) => orders.reduce((total, o) => total + o.amount, 0);
const withStatus = (orders: VendorOrder[], status: OrderStatus) => orders.filter((o) => o.status === status);

/** Dashboard totals: order counts plus the four "Order Values" tiles. */
export function dashboardSummary(orders: VendorOrder[]) {
  const delivered = withStatus(orders, 'delivered');
  return {
    totalOrders: orders.length,
    deliveredOrders: delivered.length,
    totalValue: sum(orders),
    deliveredValue: sum(delivered),
    returnedValue: sum(withStatus(orders, 'returned')),
    pendingValue: sum(withStatus(orders, 'in-transit')),
  };
}

/** Net = COD − charge − returned; Balance = Net − already transferred. */
export function paymentFigures(p: VendorPayment) {
  const net = p.cod - p.charge - p.returned;
  const balance = net - p.codTransferred;
  return { net, balance, completed: balance === 0 };
}

export function ordersInRange(orders: VendorOrder[], from: Date, to: Date) {
  const start = startOfDay(from).getTime();
  const end = startOfDay(to).getTime();
  return orders.filter((o) => {
    const day = startOfDay(new Date(o.createdAt)).getTime();
    return day >= start && day <= end;
  });
}

/** Totals behind the Reports screen for one set of orders. */
export function reportSummary(orders: VendorOrder[]) {
  const delivered = withStatus(orders, 'delivered');
  const pending = withStatus(orders, 'in-transit');
  const returned = withStatus(orders, 'returned');
  const pendingReturn = withStatus(orders, 'return-pending');
  return {
    created: orders.length,
    delivered: delivered.length,
    deliveryRate: orders.length ? Math.round((delivered.length / orders.length) * 100) : 0,
    sameDay: delivered.filter((o) => o.deliveredAt && isSameDay(new Date(o.createdAt), new Date(o.deliveredAt)))
      .length,
    pendingDelivery: pending.length,
    returned: returned.length,
    pendingReturn: pendingReturn.length,
    packageValue: sum(orders),
    deliveredSales: sum(delivered),
    pendingSales: sum(pending),
    returnedValue: sum(returned),
    pendingReturnValue: sum(pendingReturn),
  };
}

export type ReportSummary = ReturnType<typeof reportSummary>;

/** One summary per calendar day in the range, newest first. */
export function dailyBreakdown(orders: VendorOrder[], from: Date, to: Date) {
  const days = daysInclusive(from, to);
  return Array.from({ length: Math.max(days, 0) }, (_, i) => {
    const day = new Date(startOfDay(to));
    day.setDate(day.getDate() - i);
    return { day, summary: reportSummary(ordersInRange(orders, day, day)) };
  });
}

/** Status timeline shown on the Actions → Logs tab, newest first. */
export function orderLogs(orders: VendorOrder[]) {
  return orders
    .flatMap((o) => [
      { id: `${o.id}-created`, orderId: o.id, title: `Order created for ${o.receiver}`, at: o.createdAt, status: o.status },
      ...(o.deliveredAt
        ? [{ id: `${o.id}-delivered`, orderId: o.id, title: `Delivered at ${o.branch}`, at: o.deliveredAt, status: o.status }]
        : []),
    ])
    .sort((a, b) => b.at.localeCompare(a.at));
}

export const MAX_REPORT_DAYS = 31;
