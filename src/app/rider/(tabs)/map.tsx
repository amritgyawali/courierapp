import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { BranchMap } from '@/components/branch-map';
import { NavigationIcon, RouteIcon } from '@/components/portal/icons';
import { Badge, EmptyState, HeaderIconButton, PortalHeader } from '@/components/portal/ui';
import { useNow } from '@/components/portal/widgets';
import { taskParty } from '@/components/rider/task-card';
import { useRider } from '@/components/rider/use-rider';
import { Text } from '@/components/text';
import { TASK_META, taskKind } from '@/data/ops';
import { makeStyles, useColors } from '@/theme';
import { formatDuration } from '@/utils/format';
import { navigateRoute } from '@/utils/links';

/** Riding estimate: ~22 km/h in town plus ~6 minutes per stop. */
const estimateMs = (km: number, stops: number) => ((km / 22) * 60 + stops * 6) * 60000;

export default function RiderMap() {
  const styles = useStyles();
  const C = useColors();
  const now = useNow();
  const { data, me, hub, route } = useRider(now);
  const [focusId, setFocusId] = useState<string | null>(null);

  const stops = route.stops;
  const focused = stops.find((s) => s.shipment.id === focusId);
  const region = { latitude: me.latitude, longitude: me.longitude, latitudeDelta: 0.12, longitudeDelta: 0.12 };

  return (
    <View style={styles.screen}>
      <PortalHeader
        title="Route"
        info={{
          title: 'Route',
          body: 'Your stops ordered nearest-first from your current position. Navigate all opens Google Maps with the stops in this order (up to 10 at a time).',
        }}
        right={
          stops.length > 0 ? (
            <HeaderIconButton label="Navigate all stops" onPress={() => navigateRoute(stops)}>
              <NavigationIcon size={24} color="#FFFFFF" />
            </HeaderIconButton>
          ) : undefined
        }
      />
      <View style={styles.map}>
        <BranchMap
          points={stops.map((s) => ({
            latitude: s.latitude,
            longitude: s.longitude,
            title: `${s.sequence}. ${taskParty(data, s.shipment, hub).title}`,
            description: TASK_META[taskKind(s.shipment) ?? 'delivery'].label,
          }))}
          initialRegion={region}
          focus={focused ? { latitude: focused.latitude, longitude: focused.longitude } : null}
          focusDelta={0.03}
        />
      </View>
      <View style={styles.summary}>
        <RouteIcon size={20} color={C.primary} />
        <Text style={styles.summaryText}>
          {stops.length} stop{stops.length === 1 ? '' : 's'} · {route.distanceKm.toFixed(1)} km · about {formatDuration(estimateMs(route.distanceKm, stops.length))}
        </Text>
      </View>
      <FlatList
        data={stops}
        keyExtractor={(s) => s.shipment.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const kind = taskKind(item.shipment) ?? 'delivery';
          const party = taskParty(data, item.shipment, hub);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Stop ${item.sequence}, ${party.title}`}
              onPress={() =>
                focusId === item.shipment.id
                  ? router.push({ pathname: '/rider/task/[id]', params: { id: item.shipment.id } })
                  : setFocusId(item.shipment.id)
              }
              style={[styles.row, focusId === item.shipment.id && styles.rowActive]}>
              <View style={[styles.seq, { backgroundColor: TASK_META[kind].color }]}>
                <Text style={styles.seqText}>{item.sequence}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.name} numberOfLines={1}>
                  {party.title}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {party.address}
                </Text>
              </View>
              <Badge label={TASK_META[kind].label.toUpperCase()} bg={TASK_META[kind].bg} color={TASK_META[kind].color} />
            </Pressable>
          );
        }}
        ListEmptyComponent={<EmptyState icon={<RouteIcon size={30} color={C.primary} />} title="No stops" message="Your route appears here when you have tasks." />}
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  map: { height: 300, backgroundColor: '#E5ECE0' },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },
  summaryText: { flex: 1, fontSize: 13, fontWeight: '700', color: C.text },
  list: { padding: 12, gap: 8, paddingBottom: 30 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  rowActive: { borderColor: C.primary },
  seq: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  seqText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  name: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  meta: { fontSize: 12, color: C.muted, marginTop: 2 },
}));
