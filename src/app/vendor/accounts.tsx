import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import {
  BagIcon,
  BalanceIcon,
  BankIcon,
  CalculatorIcon,
  CardIcon,
  CashIcon,
  ChevronRightIcon,
  InfoFilledIcon,
  ReceiptIcon,
  ReturnedIcon,
  SearchIcon,
  SlidersIcon,
  TruckIcon,
} from '@/components/portal/icons';
import {
  Badge,
  Card,
  Chip,
  EmptyState,
  IconTile,
  SearchCountBar,
  ToolButton,
  PortalHeader,
} from '@/components/portal/ui';
import { Text } from '@/components/text';
import { SelectSheet } from '@/components/ui';
import { paymentFigures, type VendorPayment } from '@/data/vendor';
import { useVendorState } from '@/state/vendor-state';
import { makeStyles, useColors } from '@/theme';
import { formatAmount, formatDateTime, formatRs, formatSigned } from '@/utils/format';

type Tab = 'payments' | 'transfers';

const STATUS_FILTERS = ['All payments', 'COD Transfer Pending', 'Completed'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const INFO = {
  title: 'Accounts',
  body: 'Payments shows the cash-on-delivery (COD) collected for each order, the delivery charge, and what is still to be settled. Net = COD − charge − returned. Balance = Net − COD already transferred. COD Transfers lists every settlement made to your account.',
};

const GREEN = '#0F9D58';

export default function AccountsScreen() {
  const styles = useStyles();
  const C = useColors();
  const { payments } = useVendorState();
  const [tab, setTab] = useState<Tab>('payments');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('All payments');
  const [filterSheet, setFilterSheet] = useState(false);

  const q = query.trim();
  const matchesQuery = (p: VendorPayment) => !q || p.orderId.includes(q);
  const matchesFilter = (p: VendorPayment) => {
    if (filter === 'All payments') return true;
    const { completed } = paymentFigures(p);
    return filter === 'Completed' ? completed : !completed;
  };

  const rows =
    tab === 'payments'
      ? payments.filter((p) => matchesQuery(p) && matchesFilter(p))
      : payments.filter((p) => p.codTransferred !== 0 && matchesQuery(p));
  const noun = tab === 'payments' ? 'Payment' : 'Transfer';

  return (
    <View style={styles.screen}>
      <PortalHeader title="Accounts" info={INFO} />

      <View style={styles.top}>
        <View style={styles.tabs} role="tablist">
          <Chip
            label="Payments"
            icon={(color) => <CardIcon size={20} color={color} />}
            active={tab === 'payments'}
            onPress={() => setTab('payments')}
            fill
            style={styles.bigChip}
          />
          <Chip
            label="COD Transfers"
            icon={(color) => <CashIcon size={20} color={color} />}
            active={tab === 'transfers'}
            onPress={() => setTab('transfers')}
            fill
            style={styles.bigChip}
          />
        </View>

        <View style={styles.toolbar}>
          <SearchCountBar
            icon={<ReceiptIcon size={20} color={C.primary} />}
            label={`${rows.length} ${rows.length === 1 ? noun : `${noun}s`}`}
            searching={searching}
            onToggleSearch={() => {
              if (searching) setQuery('');
              setSearching(!searching);
            }}
            query={query}
            onQueryChange={setQuery}
            placeholder="Search order number"
            searchInside={false}
          />
          {!searching && (
            <ToolButton label="Search payments" onPress={() => setSearching(true)}>
              <SearchIcon size={21} color={C.primary} />
            </ToolButton>
          )}
          {tab === 'payments' && (
            <ToolButton label="Filter payments" active={filter !== 'All payments'} onPress={() => setFilterSheet(true)}>
              <SlidersIcon size={20} color={filter !== 'All payments' ? C.primary : '#4B5563'} />
            </ToolButton>
          )}
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(p) => `${tab}-${p.orderId}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (tab === 'payments' ? <PaymentCard payment={item} /> : <TransferCard payment={item} />)}
        ListEmptyComponent={
          <EmptyState
            icon={<ReceiptIcon size={30} color={C.primary} />}
            title={tab === 'payments' ? 'No payments found' : 'No COD transfers yet'}
            message={
              q || filter !== 'All payments'
                ? 'Try another order number or clear the filter.'
                : 'Settlements to your account will be listed here.'
            }
          />
        }
      />

      <SelectSheet
        visible={filterSheet}
        title="Filter payments"
        options={[...STATUS_FILTERS]}
        selected={filter}
        onSelect={(v) => setFilter(v as StatusFilter)}
        onClose={() => setFilterSheet(false)}
        accent={C.primary}
      />
    </View>
  );
}

const openOrder = (orderId: string) => router.navigate({ pathname: '/vendor/orders', params: { q: orderId } });

function OrderPill({ id }: { id: string }) {
  const styles = useStyles();
  const C = useColors();
  return (
    <View style={styles.orderPill}>
      <BagIcon size={16} color={C.primary} />
      <Text style={styles.orderPillText}>#{id}</Text>
    </View>
  );
}

function PaymentCard({ payment: p }: { payment: VendorPayment }) {
  const styles = useStyles();
  const C = useColors();
  const { net, balance, completed } = paymentFigures(p);
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <OrderPill id={p.orderId} />
        {completed ? (
          <Badge label="Completed" bg="#DCFCE7" color="#10B981" />
        ) : (
          <Badge label="COD Transfer Pending" bg="#FEF3C7" color="#D97706" />
        )}
      </View>

      <View style={styles.metrics}>
        <Metric icon={<CashIcon size={17} color={GREEN} />} tint="#E6F4EA" label="COD" value={formatAmount(p.cod)} color={GREEN} />
        <Metric
          icon={<TruckIcon size={17} color="#5F6368" />}
          tint="#F1F3F4"
          label="Charge"
          value={formatAmount(p.charge)}
          color="#374151"
        />
        <Metric
          icon={<ReturnedIcon size={17} color="#E67E22" />}
          tint="#FFF2E2"
          label="Returned"
          value={formatSigned(p.returned)}
          color="#374151"
        />
        <Metric icon={<CalculatorIcon size={17} color={GREEN} />} tint="#E6F4EA" label="Net" value={formatSigned(net)} color={GREEN} />
        <Metric
          icon={<BankIcon size={17} color={GREEN} />}
          tint="#E6F4EA"
          label="COD Transferred"
          value={formatSigned(p.codTransferred)}
          color={GREEN}
        />
        <Metric
          icon={<BalanceIcon size={17} color="#EF4444" />}
          tint="#FEE2E2"
          label="Balance"
          value={formatSigned(balance)}
          color={balance === 0 ? '#374151' : '#EF4444'}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Order detail for ${p.orderId}`}
        onPress={() => openOrder(p.orderId)}
        style={({ pressed }) => [styles.cardFooter, pressed && { backgroundColor: '#F9FAFB' }]}>
        <View style={styles.footerLeft}>
          <InfoFilledIcon size={17} color={C.muted} />
          <Text style={styles.footerText}>Order Detail</Text>
        </View>
        <ChevronRightIcon size={16} color={C.faint} />
      </Pressable>
    </Card>
  );
}

