import { SectionList, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ops/shipment';
import { HistoryIcon } from '@/components/portal/icons';
import { Card, EmptyState, PortalHeader } from '@/components/portal/ui';
import { useRider } from '@/components/rider/use-rider';
import { PortalColors as C } from '@/constants/theme';
import type { ShipmentStatus } from '@/data/ops';
import { formatDate, formatRs, formatTime, isSameDay, startOfDay } from '@/utils/format';

const COUNTED: ShipmentStatus[] = ['picked-up', 'at-hub', 'delivered', 'failed', 'returned'];

export default function RiderHistory() {
  const { data, me } = useRider();

  const entries = data.shipments
    .flatMap((s) => s.events.filter((e) => e.actor === me.name && COUNTED.includes(e.status)).map((e) => ({ s, e })))
    .sort((a, b) => b.e.at.localeCompare(a.e.at));

  const groups = new Map<number, typeof entries>();
  for (const x of entries) {
    const k = startOfDay(new Date(x.e.at)).getTime();
    groups.set(k, [...(groups.get(k) ?? []), x]);
  }
  const sections = [...groups.entries()].map(([k, data]) => {
    const day = new Date(k);
    const delivered = data.filter((x) => x.e.status === 'delivered').length;
    return { title: isSameDay(day, new Date()) ? 'Today' : formatDate(day), delivered, data };
  });

  return (
    <View style={styles.screen}>
      <PortalHeader title="History" />
      <SectionList
        sections={sections}
        keyExtractor={(x) => `${x.s.id}-${x.e.at}-${x.e.status}`}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{section.title}</Text>
            <Text style={styles.headerMeta}>{section.delivered} delivered</Text>
          </View>
        )}
        renderItem={({ item: { s, e } }) => (
          <Card style={styles.card}>
            <View style={styles.flex}>
              <Text style={styles.title}>{e.status === 'picked-up' || e.status === 'returned' ? (data.merchants.find((m) => m.id === s.merchantId)?.name ?? s.merchantId) : s.receiver.name}</Text>
              <Text style={styles.meta}>
                {s.id} · {formatTime(e.at)}
                {e.status === 'delivered' && s.pod?.collected ? ` · ${formatRs(s.pod.collected)}` : ''}
                {e.status === 'failed' && e.note ? ` · ${e.note}` : ''}
              </Text>
            </View>
            <StatusBadge status={e.status} />
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListEmptyComponent={<EmptyState icon={<HistoryIcon size={30} color={C.red} />} title="No history yet" message="Completed pickups and deliveries appear here." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  list: { padding: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 14, paddingBottom: 8, paddingHorizontal: 4 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: C.navy },
  headerMeta: { fontSize: 12, fontWeight: '600', color: '#16A34A' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  title: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  meta: { fontSize: 12, color: C.muted, marginTop: 2 },
  gap: { height: 8 },
});
