import { type Href, router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import {
  AlertTriangleIcon,
  BikeIcon,
  CalculatorOutlineIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CubeIcon,
  DispatchIcon,
  DownloadIcon,
  MegaphoneOutlineIcon,
  MessageIcon,
  ReportIcon,
  ScanIcon,
  SearchIcon,
  StoreSmallIcon,
  TruckIcon,
  WalletIcon,
} from '@/components/portal/icons';
import { ScannerModal } from '@/components/portal/scanner';
import { Card, HeaderIconButton, PortalHeader, SectionHeading } from '@/components/portal/ui';
import { Avatar, BarChart, ProgressBar, ProgressRing, StatTile, useNow, useToast } from '@/components/portal/widgets';
import { Text, TextInput } from '@/components/text';
import { approvals, dailyVolume, DUTY_META, financeSummary, hubStats, riderStats, successRate, todaySummary } from '@/data/ops';
import { makeStyles, shadow, useColors } from '@/theme';
import { formatDate, formatRs, formatShortDate, greeting, initials } from '@/utils/format';

export default function AdminDashboard() {
  const styles = useStyles();
  const C = useColors();
  const { data, me, lookup } = useAdmin();
  const toast = useToast();
  const now = useNow(60000);
  const [scanning, setScanning] = useState(false);
  const [query, setQuery] = useState('');

  const today = todaySummary(data, now);
  const week = successRate(data, 7, now);
  const volume = dailyVolume(data, 7, now);
  const finance = financeSummary(data, now);
  const pending = approvals(data);

  const topRiders = data.riders
    .filter((r) => r.active)
    .map((r) => ({ rider: r, stats: riderStats(data, r.id, now) }))
    .sort((a, b) => b.stats.deliveredToday - a.stats.deliveredToday || b.stats.successRate - a.stats.successRate)
    .slice(0, 3);

  const hubs = data.hubs
    .map((h) => ({ hub: h, stats: hubStats(data, h.id, now) }))
    .sort((a, b) => b.stats.load - a.stats.load)
    .slice(0, 4);

  const onScan = (code: string) => {
    setScanning(false);
    const hit = data.shipments.find((s) => s.id === code);
    if (hit) router.push({ pathname: '/admin/shipment/[id]', params: { id: hit.id } });
    else toast(`No shipment found for ${code}`, 'error');
  };

  const search = () => {
    const q = query.trim();
    if (!q) return;
    const exact = data.shipments.find((s) => s.id === q.toUpperCase());
    if (exact) router.push({ pathname: '/admin/shipment/[id]', params: { id: exact.id } });
    else router.navigate({ pathname: '/admin/shipments', params: { q } });
    setQuery('');
  };

  const firstName = me.name.split(' ')[0];

  return (
    <View style={styles.screen}>
      <PortalHeader
        right={
          <HeaderIconButton label="Scan parcel" onPress={() => setScanning(true)}>
            <ScanIcon size={25} color="#FFFFFF" />
          </HeaderIconButton>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Greeting */}
        <View style={styles.greeting}>
          <View style={styles.greetingAvatar}>
            <Text style={styles.greetingInitials}>{initials(me.name)}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.greetingTitle}>
              {greeting(now).replace('!', ',')} {firstName}!
            </Text>
            <Text style={styles.greetingSub}>Operations overview · {formatDate(now)}</Text>
          </View>
        </View>

        {/* Global search */}
        <View style={styles.search}>
          <SearchIcon size={19} color={C.faint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            returnKeyType="search"
            placeholder="Tracking ID, phone, receiver or merchant"
            placeholderTextColor={C.faint}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.searchInput}
            accessibilityLabel="Search shipments"
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Scan parcel" hitSlop={8} onPress={() => setScanning(true)}>
            <ScanIcon size={20} color={C.primary} />
          </Pressable>
        </View>

        {/* Today */}
        <View style={styles.row}>
          <StatTile
            icon={<CubeIcon size={20} color="#3B82F6" />}
            tint="#EFF6FF"
            value={today.booked}
            label="Booked today"
            onPress={() => router.navigate('/admin/shipments')}
          />
          <StatTile
            icon={<CheckCircleIcon size={20} color="#16A34A" />}
            tint="#ECFDF5"
            value={today.delivered}
            label="Delivered today"
            note={`${today.successRate}% success`}
            noteColor="#16A34A"
            onPress={() => router.navigate({ pathname: '/admin/shipments', params: { filter: 'delivered' } })}
          />
        </View>
        <View style={styles.row}>
          <StatTile
            icon={<TruckIcon size={20} color="#2B6CB0" />}
            tint="#E9F2FE"
            value={today.outForDelivery}
            label="Out for delivery"
            onPress={() => router.navigate({ pathname: '/admin/shipments', params: { filter: 'out-for-delivery' } })}
          />
          <StatTile
            icon={<StoreSmallIcon size={20} color="#4F46E5" />}
            tint="#EEF2FF"
            value={today.pickupsPending}
            label="Pickups pending"
            onPress={() => router.navigate({ pathname: '/admin/shipments', params: { filter: 'pickups' } })}
          />
        </View>
        <View style={styles.row}>
          <StatTile
            icon={<DispatchIcon size={20} color={C.primary} />}
            tint={C.primarySoft}
            value={today.unassigned}
            label="Unassigned"
            note="Needs a rider"
            noteColor={C.primary}
            onPress={() => router.navigate('/admin/dispatch')}
          />
          <StatTile
            icon={<AlertTriangleIcon size={20} color="#DC2626" />}
            tint="#FEF2F2"
            value={today.overdue}
            label="SLA breached"
            note={today.overdue ? 'Act now' : 'All on time'}
            noteColor={today.overdue ? '#DC2626' : '#16A34A'}
            onPress={() => router.navigate({ pathname: '/admin/shipments', params: { filter: 'overdue' } })}
          />
        </View>

        {/* Performance */}
        <SectionHeading icon={<ReportIcon size={20} color={C.primary} filled />} title="Performance (7 days)" />
        <Card style={styles.perf}>
          <ProgressRing value={week.rate} label="success" color={week.rate >= 90 ? '#16A34A' : week.rate >= 75 ? C.amber : '#DC2626'} />
          <View style={styles.perfStats}>
            <PerfLine label="Delivered" value={week.delivered} color="#16A34A" />
            <PerfLine label="Failed attempts" value={week.failed} color="#DC2626" />
            <PerfLine label="At hub now" value={today.atHub} color="#7E22CE" />
            <PerfLine label="Returns in transit" value={today.returns} color="#B45309" />
          </View>
        </Card>

        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Shipments, last 7 days</Text>
          <BarChart
            data={volume.map((d, i) => ({
              label: i === volume.length - 1 ? 'Today' : formatShortDate(d.day).split(' ')[1],
              values: [d.booked, d.delivered],
              highlight: i === volume.length - 1,
            }))}
            colors={[C.primary, '#16A34A']}
            legend={['Booked', 'Delivered']}
          />
        </Card>

        {/* Money */}
        <SectionHeading icon={<WalletIcon size={20} color={C.primary} />} title="Money" />
        <View style={styles.row}>
          <MoneyTile label="Revenue today" value={formatRs(today.chargesToday)} color="#0F766E" />
          <MoneyTile label="COD collected today" value={formatRs(today.codToday)} color="#16A34A" />
        </View>
        <View style={styles.row}>
          <MoneyTile label="COD with riders" value={formatRs(finance.codWithRiders)} color={C.amber} onPress={() => router.navigate('/admin/finance')} />
          <MoneyTile
            label="Payouts pending"
            value={formatRs(finance.payoutsPendingAmount)}
            color={C.primary}
            onPress={() => router.navigate({ pathname: '/admin/finance', params: { tab: 'payouts' } })}
          />
        </View>

        {/* Needs attention */}
        <SectionHeading icon={<AlertTriangleIcon size={20} color={C.primary} />} title="Needs attention" />
        <Card>
          <AttentionRow icon={<BikeIcon size={19} color="#4F46E5" />} tint="#EEF2FF" label="Rider KYC to review" count={pending.riders} href={{ pathname: '/admin/riders', params: { filter: 'kyc' } }} />
          <AttentionRow icon={<StoreSmallIcon size={19} color="#0369A1" />} tint="#E0F2FE" label="Merchant KYC to review" count={pending.merchants} href={{ pathname: '/admin/merchants', params: { filter: 'pending' } }} />
          <AttentionRow icon={<WalletIcon size={19} color="#B45309" />} tint="#FEF3C7" label="COD deposits to verify" count={pending.deposits} href={{ pathname: '/admin/finance', params: { tab: 'deposits' } }} />
          <AttentionRow icon={<MessageIcon size={19} color={C.primary} />} tint={C.primarySoft} label="Open support tickets" count={pending.tickets} href="/admin/tickets" />
          <AttentionRow icon={<AlertTriangleIcon size={19} color="#DC2626" />} tint="#FEF2F2" label="Failed deliveries to resolve" count={today.failed} href="/admin/exceptions" last />
        </Card>

        {/* Riders */}
        <SectionHeading
          icon={<BikeIcon size={20} color={C.primary} />}
          title="Top riders today"
          right={
            <Pressable accessibilityRole="button" onPress={() => router.navigate('/admin/riders')} hitSlop={8}>
              <Text style={styles.link}>See all</Text>
            </Pressable>
          }
        />
        <Card>
          {topRiders.map(({ rider, stats }, i) => (
            <Pressable
              key={rider.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/admin/rider/[id]', params: { id: rider.id } })}
              style={({ pressed }) => [styles.riderRow, i > 0 && styles.divider, pressed && styles.pressed]}>
              <Text style={styles.rank}>#{i + 1}</Text>
              <Avatar name={rider.name} size={40} status={DUTY_META[rider.duty].color} />
              <View style={styles.flex}>
                <Text style={styles.riderName}>{rider.name}</Text>
                <Text style={styles.riderMeta}>
                  {lookup.hub.get(rider.hubId)?.name} · {stats.successRate}% success
                </Text>
              </View>
              <View style={styles.riderCount}>
                <Text style={styles.riderCountValue}>{stats.deliveredToday}</Text>
                <Text style={styles.riderCountLabel}>delivered</Text>
              </View>
            </Pressable>
          ))}
        </Card>

        {/* Hubs */}
        <SectionHeading
          icon={<CubeIcon size={20} color={C.primary} />}
          title="Hub load today"
          right={
            <Pressable accessibilityRole="button" onPress={() => router.navigate('/admin/hubs')} hitSlop={8}>
              <Text style={styles.link}>All hubs</Text>
            </Pressable>
          }
        />
        <Card style={styles.hubCard}>
          {hubs.map(({ hub, stats }) => (
            <View key={hub.id} style={styles.hubRow}>
              <View style={styles.hubTop}>
                <Text style={styles.hubName}>{hub.name}</Text>
                <Text style={styles.hubMeta}>
                  {stats.today}/{hub.capacity} · backlog {stats.backlog}
                </Text>
              </View>
              <ProgressBar value={stats.load} color={stats.load > 85 ? '#DC2626' : stats.load > 60 ? C.amber : '#16A34A'} />
            </View>
          ))}
        </Card>

        {/* Quick actions */}
        <SectionHeading icon={<DispatchIcon size={20} color={C.primary} />} title="Quick actions" />
        <View style={styles.actions}>
          <QuickAction icon={<DispatchIcon size={22} color={C.primary} />} label="Assign parcels" onPress={() => router.navigate('/admin/dispatch')} />
          <QuickAction icon={<MegaphoneOutlineIcon size={22} color={C.primary} />} label="Broadcast" onPress={() => router.navigate('/admin/announcements')} />
          <QuickAction icon={<CalculatorOutlineIcon size={22} color={C.primary} />} label="Rate calculator" onPress={() => router.navigate('/admin/rates')} />
          <QuickAction icon={<DownloadIcon size={22} color={C.primary} />} label="Export report" onPress={() => router.navigate('/admin/reports')} />
        </View>
      </ScrollView>

      <ScannerModal visible={scanning} onClose={() => setScanning(false)} onScan={onScan} title="Find a parcel" />
    </View>
  );
}

function PerfLine({ label, value, color }: { label: string; value: number; color: string }) {
  const styles = useStyles();
  return (
    <View style={styles.perfLine}>
      <View style={[styles.perfDot, { backgroundColor: color }]} />
      <Text style={styles.perfLabel}>{label}</Text>
      <Text style={styles.perfValue}>{value}</Text>
    </View>
  );
}

function MoneyTile({ label, value, color, onPress }: { label: string; value: string; color: string; onPress?: () => void }) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label}: ${value}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.money, pressed && styles.pressed]}>
      <Text style={styles.moneyLabel}>{label}</Text>
      <Text style={[styles.moneyValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </Pressable>
  );
}

