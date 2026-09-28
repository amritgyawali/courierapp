import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ops/shipment';
import { CubeIcon } from '@/components/portal/icons';
import { Card, Chip, EmptyState, PortalHeader, SearchCountBar } from '@/components/portal/ui';
import { useNow } from '@/components/portal/widgets';
import { TaskCard } from '@/components/rider/task-card';
import { useRider } from '@/components/rider/use-rider';
import { PortalColors as C } from '@/constants/theme';
import { type RiderTaskKind, taskKind } from '@/data/ops';
import { formatRs, formatTime, isSameDay } from '@/utils/format';

type Filter = 'all' | RiderTaskKind | 'done';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'delivery', label: 'Deliveries' },
  { key: 'pickup', label: 'Pickups' },
  { key: 'drop', label: 'Hub drops' },
  { key: 'return', label: 'Returns' },
  { key: 'done', label: 'Done today' },
];

const INFO = {
  title: 'My Tasks',
  body: 'Your pickups, hub drops, deliveries and returns in the suggested route order (nearest first). Tap a task for details and to complete it.',
};

export default function RiderTasks() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const now = useNow();
  const { data, me, hub, route } = useRider(now);
  const [filter, setFilter] = useState<Filter>((params.filter as Filter) ?? 'all');
  const [seen, setSeen] = useState(params.filter);
  if (params.filter !== seen) {
    setSeen(params.filter);
    if (params.filter) setFilter(params.filter as Filter);
  }
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const matches = (text: string) => !q || text.toLowerCase().includes(q);

  const stops = route.stops.filter(
    (st) =>
      (filter === 'all' || taskKind(st.shipment) === filter) &&
      matches(`${st.shipment.id} ${st.shipment.receiver.name} ${st.shipment.receiver.phone} ${st.shipment.receiver.address}`),
  );

  const done = data.shipments
    .filter((s) =>
      s.events.some((e) => e.actor === me.name && (e.status === 'delivered' || e.status === 'failed' || e.status === 'picked-up') && isSameDay(new Date(e.at), now)),
    )
    .filter((s) => matches(`${s.id} ${s.receiver.name}`));

  const count = (f: Filter) =>
    f === 'done' ? done.length : f === 'all' ? route.stops.length : route.stops.filter((st) => taskKind(st.shipment) === f).length;

  return (
    <View style={styles.screen}>
      <PortalHeader title="My Tasks" info={INFO} />
      <View style={styles.chipsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} role="tablist">
          {FILTERS.map((f) => (
            <Chip key={f.key} label={`${f.label} · ${count(f.key)}`} active={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </ScrollView>
      </View>
      <View style={styles.toolbar}>
        <SearchCountBar
          icon={<CubeIcon size={18} color={C.red} />}
          label={filter === 'done' ? `${done.length} completed today` : `${stops.length} stop${stops.length === 1 ? '' : 's'} · ${route.distanceKm.toFixed(1)} km`}
          searching={searching}
          onToggleSearch={() => {
            if (searching) setQuery('');
            setSearching(!searching);
          }}
          query={query}
          onQueryChange={setQuery}
          placeholder="Tracking ID, name or phone"
        />
      </View>

      {filter === 'done' ? (
        <FlatList
          data={done}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: s }) => {
            const last = [...s.events].reverse().find((e) => e.actor === me.name);
            return (
              <Card style={styles.doneCard}>
                <View style={styles.flex}>
                  <Text style={styles.doneTitle}>{s.receiver.name}</Text>
                  <Text style={styles.doneMeta}>
                    {s.id} · {last ? formatTime(last.at) : ''}
                    {s.pod?.collected ? ` · ${formatRs(s.pod.collected)}` : ''}
                  </Text>
                </View>
                <StatusBadge status={last?.status ?? s.status} />
              </Card>
            );
          }}
          ListEmptyComponent={<EmptyState icon={<CubeIcon size={30} color={C.red} />} title="Nothing completed yet" message="Tasks you finish today are listed here." />}
        />
      ) : (
        <FlatList
          data={stops}
          keyExtractor={(st) => st.shipment.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TaskCard stop={item} data={data} hub={hub} onPress={() => router.push({ pathname: '/rider/task/[id]', params: { id: item.shipment.id } })} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<CubeIcon size={30} color={C.red} />}
              title={q ? 'No matching tasks' : 'No tasks here'}
              message={q ? 'Try a different search.' : 'New tasks appear here as dispatch assigns them to you.'}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  chipsBar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F2F4' },
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  toolbar: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 },
  list: { padding: 12, gap: 12, paddingBottom: 40 },
  doneCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  doneTitle: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  doneMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
});
