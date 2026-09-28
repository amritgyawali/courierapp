import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { BranchMap, type MapPoint, NEPAL_REGION } from '@/components/branch-map';
import { Chip, PortalHeader } from '@/components/portal/ui';
import { Avatar } from '@/components/portal/widgets';
import { PortalColors as C } from '@/constants/theme';
import { DUTY_META, riderTasks } from '@/data/ops';

const INFO = {
  title: 'Live Fleet Map',
  body: 'Last reported position of every active rider. Tap a rider to centre the map on them; tap again to open their profile.',
};

export default function LiveMapScreen() {
  const { data, lookup } = useAdmin();
  const [hubId, setHubId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  const riders = data.riders.filter((r) => r.active && r.duty !== 'offline' && (!hubId || r.hubId === hubId));
  const points: MapPoint[] = riders.map((r) => ({
    latitude: r.latitude,
    longitude: r.longitude,
    title: r.name,
    description: `${DUTY_META[r.duty].label} · ${riderTasks(data, r.id).length} tasks`,
  }));
  const focused = riders.find((r) => r.id === focusId);
  const hub = hubId ? lookup.hub.get(hubId) : undefined;
  const region = hub ? { latitude: hub.latitude, longitude: hub.longitude, latitudeDelta: 0.15, longitudeDelta: 0.15 } : NEPAL_REGION;

  return (
    <View style={styles.screen}>
      <PortalHeader title="Live Fleet Map" info={INFO} />
      <View style={styles.chips}>
        <Chip variant="neutral" label="All" active={!hubId} onPress={() => setHubId(null)} />
        {data.hubs.slice(0, 4).map((h) => (
          <Chip key={h.id} variant="neutral" label={h.name.replace(' Hub', '')} active={hubId === h.id} onPress={() => setHubId(h.id)} />
        ))}
      </View>
      <View style={styles.map}>
        <BranchMap
          key={hubId ?? 'all'}
          points={points}
          initialRegion={region}
          focus={focused ? { latitude: focused.latitude, longitude: focused.longitude, title: focused.name } : null}
          focusDelta={0.05}
        />
      </View>
      <FlatList
        data={riders}
        keyExtractor={(r) => r.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: r }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${r.name}, ${DUTY_META[r.duty].label}`}
            onPress={() => (focusId === r.id ? router.push({ pathname: '/admin/rider/[id]', params: { id: r.id } }) : setFocusId(r.id))}
            style={[styles.row, focusId === r.id && styles.rowActive]}>
            <Avatar name={r.name} size={36} status={DUTY_META[r.duty].color} />
            <View style={styles.flex}>
              <Text style={styles.name}>{r.name}</Text>
              <Text style={styles.meta}>
                {lookup.hub.get(r.hubId)?.name} · {riderTasks(data, r.id).length} tasks
              </Text>
            </View>
            <Text style={[styles.duty, { color: DUTY_META[r.duty].color }]}>{DUTY_META[r.duty].label}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, backgroundColor: '#FFFFFF' },
  map: { height: 280, backgroundColor: '#E5ECE0' },
  list: { flex: 1 },
  listContent: { padding: 12, gap: 8, paddingBottom: 30 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  rowActive: { borderColor: C.red },
  name: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  meta: { fontSize: 12, color: C.muted, marginTop: 1 },
  duty: { fontSize: 12, fontWeight: '700' },
});
