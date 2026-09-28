import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  CubeIcon,
  MegaphoneOutlineIcon,
  PowerIcon,
  ScanIcon,
  StoreSmallIcon,
  WalletIcon,
} from '@/components/portal/icons';
import { ScannerModal } from '@/components/portal/scanner';
import { Card, HeaderIconButton, PortalHeader, SectionHeading } from '@/components/portal/ui';
import { Button, ProgressBar, ProgressRing, StatTile, useNow, useToast } from '@/components/portal/widgets';
import { TaskCard } from '@/components/rider/task-card';
import { useRider } from '@/components/rider/use-rider';
import { PortalColors as C, shadow } from '@/constants/theme';
import { DUTY_META, type Duty } from '@/data/ops';
import { formatDuration, formatRs, greeting, timeAgo } from '@/utils/format';

export default function RiderHome() {
  const now = useNow(30000);
  const { data, dispatch, me, hub, stats, route, actor } = useRider(now);
  const toast = useToast();
  const [scanning, setScanning] = useState(false);

  const setDuty = (duty: Duty) => {
    dispatch({ type: 'riderDuty', riderId: me.id, duty, actor });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    toast(duty === 'online' ? 'You are online — drive safe!' : duty === 'break' ? 'Break started' : 'Shift ended', 'info');
  };

  const next = route.stops[0];
  const limit = data.settings.riderCashLimit;
  const cashPct = Math.round((stats.cashInHand / limit) * 100);
  const pickups = stats.tasks.filter((s) => s.status === 'pickup-assigned').length;
  const news = data.announcements.filter((a) => a.audience !== 'merchants').slice(0, 2);
  const onScan = (code: string) => {
    setScanning(false);
    const task = stats.tasks.find((s) => s.id === code);
    if (task) router.push({ pathname: '/rider/task/[id]', params: { id: task.id } });
    else toast(`${code} is not one of your tasks`, 'error');
  };

  const online = me.duty !== 'offline';

  return (
    <View style={styles.screen}>
      <PortalHeader
        right={
          <HeaderIconButton label="Scan parcel" onPress={() => setScanning(true)}>
            <ScanIcon size={25} color="#FFFFFF" />
          </HeaderIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Duty */}
        <View style={[styles.duty, !online && styles.dutyOff]}>
          <View style={styles.dutyTop}>
            <View style={styles.flex}>
              <Text style={[styles.hello, !online && styles.darkText]}>
                {greeting(now).replace('!', ',')} {me.name.split(' ')[0]}!
              </Text>
              <Text style={[styles.dutySub, !online && styles.mutedText]}>
                {online
                  ? `${DUTY_META[me.duty].label} · on shift ${formatDuration(now.getTime() - new Date(me.shiftStartedAt ?? now).getTime())}`
                  : `Offline · ${hub.name}`}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={online ? 'End shift' : 'Start shift'}
              onPress={() => setDuty(online ? 'offline' : 'online')}
              style={({ pressed }) => [styles.power, online ? styles.powerOn : styles.powerOff, pressed && { opacity: 0.8 }]}>
              <PowerIcon size={26} color={online ? C.red : '#FFFFFF'} />
            </Pressable>
          </View>
          {online ? (
            <View style={styles.dutyActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDuty(me.duty === 'break' ? 'online' : 'break')}
                style={({ pressed }) => [styles.dutyChip, pressed && { opacity: 0.8 }]}>
                <ClockIcon size={15} color="#FFFFFF" />
                <Text style={styles.dutyChipText}>{me.duty === 'break' ? 'End break' : 'Take a break'}</Text>
              </Pressable>
              <Text style={styles.dutyHint}>
                {me.vehicle.type} · {me.vehicle.plate}
              </Text>
            </View>
          ) : (
            <Button title="Start shift" onPress={() => setDuty('online')} icon={(c) => <PowerIcon size={17} color={c} />} />
          )}
        </View>

        {/* Cash limit warning */}
        {cashPct >= 100 && (
          <Pressable accessibilityRole="button" onPress={() => router.navigate('/rider/wallet')} style={styles.warning}>
            <AlertTriangleIcon size={20} color="#B91C1C" />
            <Text style={styles.warningText}>
              You are carrying {formatRs(stats.cashInHand)} — above the {formatRs(limit)} limit. Deposit cash at {hub.name}.
            </Text>
          </Pressable>
        )}

        {/* Today */}
        <View style={styles.row}>
          <StatTile icon={<CubeIcon size={20} color="#2B6CB0" />} tint="#E9F2FE" value={stats.active} label="To do" onPress={() => router.navigate('/rider/tasks')} />
          <StatTile icon={<CheckCircleIcon size={20} color="#16A34A" />} tint="#ECFDF5" value={stats.deliveredToday} label="Delivered" note={`${stats.failedToday} failed`} noteColor={stats.failedToday ? C.red : C.muted} />
        </View>

        {/* COD */}
        <Card style={styles.cod}>
          <View style={styles.codTop}>
            <View style={styles.codIcon}>
              <WalletIcon size={22} color={C.red} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.codLabel}>Cash in hand</Text>
              <Text style={styles.codValue}>{formatRs(stats.cashInHand)}</Text>
            </View>
            <Button compact title="Deposit" variant="soft" onPress={() => router.navigate('/rider/wallet')} />
          </View>
          <ProgressBar value={cashPct} color={cashPct >= 100 ? '#DC2626' : cashPct > 75 ? C.amber : '#16A34A'} />
          <View style={styles.codFoot}>
            <Text style={styles.codMeta}>To collect today: {formatRs(stats.codToCollect)}</Text>
            <Text style={styles.codMeta}>Limit {formatRs(limit)}</Text>
          </View>
        </Card>

        {/* Next stop */}
        <SectionHeading
          icon={<CubeIcon size={20} color={C.red} />}
          title={next ? `Next stop · ${route.stops.length} left` : 'Next stop'}
          right={
            next ? (
              <Pressable accessibilityRole="button" onPress={() => router.navigate('/rider/map')} hitSlop={8}>
                <Text style={styles.link}>Route map</Text>
              </Pressable>
            ) : undefined
          }
        />
        {next ? (
          <TaskCard stop={next} data={data} hub={hub} onPress={() => router.push({ pathname: '/rider/task/[id]', params: { id: next.shipment.id } })} />
        ) : (
          <Card style={styles.done}>
            <CheckCircleIcon size={34} color="#16A34A" />
            <Text style={styles.doneTitle}>All tasks complete</Text>
            <Text style={styles.doneText}>
              {online ? 'New pickups and deliveries appear here as dispatch assigns them.' : 'Start your shift to receive tasks.'}
            </Text>
          </Card>
        )}
        {pickups > 0 && (
          <Pressable accessibilityRole="button" onPress={() => router.navigate({ pathname: '/rider/tasks', params: { filter: 'pickup' } })} style={styles.pickupBanner}>
            <StoreSmallIcon size={18} color="#4F46E5" />
            <Text style={styles.pickupText}>
              {pickups} pickup{pickups === 1 ? '' : 's'} waiting at merchants
            </Text>
            <ChevronRightIcon size={16} color="#4F46E5" />
          </Pressable>
        )}

        {/* Performance */}
        <SectionHeading icon={<CheckCircleIcon size={20} color={C.red} />} title="Your performance" />
        <Card style={styles.perf}>
          <ProgressRing value={stats.successRate} label="success" size={88} color={stats.successRate >= 90 ? '#16A34A' : C.amber} />
          <View style={styles.perfStats}>
            <PerfRow label="On-time deliveries" value={`${stats.onTimeRate}%`} />
            <PerfRow label="Customer rating" value={`★ ${me.rating.toFixed(1)}`} />
            <PerfRow label="Total delivered" value={String(stats.deliveredTotal)} />
          </View>
        </Card>

        {/* Announcements */}
        {news.length > 0 && (
          <>
            <SectionHeading
              icon={<MegaphoneOutlineIcon size={20} color={C.red} />}
              title="Announcements"
              right={
                <Pressable accessibilityRole="button" onPress={() => router.navigate('/rider/announcements')} hitSlop={8}>
                  <Text style={styles.link}>See all</Text>
                </Pressable>
              }
            />
            {news.map((a) => (
              <Card key={a.id} style={styles.news}>
                <Text style={styles.newsTitle}>{a.title}</Text>
                <Text style={styles.newsBody} numberOfLines={2}>
                  {a.body}
                </Text>
                <Text style={styles.newsMeta}>
                  {a.author} · {timeAgo(a.at, now)}
                </Text>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <ScannerModal visible={scanning} onClose={() => setScanning(false)} onScan={onScan} />
    </View>
  );
}

function PerfRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.perfRow}>
      <Text style={styles.perfLabel}>{label}</Text>
      <Text style={styles.perfValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 14, gap: 12, paddingBottom: 40 },
  duty: { backgroundColor: C.red, borderRadius: 16, padding: 16, gap: 14, boxShadow: shadow(2, 10, 0.18, C.red) },
  dutyOff: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.cardBorder, boxShadow: shadow(1, 6, 0.05) },
  dutyTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hello: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  darkText: { color: C.textStrong },
  dutySub: { color: '#FFFFFF', opacity: 0.92, fontSize: 13, marginTop: 3 },
  mutedText: { color: C.muted, opacity: 1 },
  power: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  powerOn: { backgroundColor: '#FFFFFF' },
  powerOff: { backgroundColor: '#9CA3AF' },
  dutyActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dutyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dutyChipText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  dutyHint: { color: '#FFFFFF', opacity: 0.85, fontSize: 12, fontWeight: '600' },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#B91C1C' },
  row: { flexDirection: 'row', gap: 12 },
  cod: { padding: 14, gap: 10 },
  codTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  codIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.redTint, alignItems: 'center', justifyContent: 'center' },
  codLabel: { fontSize: 12, color: C.muted, fontWeight: '600' },
  codValue: { fontSize: 22, fontWeight: '800', color: C.textStrong },
  codFoot: { flexDirection: 'row', justifyContent: 'space-between' },
  codMeta: { fontSize: 12, color: C.muted },
  link: { fontSize: 13, fontWeight: '700', color: C.red },
  done: { padding: 22, alignItems: 'center', gap: 6 },
  doneTitle: { fontSize: 16, fontWeight: '800', color: C.textStrong },
  doneText: { fontSize: 13, color: C.muted, textAlign: 'center' },
  pickupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
  },
  pickupText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#4F46E5' },
  perf: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 16 },
  perfStats: { flex: 1, gap: 10 },
  perfRow: { flexDirection: 'row', justifyContent: 'space-between' },
  perfLabel: { fontSize: 13, color: C.muted },
  perfValue: { fontSize: 14, fontWeight: '800', color: C.textStrong },
  news: { padding: 14, gap: 4 },
  newsTitle: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  newsBody: { fontSize: 13, color: '#4B5563', lineHeight: 19 },
  newsMeta: { fontSize: 11, color: C.faint, marginTop: 2 },
});