function TransferCard({ payment: p }: { payment: VendorPayment }) {
  const styles = useStyles();
  const C = useColors();
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <OrderPill id={p.orderId} />
        <Badge label="Transferred" bg="#DCFCE7" color="#10B981" />
      </View>
      <View style={styles.transferBody}>
        <IconTile bg="#E6F4EA" size={40} radius={10}>
          <BankIcon size={20} color={GREEN} />
        </IconTile>
        <View style={styles.transferText}>
          <Text style={styles.metricLabel}>Amount settled</Text>
          <Text style={[styles.transferAmount, { color: p.codTransferred < 0 ? '#EF4444' : GREEN }]}>
            {formatRs(p.codTransferred, 2)}
          </Text>
        </View>
        {p.codTransferredAt && <Text style={styles.transferDate}>{formatDateTime(p.codTransferredAt)}</Text>}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Order detail for ${p.orderId}`}
        onPress={() => openOrder(p.orderId)}
        style={({ pressed }) => [styles.cardFooter, pressed && { backgroundColor: '#F9FAFB' }]}>
        <View style={styles.footerLeft}>
          <InfoFilledIcon size={17} color={C.muted} />
          <Text style={styles.footerText}>Order Detail</Text>
        </View>
        <ChevronRightIcon size={16} color={C.faint} />
      </Pressable>
    </Card>
  );
}

function Metric({
  icon,
  tint,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  tint: string;
  label: string;
  value: string;
  color: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.metric} accessible accessibilityLabel={`${label}: ${value}`}>
      <IconTile bg={tint} size={34} radius={9}>
        {icon}
      </IconTile>
      <View style={styles.metricText}>
        <Text style={styles.metricLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
  top: { paddingHorizontal: 14, paddingTop: 14, gap: 12 },
  tabs: { flexDirection: 'row', gap: 10 },
  bigChip: { paddingVertical: 12 },
  toolbar: { flexDirection: 'row', gap: 8 },
  list: { padding: 14, gap: 14, paddingBottom: 40 },
  card: { overflow: 'hidden' },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 8,
  },
  orderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: C.primarySoft,
  },
  orderPillText: { fontSize: 14, fontWeight: '700', color: C.primary },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 8, rowGap: 12 },
  metric: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 8 },
  metricText: { flex: 1 },
  metricLabel: { fontSize: 12, color: C.muted },
  metricValue: { fontSize: 15, fontWeight: '700', marginTop: 1 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.divider,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 6,
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  footerText: { fontSize: 14, fontWeight: '500', color: '#4B5563' },
  transferBody: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  transferText: { flex: 1 },
  transferAmount: { fontSize: 16, fontWeight: '700', marginTop: 1 },
  transferDate: { fontSize: 11, color: C.muted, textAlign: 'right', maxWidth: 110 },
}));
