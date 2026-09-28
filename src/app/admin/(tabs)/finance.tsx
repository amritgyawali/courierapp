import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { BankIcon, CashIcon, CoinsIcon, ReceiptIcon, StoreSmallIcon, TrendUpIcon, WalletIcon } from '@/components/portal/icons';
import { Badge, Card, Chip, EmptyState, PortalHeader } from '@/components/portal/ui';
import { Avatar, BarChart, Button, Sheet, StatTile, TextField, useToast } from '@/components/portal/widgets';
import { PortalColors as C } from '@/constants/theme';
import { dailyVolume, deliveredOn, financeSummary, type Payout } from '@/data/ops';
import { formatDate, formatDateTime, formatRs, formatShortDate, timeAgo } from '@/utils/format';

type Tab = 'overview' | 'deposits' | 'payouts';

const INFO = {
  title: 'Finance & COD',
  body: 'Revenue is the delivery charge on completed and returned parcels. Riders hand collected cash (COD) to their hub; verify each deposit here. Merchant payouts settle delivered COD minus charges.',
};

export default function FinanceScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const { data, dispatch, actor, lookup } = useAdmin();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>((params.tab as Tab) ?? 'overview');
  const [seen, setSeen] = useState(params.tab);
  if (params.tab !== seen) {
    setSeen(params.tab);
    if (params.tab) setTab(params.tab as Tab);
  }
  const [paying, setPaying] = useState<Payout | null>(null);
  const [reference, setReference] = useState('');

  const f = financeSummary(data);
  const days = dailyVolume(data, 7).map((d) => ({
    ...d,
    revenue: deliveredOn(data, d.day).reduce((sum, s) => sum + s.charge, 0),
  }));

  const deposits = [...data.deposits].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || b.at.localeCompare(a.at));
  const payouts = [...data.payouts].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || b.periodEnd.localeCompare(a.periodEnd));

  const confirmPayout = () => {
    if (!paying || !reference.trim()) return;
    dispatch({ type: 'payout', id: paying.id, reference: reference.trim(), actor });
    toast(`Payout ${paying.id} marked as paid`);
    setPaying(null);
    setReference('');
  };

  return (
    <View style={styles.screen}>
      <PortalHeader title="Finance" info={INFO} />
      <View style={styles.tabs} role="tablist">
        <Chip variant="tint" fill label="Overview" active={tab === 'overview'} onPress={() => setTab('overview')} />
        <Chip variant="tint" fill label={`Deposits · ${f.depositsToVerify}`} active={tab === 'deposits'} onPress={() => setTab('deposits')} />
        <Chip variant="tint" fill label={`Payouts · ${f.payoutsPending}`} active={tab === 'payouts'} onPress={() => setTab('payouts')} />
      </View>

      {tab === 'overview' && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.row}>
            <StatTile icon={<TrendUpIcon size={20} color="#0F766E" />} tint="#F0FDFA" value={formatRs(f.revenue)} label="Revenue" note="Charges earned" />
            <StatTile icon={<CashIcon size={20} color="#16A34A" />} tint="#ECFDF5" value={formatRs(f.codCollected)} label="COD collected" />
          </View>
          <View style={styles.row}>
            <StatTile
              icon={<CoinsIcon size={20} color={C.amber} />}
              tint="#FFFBEB"
              value={formatRs(f.codWithRiders)}
              label="COD with riders"
              note={`${formatRs(f.depositsToVerifyAmount)} to verify`}
              noteColor={C.amber}
              onPress={() => setTab('deposits')}
            />
            <StatTile
              icon={<BankIcon size={20} color={C.red} />}
              tint={C.redSoft}
              value={formatRs(f.payoutsPendingAmount)}
              label="Payouts due"
              note={`${formatRs(f.paidOut)} paid so far`}
              onPress={() => setTab('payouts')}
            />
          </View>
          <Card style={styles.chart}>
            <Text style={styles.cardTitle}>Delivery revenue, last 7 days</Text>
            <BarChart
              data={days.map((d, i) => ({
                label: i === days.length - 1 ? 'Today' : formatShortDate(d.day).split(' ')[1],
                values: [d.revenue],
                highlight: i === days.length - 1,
              }))}
              colors={['#0F766E']}
            />
            <Text style={styles.chartNote}>Total {formatRs(days.reduce((s, d) => s + d.revenue, 0))} this week</Text>
          </Card>
        </ScrollView>
      )}

      {tab === 'deposits' && (
        <FlatList
          data={deposits}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.content}
          renderItem={({ item: d }) => {
            const rider = lookup.rider.get(d.riderId);
            return (
              <Card style={styles.card}>
                <View style={styles.head}>
                  <Avatar name={rider?.name ?? d.riderId} size={42} />
                  <View style={styles.flex}>
                    <Text style={styles.title}>{rider?.name ?? d.riderId}</Text>
                    <Text style={styles.meta}>
                      {d.reference} · {timeAgo(d.at)}
                    </Text>
                  </View>
                  <Text style={styles.amount}>{formatRs(d.amount)}</Text>
                </View>
                {d.status === 'pending' ? (
                  <View style={styles.actions}>
                    <Button
                      compact
                      variant="danger"
                      title="Reject"
                      style={styles.flex}
                      onPress={() => {
                        dispatch({ type: 'reviewDeposit', id: d.id, approve: false, actor });
                        toast(`Deposit ${d.id} rejected`, 'info');
                      }}
                    />
                    <Button
                      compact
                      variant="success"
                      title="Verify cash received"
                      style={styles.flex2}
                      onPress={() => {
                        dispatch({ type: 'reviewDeposit', id: d.id, approve: true, actor });
                        toast(`${formatRs(d.amount)} from ${rider?.name ?? d.riderId} verified`);
                      }}
                    />
                  </View>
                ) : (
                  <View style={styles.statusRow}>
                    <Badge
                      label={d.status === 'verified' ? 'VERIFIED' : 'REJECTED'}
                      bg={d.status === 'verified' ? '#DCFCE7' : '#FEE2E2'}
                      color={d.status === 'verified' ? '#15803D' : '#B91C1C'}
                    />
                    {d.reviewedAt && <Text style={styles.meta}>{formatDateTime(d.reviewedAt)}</Text>}
                  </View>
                )}
              </Card>
            );
          }}
          ListEmptyComponent={<EmptyState icon={<WalletIcon size={30} color={C.red} />} title="No deposits yet" message="Rider cash deposits will appear here." />}
        />
      )}

      {tab === 'payouts' && (
        <FlatList
          data={payouts}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.content}
          renderItem={({ item: p }) => {
            const m = lookup.merchant.get(p.merchantId);
            return (
              <Card style={styles.card}>
                <View style={styles.head}>
                  <View style={styles.merchantIcon}>
                    <StoreSmallIcon size={20} color={C.red} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.title}>{m?.name ?? p.merchantId}</Text>
                    <Text style={styles.meta}>
                      {p.id} · {p.shipments} deliveries · to {formatDate(new Date(p.periodEnd))}
                    </Text>
                  </View>
                  <Text style={styles.amount}>{formatRs(p.amount)}</Text>
                </View>
                {p.status === 'pending' ? (
                  <Button compact title="Mark as paid" icon={(c) => <ReceiptIcon size={16} color={c} />} onPress={() => setPaying(p)} />
                ) : (
                  <View style={styles.statusRow}>
                    <Badge label="PAID" bg="#DCFCE7" color="#15803D" />
                    <Text style={styles.meta}>
                      {p.reference} · {p.paidAt ? formatDate(new Date(p.paidAt)) : ''}
                    </Text>
                  </View>
                )}
              </Card>
            );
          }}
          ListEmptyComponent={<EmptyState icon={<BankIcon size={30} color={C.red} />} title="No payouts" message="Weekly merchant settlements appear here." />}
        />
      )}

      <Sheet
        visible={!!paying}
        title="Confirm payout"
        subtitle={paying ? `${lookup.merchant.get(paying.merchantId)?.name} · ${formatRs(paying.amount)}` : undefined}
        onClose={() => setPaying(null)}
        footer={<Button title="Confirm payment" disabled={!reference.trim()} onPress={confirmPayout} />}>
        <TextField
          label="Bank transfer reference"
          placeholder="e.g. NIBL-482910"
          value={reference}
          onChangeText={setReference}
          autoCapitalize="characters"
          hint="Recorded in the audit log and shared with the merchant."
        />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex2: { flex: 2 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  tabs: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F2F4' },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 12 },
  chart: { padding: 16, gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  chartNote: { fontSize: 12, color: C.muted, textAlign: 'center' },
  card: { padding: 14, gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  meta: { fontSize: 12, color: C.muted, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '800', color: C.textStrong },
  actions: { flexDirection: 'row', gap: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  merchantIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.redTint, alignItems: 'center', justifyContent: 'center' },
});
