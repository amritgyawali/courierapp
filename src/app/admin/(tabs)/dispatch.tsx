import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';

import { AssignSheet } from '@/components/admin/assign-sheet';
import { useAdmin } from '@/components/admin/use-admin';
import { ShipmentCard } from '@/components/ops/shipment';
import { CheckSquareIcon, DispatchIcon, ReturnArrowIcon, StoreSmallIcon, TruckIcon } from '@/components/portal/icons';
import { Chip, EmptyState, PortalHeader } from '@/components/portal/ui';
import { Button, useNow, useToast } from '@/components/portal/widgets';
import { Text } from '@/components/text';
import { needsRider, operatingHubId, riderTasks, type Shipment } from '@/data/ops';
import { makeStyles, shadow, useColors } from '@/theme';

type Queue = 'deliveries' | 'pickups' | 'returns';

const QUEUE_TEST: Record<Queue, (s: Shipment) => boolean> = {
  deliveries: (s) => needsRider(s) && s.status === 'at-hub',
  pickups: (s) => needsRider(s) && s.status === 'pickup-requested',
  returns: (s) => needsRider(s) && s.status === 'returning',
};

const INFO = {
  title: 'Dispatch',
  body: 'Parcels waiting for a rider. Select parcels (tap the box or long-press a card) and assign them to a rider, or use Auto-assign to spread them across the online riders of each parcel’s hub, least busy first.',
};

