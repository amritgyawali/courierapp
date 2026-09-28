import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { ShipmentCard } from '@/components/ops/shipment';
import { BikeIcon, MessageIcon, PhoneOutlineIcon, ShieldCheckIcon } from '@/components/portal/icons';
import { Badge, Card, EmptyState, PortalHeader } from '@/components/portal/ui';
import { Avatar, Button, KeyValue, ProgressBar, useNow, useToast } from '@/components/portal/widgets';
import { PortalColors as C } from '@/constants/theme';
import { DUTY_META, KYC_META, riderEarnings, riderStats } from '@/data/ops';
import { addDays, formatDate, formatDuration, formatRs, timeAgo } from '@/utils/format';
import { callPhone, sendSms } from '@/utils/links';

export default function AdminRiderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, dispatch, actor, lookup } = useAdmin();
  const toast = useToast();
  const now = useNow();

  const rider = data.riders.find((r) => r.id === id);
  if (!rider) {
    return (
      <View style={styles.screen}>
        <PortalHeader title="Rider" back backHref="/admin/riders" />
        <EmptyState icon={<BikeIcon size={30} color={C.red} />} title="Rider not found" message={`No rider with ID ${id}.`} />
      </View>
    );
  }

  const stats = riderStats(data, rider.id, now);
  const week = riderEarnings(data, rider.id, addDays(now, -6), now);
  const duty = DUTY_META[rider.duty];
  const cashPct = Math.round((stats.codHeld / data.settings.riderCashLimit) * 100);
  const deposits = data.deposits.filter((d) => d.riderId === rider.id).slice(0, 5);

  return (
    <View style={styles.screen}>
      <PortalHeader title="Rider profile" back backHref="/admin/riders" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profile}>
          <Avatar name={rider.name} size={64} status={rider.active ? duty.color : '#9CA3AF'} />
          <Text style={styles.name}>{rider.name}</Text>
          <Text style={styles.meta}>
            {rider.id} · {lookup.hub.get(rider.hubId)?.name}
          </Text>
          <View style={styles.badges}>
            <Badge label={rider.active ? duty.label.toUpperCase() : 'SUSPENDED'} bg={rider.active ? '#F1F5F9' : '#F3F4F6'} color={rider.active ? duty.color : '#6B7280'} />
            <Badge label={KYC_META[rider.kyc].label.toUpperCase()} bg={KYC_META[rider.kyc].bg} color={KYC_META[rider.kyc].color} />
            <Badge label={`★ ${rider.rating.toFixed(1)}`} bg="#FFFBEB" color="#B45309" />
          </View>
          {rider.shiftStartedAt && rider.duty !== 'offline' && (
            <Text style={styles.shift}>On shift for {formatDuration(now.getTime() - new Date(rider.shiftStartedAt).getTime())}</Text>
          )}
          <View style={styles.contact}>
            <Button compact variant="soft" title="Call" icon={(c) => <PhoneOutlineIcon size={16} color={c} />} onPress={() => callPhone(rider.phone)} style={styles.flex} />
            <Button compact variant="soft" title="Message" icon={(c) => <MessageIcon size={16} color={c} />} onPress={() => sendSms(rider.phone)} style={styles.flex} />
          </View>
        </Card>

        <View style={styles.kpis}>
          <Kpi label="Active tasks" value={stats.active} />
          <Kpi label="Delivered today" value={stats.deliveredToday} color="#16A34A" />
          <Kpi label="Success rate" value={`${stats.successRate}%`} />
          <Kpi label="On time" value={`${stats.onTimeRate}%`} />
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Cash on delivery</Text>
          <View style={styles.cashTop}>
            <Text style={styles.cashValue}>{formatRs(stats.codHeld)}</Text>
            <Text style={styles.meta}>limit {formatRs(data.settings.riderCashLimit)}</Text>
          </View>
          <ProgressBar value={cashPct} color={cashPct > 100 ? '#DC2626' : cashPct > 75 ? C.amber : '#16A34A'} />
          <KeyValue label="Still in hand" value={formatRs(stats.cashInHand)} />
          <KeyValue label="Deposited, awaiting verification" value={formatRs(stats.pendingDeposit)} valueColor={stats.pendingDeposit ? C.amber : undefined} />
          <KeyValue label="Collected today" value={formatRs(stats.codCollectedToday)} />
          {deposits.length > 0 && (
            <>
              <View style={styles.divider} />
              {deposits.map((d) => (
                <View key={d.id} style={styles.depositRow}>
                  <Text style={styles.depositText}>
                    {formatRs(d.amount)} · {timeAgo(d.at, now)}
                  </Text>
                  <Badge
                    label={d.status.toUpperCase()}
                    bg={d.status === 'verified' ? '#DCFCE7' : d.status === 'pending' ? '#FEF3C7' : '#FEE2E2'}
                    color={d.status === 'verified' ? '#15803D' : d.status === 'pending' ? '#B45309' : '#B91C1C'}
                  />
                </View>
              ))}
            </>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>This week</Text>
          <KeyValue label="Deliveries" value={String(week.deliveries)} />
          <KeyValue label="Pickups" value={String(week.pickups)} />
          <KeyValue label="Returns" value={String(week.returns)} />
          <KeyValue label="Target bonuses" value={formatRs(week.bonus)} />
          <KeyValue label="Earnings" value={formatRs(week.total)} bold />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle & documents</Text>
          <KeyValue label="Vehicle" value={`${rider.vehicle.type} · ${rider.vehicle.plate}`} />
          <KeyValue label="Phone" value={rider.phone} />
          <KeyValue label="Joined" value={formatDate(new Date(rider.joinedAt))} />
          <View style={styles.divider} />
          {rider.documents.map((d) => (
            <View key={d.name} style={styles.docRow}>
              <ShieldCheckIcon size={18} color={KYC_META[d.status].color} />
              <View style={styles.flex}>
                <Text style={styles.docName}>{d.name}</Text>
                {d.expires && <Text style={styles.meta}>Expires {formatDate(new Date(d.expires))}</Text>}
              </View>
              <Badge label={KYC_META[d.status].label.toUpperCase()} bg={KYC_META[d.status].bg} color={KYC_META[d.status].color} />
            </View>
          ))}
          {rider.kyc === 'pending' && (
            <View style={styles.contact}>
              <Button
                compact
                variant="danger"
                title="Reject"
                style={styles.flex}
                onPress={() => {
                  dispatch({ type: 'riderKyc', riderId: rider.id, kyc: 'rejected', actor });
                  toast(`${rider.name}'s KYC rejected`, 'info');
                }}
              />
              <Button
                compact
                variant="success"
                title="Approve KYC"
                style={styles.flex}
                onPress={() => {
                  dispatch({ type: 'riderKyc', riderId: rider.id, kyc: 'verified', actor });
                  toast(`${rider.name} approved to ride`);
                }}
              />
            </View>
          )}
        </Card>

        <Text style={styles.section}>Active tasks ({stats.tasks.length})</Text>
        {stats.tasks.length === 0 ? (
          <Text style={styles.meta}>No parcels assigned right now.</Text>
        ) : (
          stats.tasks.map((s) => (
            <ShipmentCard
              key={s.id}
              shipment={s}
              now={now}
              merchantName={lookup.merchant.get(s.merchantId)?.name}
              onPress={() => router.push({ pathname: '/admin/shipment/[id]', params: { id: s.id } })}
            />
          ))
        )}

        <Button
          title={rider.active ? 'Suspend rider' : 'Reactivate rider'}
          variant={rider.active ? 'danger' : 'success'}
          onPress={() => {
            dispatch({ type: 'riderActive', riderId: rider.id, active: !rider.active, actor });
            toast(rider.active ? `${rider.name} suspended` : `${rider.name} reactivated`, rider.active ? 'info' : 'success');
          }}
        />
      </ScrollView>
    </View>
  );
}

function Kpi({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={[styles.kpiValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  profile: { padding: 18, alignItems: 'center', gap: 6 },
  name: { fontSize: 20, fontWeight: '800', color: C.textStrong, marginTop: 6 },
  meta: { fontSize: 12, color: C.muted },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 },
  shift: { fontSize: 12, color: '#16A34A', fontWeight: '600' },
  contact: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 10 },
  kpis: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: C.cardBorder, paddingVertical: 14 },
  kpi: { flex: 1, alignItems: 'center' },
  kpiValue: { fontSize: 18, fontWeight: '800', color: C.textStrong },
  kpiLabel: { fontSize: 11, color: C.muted, marginTop: 2, textAlign: 'center' },
  card: { padding: 14, gap: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.textStrong, marginBottom: 6 },
  cashTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 },
  cashValue: { fontSize: 22, fontWeight: '800', color: C.textStrong },
  divider: { height: 1, backgroundColor: C.divider, marginVertical: 10 },
  depositRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  depositText: { fontSize: 13, color: C.text },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  docName: { fontSize: 14, fontWeight: '600', color: C.text },
  section: { fontSize: 15, fontWeight: '700', color: C.navy, marginTop: 4 },
});
