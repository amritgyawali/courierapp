import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { NavigationIcon, OfficeIcon, PhoneOutlineIcon } from '@/components/portal/icons';
import { Badge, Card, PortalHeader } from '@/components/portal/ui';
import { ProgressBar, useNow } from '@/components/portal/widgets';
import { Text } from '@/components/text';
import { hubStats } from '@/data/ops';
import { makeStyles, useColors } from '@/theme';
import { callPhone, navigateTo } from '@/utils/links';

const ZONE_LABEL = { valley: 'Inside Valley', city: 'Major City', outside: 'Outside Valley', remote: 'Remote' } as const;

const INFO = {
  title: 'Hubs & Branches',
  body: 'Each hub receives, sorts and dispatches parcels for its area. Load compares today’s bookings with the hub’s daily capacity; backlog is parcels at the hub waiting for a rider.',
};

export default function HubsScreen() {
  const styles = useStyles();
  const C = useColors();
  const { data } = useAdmin();
  const now = useNow();
  const hubs = data.hubs.map((h) => ({ hub: h, stats: hubStats(data, h.id, now) })).sort((a, b) => b.stats.load - a.stats.load);

  return (
    <View style={styles.screen}>
      <PortalHeader title="Hubs & Branches" info={INFO} />
      <FlatList
        data={hubs}
        keyExtractor={(x) => x.hub.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: { hub, stats } }) => {
          const loadColor = stats.load > 85 ? '#DC2626' : stats.load > 60 ? C.amber : '#16A34A';
          return (
            <Card style={styles.card}>
              <View style={styles.head}>
                <View style={styles.icon}>
                  <OfficeIcon size={20} color={C.primary} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.name}>{hub.name}</Text>
                  <Text style={styles.meta}>
                    {hub.manager} · {hub.district}
                  </Text>
                </View>
                <Badge label={ZONE_LABEL[hub.zone].toUpperCase()} bg="#F1F5F9" color="#475569" />
              </View>

              <View style={styles.loadRow}>
                <Text style={styles.loadLabel}>Load today</Text>
                <Text style={[styles.loadValue, { color: loadColor }]}>
                  {stats.today}/{hub.capacity} · {stats.load}%
                </Text>
              </View>
              <ProgressBar value={stats.load} color={loadColor} />

              <View style={styles.stats}>
                <Stat label="Backlog" value={stats.backlog} color={stats.backlog > 10 ? '#DC2626' : undefined} />
                <Stat label="Out now" value={stats.outForDelivery} />
                <Stat label="Riders on" value={`${stats.ridersOnline}/${stats.riders}`} />
                <Stat label="Success" value={`${stats.successRate}%`} color="#16A34A" />
              </View>

              <View style={styles.actions}>
                <Pressable accessibilityRole="button" onPress={() => callPhone(hub.phone)} style={styles.action}>
                  <PhoneOutlineIcon size={16} color={C.primary} />
                  <Text style={styles.actionText}>Call manager</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => navigateTo(hub.latitude, hub.longitude)} style={styles.action}>
                  <NavigationIcon size={16} color={C.primary} />
                  <Text style={styles.actionText}>Directions</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.navigate({ pathname: '/admin/dispatch' })}
                  style={styles.action}>
                  <Text style={styles.actionText}>Dispatch →</Text>
                </Pressable>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  const styles = useStyles();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  list: { padding: 12, gap: 12, paddingBottom: 40 },
  card: { padding: 14, gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.primaryTint, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  meta: { fontSize: 12, color: C.muted, marginTop: 2 },
  loadRow: { flexDirection: 'row', justifyContent: 'space-between' },
  loadLabel: { fontSize: 12, color: C.muted },
  loadValue: { fontSize: 12, fontWeight: '800' },
  stats: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, paddingVertical: 10 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '800', color: C.textStrong },
  statLabel: { fontSize: 11, color: C.muted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: C.primaryTint,
  },
  actionText: { fontSize: 12, fontWeight: '700', color: C.primary },
}));