export default function DispatchScreen() {
  const styles = useStyles();
  const C = useColors();
  const { data, dispatch, actor, lookup } = useAdmin();
  const toast = useToast();
  const now = useNow();
  const [queue, setQueue] = useState<Queue>('deliveries');
  const [hubId, setHubId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignOpen, setAssignOpen] = useState(false);

  const inQueue = data.shipments.filter(QUEUE_TEST[queue]);
  const list = inQueue.filter((s) => !hubId || operatingHubId(data, s) === hubId);
  const selectedShipments = list.filter((s) => selected.has(s.id));
  const counts = {
    deliveries: data.shipments.filter(QUEUE_TEST.deliveries).length,
    pickups: data.shipments.filter(QUEUE_TEST.pickups).length,
    returns: data.shipments.filter(QUEUE_TEST.returns).length,
  };
  const hubCounts = data.hubs
    .map((h) => ({ hub: h, count: inQueue.filter((s) => operatingHubId(data, s) === h.id).length }))
    .filter((x) => x.count > 0);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = list.length > 0 && list.every((s) => selected.has(s.id));

  /** Spread parcels over each hub's online riders, always giving the next parcel to the least loaded. */
  const autoAssign = () => {
    const targets = selectedShipments.length ? selectedShipments : list;
    const load = new Map(data.riders.map((r) => [r.id, riderTasks(data, r.id).length]));
    const plan = new Map<string, string[]>();
    let skipped = 0;
    for (const s of targets) {
      const hub = operatingHubId(data, s);
      const candidates = data.riders.filter((r) => r.hubId === hub && r.active && r.kyc === 'verified' && r.duty === 'online');
      if (candidates.length === 0) {
        skipped++;
        continue;
      }
      const best = candidates.reduce((a, b) => ((load.get(a.id) ?? 0) <= (load.get(b.id) ?? 0) ? a : b));
      load.set(best.id, (load.get(best.id) ?? 0) + 1);
      plan.set(best.id, [...(plan.get(best.id) ?? []), s.id]);
    }
    for (const [riderId, ids] of plan) dispatch({ type: 'assign', ids, riderId, actor });
    const assigned = targets.length - skipped;
    toast(
      assigned
        ? `Auto-assigned ${assigned} parcel${assigned === 1 ? '' : 's'} to ${plan.size} rider${plan.size === 1 ? '' : 's'}${skipped ? ` · ${skipped} skipped (no rider online)` : ''}`
        : 'No online riders available at these hubs',
      assigned ? 'success' : 'error',
    );
    setSelected(new Set());
  };

  return (
    <View style={styles.screen}>
      <PortalHeader title="Dispatch" info={INFO} />

      <View style={styles.top}>
        <View style={styles.row} role="tablist">
          <Chip
            variant="tint"
            fill
            label={`Deliveries ${counts.deliveries}`}
            icon={(c) => <TruckIcon size={16} color={c} />}
            active={queue === 'deliveries'}
            onPress={() => {
              setQueue('deliveries');
              setSelected(new Set());
            }}
          />
          <Chip
            variant="tint"
            fill
            label={`Pickups ${counts.pickups}`}
            icon={(c) => <StoreSmallIcon size={16} color={c} />}
            active={queue === 'pickups'}
            onPress={() => {
              setQueue('pickups');
              setSelected(new Set());
            }}
          />
          <Chip
            variant="tint"
            fill
            label={`Returns ${counts.returns}`}
            icon={(c) => <ReturnArrowIcon size={16} color={c} />}
            active={queue === 'returns'}
            onPress={() => {
              setQueue('returns');
              setSelected(new Set());
            }}
          />
        </View>
        {hubCounts.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubChips}>
            <Chip variant="neutral" label={`All hubs · ${inQueue.length}`} active={!hubId} onPress={() => setHubId(null)} />
            {hubCounts.map(({ hub, count }) => (
              <Chip key={hub.id} variant="neutral" label={`${hub.name.replace(' Hub', '')} · ${count}`} active={hubId === hub.id} onPress={() => setHubId(hub.id)} />
            ))}
          </ScrollView>
        )}
        {list.length > 0 && (
          <Pressable
            role="checkbox"
            aria-checked={allSelected}
            onPress={() => setSelected(allSelected ? new Set() : new Set(list.map((s) => s.id)))}
            style={styles.selectAll}>
            <CheckSquareIcon checked={allSelected} size={20} color={allSelected ? C.primary : '#9CA3AF'} />
            <Text style={styles.selectAllText}>{selected.size ? `${selectedShipments.length} selected` : `Select all ${list.length}`}</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={list}
        keyExtractor={(s) => s.id}
        contentContainerStyle={[styles.list, { paddingBottom: 120 }]}
        renderItem={({ item }) => (
          <ShipmentCard
            shipment={item}
            now={now}
            merchantName={queue === 'pickups' ? `${lookup.merchant.get(item.merchantId)?.name} (pickup)` : lookup.merchant.get(item.merchantId)?.name}
            selected={selected.has(item.id)}
            onToggleSelect={() => toggle(item.id)}
            onPress={() => router.push({ pathname: '/admin/shipment/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<DispatchIcon size={30} color={C.primary} />}
            title="All caught up"
            message="Every parcel in this queue has a rider. New parcels will appear here as they arrive."
          />
        }
      />

      {list.length > 0 && (
        <View style={styles.actionBar}>
          <Button title={selected.size ? `Auto-assign ${selectedShipments.length}` : 'Auto-assign all'} variant="outline" onPress={autoAssign} style={styles.flex} />
          <Button
            title="Assign to…"
            disabled={selectedShipments.length === 0}
            onPress={() => setAssignOpen(true)}
            style={styles.flex}
          />
        </View>
      )}

      <AssignSheet
        visible={assignOpen}
        shipments={selectedShipments}
        onClose={() => setAssignOpen(false)}
        onAssigned={() => setSelected(new Set())}
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  top: { backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8, gap: 10, borderBottomWidth: 1, borderBottomColor: '#F1F2F4' },
  row: { flexDirection: 'row', gap: 8 },
  hubChips: { gap: 8 },
  selectAll: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  selectAllText: { fontSize: 13, fontWeight: '600', color: C.text },
  list: { padding: 12, gap: 12 },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F3',
    boxShadow: shadow(-2, 10, 0.06),
  },
}));
