import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { Chip } from '@/components/portal/ui';
import { Avatar, Sheet, useToast } from '@/components/portal/widgets';
import { Text } from '@/components/text';
import { DUTY_META, operatingHubId, type Shipment, suggestRiders } from '@/data/ops';
import { makeStyles } from '@/theme';

/**
 * Pick a rider for one or more parcels. Riders of the parcels' hub are suggested first, online
 * and least-loaded at the top; "All hubs" widens the list for cross-hub help.
 */
export function AssignSheet({
  visible,
  shipments,
  onClose,
  onAssigned,
}: {
  visible: boolean;
  shipments: Shipment[];
  onClose: () => void;
  onAssigned?: () => void;
}) {
  const styles = useStyles();
  const { data, dispatch, actor, lookup } = useAdmin();
  const toast = useToast();
  const [allHubs, setAllHubs] = useState(false);

  const hubId = shipments[0] ? operatingHubId(data, shipments[0]) : undefined;
  const hubIds = allHubs ? data.hubs.map((h) => h.id) : hubId ? [hubId] : [];
  const options = hubIds.flatMap((h) => suggestRiders(data, h));
  const hubName = hubId ? lookup.hub.get(hubId)?.name : undefined;
  const currentRider = shipments.length === 1 ? shipments[0].riderId : undefined;

  const assign = (riderId: string, name: string) => {
    dispatch({ type: 'assign', ids: shipments.map((s) => s.id), riderId, actor });
    toast(`${shipments.length} parcel${shipments.length === 1 ? '' : 's'} assigned to ${name}`);
    onClose();
    onAssigned?.();
  };

  return (
    <Sheet
      visible={visible}
      title={currentRider ? 'Reassign rider' : 'Assign rider'}
      subtitle={`${shipments.length} parcel${shipments.length === 1 ? '' : 's'}${hubName ? ` · ${hubName}` : ''}`}
      onClose={onClose}>
      <View style={styles.chips}>
        <Chip variant="tint" label={hubName ?? 'This hub'} active={!allHubs} onPress={() => setAllHubs(false)} />
        <Chip variant="tint" label="All hubs" active={allHubs} onPress={() => setAllHubs(true)} />
      </View>

      {options.length === 0 && <Text style={styles.empty}>No verified, active riders at this hub. Try All hubs.</Text>}

      {options.map(({ rider, load }, i) => {
        const duty = DUTY_META[rider.duty];
        const isCurrent = rider.id === currentRider;
        return (
          <Pressable
            key={rider.id}
            accessibilityRole="button"
            accessibilityLabel={`Assign to ${rider.name}, ${duty.label}, ${load} active tasks`}
            disabled={isCurrent}
            onPress={() => assign(rider.id, rider.name)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed, isCurrent && styles.rowCurrent]}>
            <Avatar name={rider.name} size={42} status={duty.color} />
            <View style={styles.flex}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{rider.name}</Text>
                {i === 0 && !allHubs && rider.duty === 'online' && <Text style={styles.best}>BEST MATCH</Text>}
              </View>
              <Text style={styles.meta}>
                {duty.label} · {lookup.hub.get(rider.hubId)?.name} · {rider.vehicle.type}
              </Text>
            </View>
            <View style={styles.load}>
              <Text style={[styles.loadValue, load >= 15 && { color: '#DC2626' }]}>{load}</Text>
              <Text style={styles.loadLabel}>{isCurrent ? 'current' : 'tasks'}</Text>
            </View>
          </Pressable>
        );
      })}
    </Sheet>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  flex: { flex: 1 },
  chips: { flexDirection: 'row', gap: 8 },
  empty: { fontSize: 13, color: C.muted, paddingVertical: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F3',
  },
  rowPressed: { backgroundColor: C.primaryTint, borderColor: C.primaryBorder },
  rowCurrent: { opacity: 0.5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  best: { fontSize: 9, fontWeight: '800', color: '#15803D', backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  meta: { fontSize: 12, color: C.muted, marginTop: 2 },
  load: { alignItems: 'center', minWidth: 44 },
  loadValue: { fontSize: 18, fontWeight: '800', color: C.textStrong },
  loadLabel: { fontSize: 10, color: C.muted, fontWeight: '600' },
}));