function AttentionRow({
  icon,
  tint,
  label,
  count,
  href,
  last,
}: {
  icon: ReactNode;
  tint: string;
  label: string;
  count: number;
  href: Href;
  last?: boolean;
}) {
  const styles = useStyles();
  const C = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${count}`}
      onPress={() => router.navigate(href)}
      style={({ pressed }) => [styles.attention, !last && styles.attentionDivider, pressed && styles.pressed]}>
      <View style={[styles.attentionIcon, { backgroundColor: tint }]}>{icon}</View>
      <Text style={styles.attentionLabel}>{label}</Text>
      <View style={[styles.countPill, count === 0 && styles.countPillZero]}>
        <Text style={[styles.countText, count === 0 && styles.countTextZero]}>{count}</Text>
      </View>
      <ChevronRightIcon size={16} color={C.faint} />
    </Pressable>
  );
}

function QuickAction({ icon, label, onPress }: { icon: ReactNode; label: string; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quick, pressed && styles.pressed]}>
      <View style={styles.quickIcon}>{icon}</View>
      <Text style={styles.quickLabel} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  flex: { flex: 1 },
  pressed: { opacity: 0.75 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 14, gap: 12, paddingBottom: 40 },
  greeting: {
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    boxShadow: shadow(1, 4, 0.1),
  },
  greetingAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingInitials: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  greetingTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  greetingSub: { color: '#FFFFFF', opacity: 0.9, fontSize: 13, marginTop: 3 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDEEF1',
    paddingHorizontal: 14,
    minHeight: 48,
    boxShadow: shadow(1, 3, 0.04),
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text, paddingVertical: 10, outlineWidth: 0 },
  row: { flexDirection: 'row', gap: 12 },
  perf: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 16 },
  perfStats: { flex: 1, gap: 8 },
  perfLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  perfDot: { width: 8, height: 8, borderRadius: 4 },
  perfLabel: { flex: 1, fontSize: 13, color: C.muted },
  perfValue: { fontSize: 14, fontWeight: '800', color: C.textStrong },
  chartCard: { padding: 16, gap: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  money: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 14,
    boxShadow: shadow(1, 6, 0.05),
  },
  moneyLabel: { fontSize: 12, color: C.muted, fontWeight: '500' },
  moneyValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  attention: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  attentionDivider: { borderBottomWidth: 1, borderBottomColor: C.divider },
  attentionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  attentionLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: C.text },
  countPill: { minWidth: 28, paddingHorizontal: 8, height: 24, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  countPillZero: { backgroundColor: '#E5E7EB' },
  countText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  countTextZero: { color: C.muted },
  link: { fontSize: 13, fontWeight: '700', color: C.primary },
  riderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: C.divider },
  rank: { width: 26, fontSize: 13, fontWeight: '800', color: C.faint },
  riderName: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  riderMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
  riderCount: { alignItems: 'center' },
  riderCountValue: { fontSize: 18, fontWeight: '800', color: '#16A34A' },
  riderCountLabel: { fontSize: 10, color: C.muted, fontWeight: '600' },
  hubCard: { padding: 14, gap: 14 },
  hubRow: { gap: 6 },
  hubTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  hubName: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  hubMeta: { fontSize: 12, color: C.muted },
  actions: { flexDirection: 'row', gap: 10 },
  quick: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 8,
    boxShadow: shadow(1, 6, 0.05),
  },
  quickIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.primaryTint, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 12, fontWeight: '600', color: C.text, textAlign: 'center' },
}));
