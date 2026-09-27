import { useLocalSearchParams } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SelectSheet } from '@/components/ui';
import {
  AlertCircleIcon,
  BagIcon,
  BoxIcon,
  BranchBuildingIcon,
  CalendarOutlineIcon,
  ChevronRightIcon,
  ClockIcon,
  HomeIcon,
  PhoneOutlineIcon,
  PinOutlineIcon,
  ReturnArrowIcon,
  SlidersIcon,
  UserIcon,
  WineGlassIcon,
} from '@/components/vendor/icons';
import {
  Badge,
  Card,
  Chip,
  EmptyState,
  IconTile,
  InfoSheet,
  SearchCountBar,
  ToolButton,
  VendorFab,
  VendorHeader,
} from '@/components/vendor/ui';
import { VendorColors as C } from '@/constants/theme';
import { ORDER_STAGES, ORDER_STATUS_LABELS, type OrderStage, type OrderStatus, type VendorOrder } from '@/data/vendor';
import { useVendorState } from '@/state/vendor-state';
import { formatDateTime, formatRs } from '@/utils/format';

const STATUS_BADGE: Record<OrderStatus, { bg: string; color: string }> = {
  delivered: { bg: '#EAF8F0', color: '#23A26D' },
  'in-transit': { bg: '#E9F2FE', color: '#2B6CB0' },
  returned: { bg: '#FDECEF', color: C.red },
  'return-pending': { bg: '#FEF3C7', color: '#D97706' },
};

const STAGE_ICONS: Record<OrderStage, (color: string) => ReactNode> = {
  orders: (color) => <BagIcon size={16} color={color} />,
  warehouse: (color) => <HomeIcon size={16} color={color} filled />,
  rtv: (color) => <ReturnArrowIcon size={16} color={color} />,
  unattended: (color) => <AlertCircleIcon size={16} color={color} />,
};

const ALL_STATUSES = 'All statuses';
const STATUS_OPTIONS = [ALL_STATUSES, ...Object.values(ORDER_STATUS_LABELS)];

const INFO = {
  title: 'Orders',
  body: 'Every parcel booked by your shop. Use the chips to switch between active orders, parcels held in the warehouse, returns to vendor (RTV) and unattended parcels. Search by order number, receiver, phone or branch.',
};

const NEW_ORDER_INFO = {
  title: 'Create an order',
  body: 'Booking new orders from the app is coming soon.',
};

const labelToStatus = (label: string) =>
  (Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).find((s) => ORDER_STATUS_LABELS[s] === label);

