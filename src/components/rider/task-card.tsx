import { Pressable, View } from 'react-native';

import { NavigationIcon, PhoneOutlineIcon, PinOutlineIcon, WineGlassIcon } from '@/components/portal/icons';
import { Badge, Card } from '@/components/portal/ui';
import type { Stop } from '@/components/rider/use-rider';
import { Text } from '@/components/text';
import { type Hub, type OpsData, type Shipment, TASK_META, taskKind } from '@/data/ops';
import { makeStyles, useColors } from '@/theme';
import { formatRs } from '@/utils/format';
import { callPhone, navigateTo } from '@/utils/links';

/** Who the rider meets for a task, and where. */
export function taskParty(data: OpsData, s: Shipment, hub: Hub) {
  const kind = taskKind(s);
  const merchant = data.merchants.find((m) => m.id === s.merchantId);
  if (kind === 'pickup' || kind === 'return') {
    return { title: merchant?.name ?? s.merchantId, address: merchant?.pickupAddress ?? '', phone: merchant?.phone ?? '' };
  }
  if (kind === 'drop') return { title: hub.name, address: `${hub.district} · ${hub.manager}`, phone: hub.phone };
  return { title: s.receiver.name, address: s.receiver.address, phone: s.receiver.phone };
}

export function TaskCard({ stop, data, hub, onPress }: { stop: Stop; data: OpsData; hub: Hub; onPress: () => void }) {
  const styles = useStyles();
  const C = useColors();
  const s = stop.shipment;
  const kind = taskKind(s) ?? 'delivery';
  const meta = TASK_META[kind];
  const party = taskParty(data, s, hub);

  return (
    <Card style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Stop ${stop.sequence}: ${meta.label} for ${party.title}`}
        onPress={onPress}
        style={({ pressed }) => [styles.body, pressed && { opacity: 0.85 }]}>
        <View style={[styles.seq, { backgroundColor: meta.color }]}>
          <Text style={styles.seqText}>{stop.sequence}</Text>
        </View>
        <View style={styles.flex}>
          <View style={styles.top}>
            <Badge label={meta.label.toUpperCase()} bg={meta.bg} color={meta.color} />
            {s.fragile && (
              <View style={styles.fragile}>
                <WineGlassIcon size={11} color="#D97706" />
                <Text style={styles.fragileText}>Fragile</Text>
              </View>
            )}
            {s.attempts > 0 && kind === 'delivery' && <Text style={styles.attempt}>Attempt {s.attempts + 1}</Text>}
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {party.title}
          </Text>
          <View style={styles.addressRow}>
            <PinOutlineIcon size={13} color={C.faint} />
            <Text style={styles.address} numberOfLines={1}>
              {party.address}
            </Text>
          </View>
          <Text style={styles.id}>
            {s.id} · {s.item}
          </Text>
        </View>
        {kind === 'delivery' && (
          <View style={styles.cod}>
            <Text style={[styles.codValue, s.cod === 0 && styles.prepaid]}>{s.cod ? formatRs(s.cod) : 'Prepaid'}</Text>
            {s.cod > 0 && <Text style={styles.codLabel}>collect</Text>}
          </View>
        )}
      </Pressable>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Call ${party.title}`} onPress={() => callPhone(party.phone)} style={styles.action}>
          <PhoneOutlineIcon size={16} color={C.primary} />
          <Text style={styles.actionText}>Call</Text>
        </Pressable>
        <View style={styles.actionDivider} />
        <Pressable accessibilityRole="button" accessibilityLabel="Navigate" onPress={() => navigateTo(stop.latitude, stop.longitude)} style={styles.action}>
          <NavigationIcon size={16} color={C.primary} />
          <Text style={styles.actionText}>Navigate</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  flex: { flex: 1 },
  card: { overflow: 'hidden' },
  body: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  seq: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  seqText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  fragile: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, backgroundColor: '#FFFBEB' },
  fragileText: { fontSize: 10, fontWeight: '700', color: '#D97706' },
  attempt: { fontSize: 11, fontWeight: '700', color: C.amberStrong },
  title: { fontSize: 16, fontWeight: '700', color: C.textStrong, marginTop: 6 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  address: { flex: 1, fontSize: 13, color: C.muted },
  id: { fontSize: 11, color: C.faint, marginTop: 4 },
  cod: { alignItems: 'flex-end' },
  codValue: { fontSize: 16, fontWeight: '800', color: C.primary },
  prepaid: { fontSize: 13, color: '#16A34A' },
  codLabel: { fontSize: 10, color: C.muted, fontWeight: '600' },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.divider },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11 },
  actionDivider: { width: 1, backgroundColor: C.divider },
  actionText: { fontSize: 13, fontWeight: '700', color: C.primary },
}));
