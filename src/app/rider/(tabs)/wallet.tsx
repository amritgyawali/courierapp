import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BankIcon, CashIcon, CoinsIcon, TrendUpIcon, WalletIcon } from '@/components/portal/icons';
import { Badge, Card, Chip, PortalHeader, SectionHeading } from '@/components/portal/ui';
import { Button, KeyValue, ProgressBar, Sheet, TextField, useNow, useToast } from '@/components/portal/widgets';
import { useRider } from '@/components/rider/use-rider';
import { PortalColors as C, shadow } from '@/constants/theme';
import { RIDER_PAY, riderEarnings } from '@/data/ops';
import { addDays, formatDate, formatRs, formatTime, isSameDay, startOfDay, timeAgo } from '@/utils/format';

type Tab = 'cod' | 'earnings';
type Period = 'today' | 'week' | 'month';

const INFO = {
  title: 'Wallet',
  body: 'COD shows the cash you have collected and not yet handed over. Deposit it at your hub; finance verifies each deposit. Earnings shows what you have made per delivery, pickup and return, plus daily target bonuses.',
};

export default function RiderWallet() {
  const now = useNow();
  const { data, dispatch, me, hub, stats, actor } = useRider(now);
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('cod');
  const [period, setPeriod] = useState<Period>('today');
  const [depositOpen, setDepositOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  const limit = data.settings.riderCashLimit;
  const cashPct = Math.round((stats.cashInHand / limit) * 100);
  const collectionsToday = data.shipments
    .filter((s) => s.pod?.riderId === me.id && s.pod.collected > 0 && isSameDay(new Date(s.pod.at), now))
    .sort((a, b) => b.pod!.at.localeCompare(a.pod!.at));
  const deposits = data.deposits.filter((d) => d.riderId === me.id).slice(0, 10);

  const from = period === 'today' ? startOfDay(now) : period === 'week' ? addDays(startOfDay(now), -6) : addDays(startOfDay(now), -29);
  const earnings = riderEarnings(data, me.id, from, now);
  const todayDeliveries = stats.deliveredToday;
  const targetPct = Math.round((todayDeliveries / RIDER_PAY.dailyTarget) * 100);

  const openDeposit = () => {
    setAmount(String(stats.cashInHand));
    setReference('');
    setError('');
    setDepositOpen(true);
  };

  const submitDeposit = () => {
    const value = Number(amount.replace(/[^0-9]/g, ''));
    if (!value) return setError('Enter the amount you are handing over.');
    if (value > stats.cashInHand) return setError(`You only hold ${formatRs(stats.cashInHand)}.`);
    if (reference.trim().length < 3) return setError('Enter the hub receipt number.');
    dispatch({ type: 'deposit', riderId: me.id, amount: value, reference: reference.trim().toUpperCase(), actor });
    toast(`${formatRs(value)} deposited — awaiting verification`);
    setDepositOpen(false);
  };

  return (
    <View style={styles.screen}>
      <PortalHeader title="Wallet" info={INFO} />
      <View style={styles.tabs} role="tablist">
        <Chip variant="tint" fill label="COD cash" icon={(c) => <CashIcon size={17} color={c} />} active={tab === 'cod'} onPress={() => setTab('cod')} />
        <Chip variant="tint" fill label="Earnings" icon={(c) => <TrendUpIcon size={17} color={c} />} active={tab === 'earnings'} onPress={() => setTab('earnings')} />
      </View>

      {tab === 'cod' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>Cash in hand</Text>
            <Text style={styles.heroValue}>{formatRs(stats.cashInHand)}</Text>
            <ProgressBar value={cashPct} color="#FFFFFF" track="rgba(255,255,255,0.25)" />
            <Text style={styles.heroMeta}>
              {cashPct >= 100 ? 'Over the limit — deposit now' : `${formatRs(Math.max(0, limit - stats.cashInHand))} left before the ${formatRs(limit)} limit`}
            </Text>
            <Button title={`Deposit at ${hub.name}`} variant="outline" onPress={openDeposit} disabled={stats.cashInHand <= 0} style={styles.heroButton} />
          </View>

          <View style={styles.row}>
            <MiniStat label="Collected today" value={formatRs(stats.codCollectedToday)} />
            <MiniStat label="Awaiting verification" value={formatRs(stats.pendingDeposit)} color={C.amber} />
            <MiniStat label="Still to collect" value={formatRs(stats.codToCollect)} color={C.red} />
          </View>

          <SectionHeading icon={<CoinsIcon size={20} color={C.red} />} title="Today’s collections" />
          <Card>
            {collectionsToday.length === 0 && <Text style={styles.empty}>No COD collected yet today.</Text>}
            {collectionsToday.map((s, i) => (
              <View key={s.id} style={[styles.line, i > 0 && styles.divider]}>
                <View style={styles.flex}>
                  <Text style={styles.lineTitle}>{s.receiver.name}</Text>
                  <Text style={styles.lineMeta}>
                    {s.id} · {formatTime(s.pod!.at)} · {s.pod!.method === 'cash' ? 'Cash' : 'Online'}
                  </Text>
                </View>
                <Text style={styles.lineValue}>{formatRs(s.pod!.collected)}</Text>
              </View>
            ))}
          </Card>

          <SectionHeading icon={<BankIcon size={20} color={C.red} />} title="Deposits" />
          <Card>
            {deposits.length === 0 && <Text style={styles.empty}>No deposits yet.</Text>}
            {deposits.map((d, i) => (
              <View key={d.id} style={[styles.line, i > 0 && styles.divider]}>
                <View style={styles.flex}>
                  <Text style={styles.lineTitle}>{formatRs(d.amount)}</Text>
                  <Text style={styles.lineMeta}>
                    {d.reference} · {timeAgo(d.at, now)}
                  </Text>
                </View>
                <Badge
                  label={d.status.toUpperCase()}
                  bg={d.status === 'verified' ? '#DCFCE7' : d.status === 'pending' ? '#FEF3C7' : '#FEE2E2'}
                  color={d.status === 'verified' ? '#15803D' : d.status === 'pending' ? '#B45309' : '#B91C1C'}
                />
              </View>
            ))}
          </Card>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.row} role="tablist">
            <Chip variant="neutral" fill label="Today" active={period === 'today'} onPress={() => setPeriod('today')} />
            <Chip variant="neutral" fill label="7 days" active={period === 'week'} onPress={() => setPeriod('week')} />
            <Chip variant="neutral" fill label="30 days" active={period === 'month'} onPress={() => setPeriod('month')} />
          </View>

          <View style={[styles.hero, styles.earnHero]}>
            <Text style={styles.heroLabel}>Earnings {period === 'today' ? 'today' : period === 'week' ? 'last 7 days' : 'last 30 days'}</Text>
            <Text style={styles.heroValue}>{formatRs(earnings.total)}</Text>
            <Text style={styles.heroMeta}>Paid weekly to your bank account</Text>
          </View>

          <Card style={styles.card}>
            <KeyValue label={`Deliveries × ${formatRs(RIDER_PAY.delivery)}`} value={`${earnings.deliveries} · ${formatRs(earnings.deliveries * RIDER_PAY.delivery)}`} />
            <KeyValue label={`Pickups × ${formatRs(RIDER_PAY.pickup)}`} value={`${earnings.pickups} · ${formatRs(earnings.pickups * RIDER_PAY.pickup)}`} />
            <KeyValue label={`Returns × ${formatRs(RIDER_PAY.return)}`} value={`${earnings.returns} · ${formatRs(earnings.returns * RIDER_PAY.return)}`} />
            <KeyValue label="Target bonuses" value={formatRs(earnings.bonus)} valueColor="#16A34A" />
            <KeyValue label="Total" value={formatRs(earnings.total)} bold />
          </Card>

          <Card style={styles.card}>
            <View style={styles.targetTop}>
              <WalletIcon size={20} color={C.red} />
              <Text style={styles.targetTitle}>Today’s target</Text>
              <Text style={styles.targetValue}>
                {todayDeliveries}/{RIDER_PAY.dailyTarget}
              </Text>
            </View>
            <ProgressBar value={targetPct} color={targetPct >= 100 ? '#16A34A' : C.red} height={10} />
            <Text style={styles.lineMeta}>
              {targetPct >= 100
                ? `Target reached — ${formatRs(RIDER_PAY.targetBonus)} bonus earned!`
                : `${RIDER_PAY.dailyTarget - todayDeliveries} more deliveries for a ${formatRs(RIDER_PAY.targetBonus)} bonus.`}
            </Text>
          </Card>

          {earnings.days.length > 0 && (
            <>
              <SectionHeading icon={<TrendUpIcon size={20} color={C.red} />} title="By day" />
              <Card>
                {earnings.days.map((d, i) => (
                  <View key={d.day.toISOString()} style={[styles.line, i > 0 && styles.divider]}>
                    <Text style={[styles.lineTitle, styles.flex]}>{isSameDay(d.day, now) ? 'Today' : formatDate(d.day)}</Text>
                    <Text style={styles.lineValue}>{formatRs(d.total)}</Text>
                  </View>
                ))}
              </Card>
            </>
          )}
        </ScrollView>
      )}

      <Sheet
        visible={depositOpen}
        title="Deposit cash at hub"
        subtitle={`${hub.name} · hand the cash to the hub cashier`}
        onClose={() => setDepositOpen(false)}
        footer={<Button title="Submit deposit" onPress={submitDeposit} />}>
        <TextField label="Amount (Rs.)" value={amount} onChangeText={setAmount} keyboardType="number-pad" hint={`You hold ${formatRs(stats.cashInHand)}`} />
        <TextField label="Hub receipt number" value={reference} onChangeText={setReference} autoCapitalize="characters" placeholder="e.g. RCPT-2291" error={error} />
      </Sheet>
    </View>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.mini}>
      <Text style={[styles.miniValue, color ? { color } : null]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  tabs: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F2F4' },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  hero: { backgroundColor: C.red, borderRadius: 16, padding: 18, gap: 8, boxShadow: shadow(2, 10, 0.18, C.red) },
  earnHero: { backgroundColor: '#0F766E', boxShadow: shadow(2, 10, 0.18, '#0F766E') },
  heroLabel: { color: '#FFFFFF', opacity: 0.9, fontSize: 13, fontWeight: '600' },
  heroValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
  heroMeta: { color: '#FFFFFF', opacity: 0.9, fontSize: 12 },
  heroButton: { marginTop: 6 },
  row: { flexDirection: 'row', gap: 8 },
  mini: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: C.cardBorder, padding: 10 },
  miniValue: { fontSize: 15, fontWeight: '800', color: C.textStrong },
  miniLabel: { fontSize: 11, color: C.muted, marginTop: 2 },
  card: { padding: 14, gap: 8 },
  empty: { fontSize: 13, color: C.muted, padding: 14 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: C.divider },
  lineTitle: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  lineMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
  lineValue: { fontSize: 14, fontWeight: '800', color: '#16A34A' },
  targetTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  targetTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: C.textStrong },
  targetValue: { fontSize: 16, fontWeight: '800', color: C.textStrong },
});