export default function OrdersScreen() {
  const params = useLocalSearchParams<{ q?: string; status?: string }>();
  const { orders } = useVendorState();

  const [stage, setStage] = useState<OrderStage>('orders');
  const [searching, setSearching] = useState(Boolean(params.q));
  const [query, setQuery] = useState(params.q ?? '');
  const [status, setStatus] = useState<OrderStatus | null>((params.status as OrderStatus) ?? null);
  const [statusSheet, setStatusSheet] = useState(false);
  const [newOrderInfo, setNewOrderInfo] = useState(false);

  // Links from other screens (Accounts → Order Detail, Dashboard cards) re-seed the filters.
  const [seenParams, setSeenParams] = useState(params);
  if (params.q !== seenParams.q || params.status !== seenParams.status) {
    setSeenParams(params);
    setStage('orders');
    setQuery(params.q ?? '');
    setSearching(Boolean(params.q));
    setStatus((params.status as OrderStatus) ?? null);
  }

  const q = query.trim().toLowerCase();
  const visible = orders.filter(
    (o) =>
      o.stage === stage &&
      (!status || o.status === status) &&
      (!q || [o.id, o.receiver, o.phone, o.branch, o.address].some((field) => field.toLowerCase().includes(q))),
  );

  const stageLabel = ORDER_STAGES.find((s) => s.key === stage)?.label ?? 'Orders';

  return (
    <View style={styles.screen}>
      <VendorHeader title="Orders" info={INFO} />

      <View style={styles.chipsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} role="tablist">
          {ORDER_STAGES.map(({ key, label }) => (
            <Chip key={key} label={label} icon={STAGE_ICONS[key]} active={stage === key} onPress={() => setStage(key)} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.toolbar}>
        <SearchCountBar
          icon={<CalendarOutlineIcon size={18} color={C.red} />}
          label={`${visible.length} ${visible.length === 1 ? 'Order' : 'Orders'}`}
          searching={searching}
          onToggleSearch={() => {
            if (searching) setQuery('');
            setSearching(!searching);
          }}
          query={query}
          onQueryChange={setQuery}
          placeholder="Order no., receiver, phone…"
        />
        <ToolButton label="Filter by status" active={status !== null} onPress={() => setStatusSheet(true)}>
          <SlidersIcon size={20} color={status ? C.red : '#4B5563'} />
        </ToolButton>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <OrderCard order={item} />}
        ListEmptyComponent={
          <EmptyState
            icon={<BoxIcon size={32} color={C.red} />}
            title={q || status ? 'No matching orders' : `No ${stageLabel.toLowerCase()} yet`}
            message={
              q || status
                ? 'Try a different search or clear the status filter.'
                : 'Parcels in this list will appear here as soon as they are updated.'
            }
          />
        }
      />

      <VendorFab label="Add new order" onPress={() => setNewOrderInfo(true)} />

      <SelectSheet
        visible={statusSheet}
        title="Filter by status"
        options={STATUS_OPTIONS}
        selected={status ? ORDER_STATUS_LABELS[status] : ALL_STATUSES}
        onSelect={(label) => setStatus(labelToStatus(label) ?? null)}
        onClose={() => setStatusSheet(false)}
        accent={C.red}
      />
      <InfoSheet visible={newOrderInfo} content={NEW_ORDER_INFO} onClose={() => setNewOrderInfo(false)} />
    </View>
  );
}

function OrderCard({ order }: { order: VendorOrder }) {
  const badge = STATUS_BADGE[order.status];
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardId}>
          <IconTile bg={C.red} size={34}>
            <BoxIcon size={20} color="#FFFFFF" />
          </IconTile>
          <Text style={styles.orderId}>#{order.id}</Text>
          {order.fragile && (
            <View style={styles.fragile} accessibilityLabel="Fragile">
              <WineGlassIcon size={12} color="#D97706" />
              <Text style={styles.fragileText}>F</Text>
            </View>
          )}
        </View>
        <Badge label={ORDER_STATUS_LABELS[order.status].toUpperCase()} bg={badge.bg} color={badge.color} />
      </View>

      <View style={styles.details}>
        <DetailRow icon={<UserIcon size={17} color={C.faint} />} label="Receiver" value={order.receiver} />
        <DetailRow icon={<BranchBuildingIcon size={17} color={C.faint} />} label="Branch" value={order.branch} />
        <DetailRow
          icon={<Text style={styles.rupee}>₹</Text>}
          label="Total Amount"
          value={formatRs(order.amount, 2)}
          valueColor={C.red}
        />
        <DetailRow icon={<PhoneOutlineIcon size={17} color={C.faint} />} label="Phone" value={order.phone} />
      </View>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <PinOutlineIcon size={15} color={C.faint} />
          <Text style={styles.address} numberOfLines={1}>
            {order.address}
          </Text>
        </View>
        <View style={[styles.footerRow, styles.footerBetween]}>
          <View style={styles.footerRow}>
            <ClockIcon size={15} color={C.faint} />
            <Text style={styles.date}>{formatDateTime(order.createdAt)}</Text>
          </View>
          <ChevronRightIcon size={16} color={C.red} />
        </View>
      </View>
    </Card>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <View style={styles.detailIcon}>{icon}</View>
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : null]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.screenBg },
  chipsBar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F2F4' },
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  toolbar: { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 },
  list: { padding: 12, gap: 12, paddingBottom: 110 },
  card: { padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10 },
  cardId: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  orderId: { fontSize: 17, fontWeight: '700', color: C.textStrong, letterSpacing: -0.2 },
  fragile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  fragileText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
  details: { gap: 9, paddingTop: 2 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  detailIcon: { width: 20, alignItems: 'center' },
  rupee: { fontSize: 15, fontWeight: '700', color: C.faint },
  detailLabel: { fontSize: 14, color: C.muted },
  detailValue: { fontSize: 14, fontWeight: '700', color: C.textStrong, flexShrink: 1, textAlign: 'right' },
  footer: { borderTopWidth: 1, borderTopColor: C.divider, marginTop: 12, paddingTop: 10, gap: 6 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  footerBetween: { justifyContent: 'space-between' },
  address: { fontSize: 13, color: '#4B5563', flexShrink: 1 },
  date: { fontSize: 12, color: C.muted },
});
