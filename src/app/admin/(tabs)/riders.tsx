import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { BikeIcon, MapIcon } from '@/components/portal/icons';
import { Badge, Card, Chip, EmptyState, HeaderIconButton, PortalHeader, SearchCountBar } from '@/components/portal/ui';
import { Avatar, ProgressBar } from '@/components/portal/widgets';
import { PortalColors as C } from '@/constants/theme';
import { DUTY_META, KYC_META, type Rider, riderStats } from '@/data/ops';
import { formatRs } from '@/utils/format';

type Filter = 'all' | 'online' | 'break' | 'offline' | 'kyc' | 'suspended';

const FILTERS: { key: Filter; label: string; test: (r: Rider) => boolean }[] = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'online', label: 'Online', test: (r) => r.active && r.duty === 'online' },
  { key: 'break', label: 'On break', test: (r) => r.active && r.duty === 'break' },
  { key: 'offline', label: 'Offline', test: (r) => r.active && r.duty === 'offline' },
  { key: 'kyc', label: 'KYC pending', test: (r) => r.kyc === 'pending' },
  { key: 'suspended', label: 'Suspended', test: (r) => !r.active },
];

const INFO = {
  title: 'Fleet',
  body: 'Every rider with live duty status, workload, delivery success rate and the cash they are holding. Tap a rider to review KYC, suspend them or see their tasks. Use the map button for the live fleet map.',
};

export default function RidersScreen() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const { data, lookup } = useAdmin();
  const [filter, setFilter] = useState<Filter>((params.filter as Filter) ?? 'all');
  const [seen, setSeen] = useState(params.filter);
  if (params.filter !== seen) {
    setSeen(params.filter);
    if (params.filter) setFilter(params.filter as Filter);
  }
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const test = FILTERS.find((f) => f.key === filter)!.test;
  const list = data.riders
    .filter((r) => test(r) && (!q || r.name.toLowerCase().includes(q) || r.phone.includes(q) || r.vehicle.plate.toLowerCase().includes(q)))
    .map((r) => ({ rider: r, stats: riderStats(data, r.id) }))
    .sort((a, b) => Number(b.rider.duty === 'online') - Number(a.rider.duty === 'online') || b.stats.active - a.stats.active);

  return (
    <View style={styles.screen}>
      <PortalHeader
        title="Fleet"
        info={INFO}
        right={
          <HeaderIconButton label="Live fleet map" onPress={() => router.navigate('/admin/live-map')}>
            <MapIcon size={24} color="#FFFFFF" />
          </HeaderIconButton>
        }
      />

      <View style={styles.chipsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} role="tablist">
          {FILTERS.map((f) => (
            <Chip key={f.key} label={`${f.label} · ${data.riders.filter(f.test).length}`} active={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.toolbar}>
        <SearchCountBar
          icon={<BikeIcon size={19} color={C.red} />}
          label={`${list.length} rider${list.length === 1 ? '' : 's'}`}
          searching={searching}
          onToggleSearch={() => {
            if (searching) setQuery('');
            setSearching(!searching);
          }}
          query={query}
          onQueryChange={setQuery}
          placeholder="Name, phone or plate"
        />
      </View>

      <FlatList
        data={list}
        keyExtractor={(x) => x.rider.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: { rider, stats } }) => {
          const duty = DUTY_META[rider.duty];
          const cashPct = Math.round((stats.codHeld / data.settings.riderCashLimit) * 100);
          return (
            <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/admin/rider/[id]', params: { id: rider.id } })}>
              {({ pressed }) => (
                <Card style={[styles.card, pressed && styles.pressed]}>
                  <View style={styles.head}>
                    <Avatar name={rider.name} size={46} status={rider.active ? duty.color : '#9CA3AF'} />
                    <View style={styles.flex}>
                      <Text style={styles.name}>{rider.name}</Text>
                      <Text style={styles.meta}>
                        {lookup.hub.get(rider.hubId)?.name} · {rider.vehicle.type} {rider.vehicle.plate}
                      </Text>
                    </View>
                    {!rider.active ? (
                      <Badge label="SUSPENDED" bg="#F3F4F6" color="#6B7280" />
                    ) : rider.kyc !== 'verified' ? (
                      <Badge label={KYC_META[rider.kyc].label.toUpperCase()} bg={KYC_META[rider.kyc].bg} color={KYC_META[rider.kyc].color} />
                    ) : (
                      <Text style={[styles.duty, { color: duty.color }]}>● {duty.label}</Text>
                    )}
                  </View>
                  <View style={styles.stats}>
                    <Stat label="Active" value={stats.active} />
                    <Stat label="Today" value={stats.deliveredToday} color="#16A34A" />
                    <Stat label="Success" value={`${stats.successRate}%`} />
                    <Stat label="Rating" value={`★ ${rider.rating.toFixed(1)}`} color={C.amber} />
                  </View>
                  <View style={styles.cash}>
                    <View style={styles.cashTop}>
                      <Text style={styles.cashLabel}>COD held</Text>
                      <Text style={[styles.cashValue, cashPct > 100 && { color: '#DC2626' }]}>
                        {formatRs(stats.codHeld)} / {formatRs(data.settings.riderCashLimit)}
                      </Text>
                    </View>
                    <ProgressBar value={cashPct} height={6} color={cashPct > 100 ? '#DC2626' : cashPct > 75 ? C.amber : '#16A34A'} />
                  </View>
                </Card>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={<EmptyState icon={<BikeIcon size={30} color={C.red} />} title="No riders here" message="Try another filter or search." />}
      />
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  chipsBar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F2F4' },
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  toolbar: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 },
  list: { padding: 12, gap: 12, paddingBottom: 40 },
  card: { padding: 14, gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  meta: { fontSize: 12, color: C.muted, marginTop: 2 },
  duty: { fontSize: 12, fontWeight: '700' },
  stats: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, paddingVertical: 10 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '800', color: C.textStrong },
  statLabel: { fontSize: 11, color: C.muted, marginTop: 2 },
  cash: { gap: 6 },
  cashTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cashLabel: { fontSize: 12, color: C.muted },
  cashValue: { fontSize: 12, fontWeight: '700', color: C.text },
});
