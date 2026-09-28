import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AssignSheet } from '@/components/admin/assign-sheet';
import { useAdmin } from '@/components/admin/use-admin';
import { ShipmentCard } from '@/components/ops/shipment';
import { AlertTriangleIcon, BikeIcon, ClockIcon, ReturnArrowIcon } from '@/components/portal/icons';
import { Chip, EmptyState, PortalHeader } from '@/components/portal/ui';
import { Button, useNow, useToast } from '@/components/portal/widgets';
import { PortalColors as C } from '@/constants/theme';
import { isOverdue, type Shipment } from '@/data/ops';

type Tab = 'failed' | 'overdue' | 'returning' | 'returned';

const INFO = {
  title: 'Returns & Exceptions',
  body: 'Failed delivery attempts, parcels past their promised time, and returns to merchants. Re-queue a failed parcel for another attempt, or start a return once the attempt limit is reached or the receiver refuses.',
};

export default function ExceptionsScreen() {
  const { data, dispatch, actor, lookup } = useAdmin();
  const toast = useToast();
  const now = useNow();
  const [tab, setTab] = useState<Tab>('failed');
  const [assigning, setAssigning] = useState<Shipment | null>(null);

  const tests: Record<Tab, (s: Shipment) => boolean> = {
    failed: (s) => s.status === 'failed',
    overdue: (s) => isOverdue(s, now),
    returning: (s) => s.status === 'returning',
    returned: (s) => s.status === 'returned',
  };
  const list = data.shipments.filter(tests[tab]);
  const count = (t: Tab) => data.shipments.filter(tests[t]).length;

  return (
    <View style={styles.screen}>
      <PortalHeader title="Returns & Exceptions" info={INFO} />
      <View style={styles.tabs} role="tablist">
        <Chip variant="tint" fill label={`Failed ${count('failed')}`} active={tab === 'failed'} onPress={() => setTab('failed')} />
        <Chip variant="tint" fill label={`Late ${count('overdue')}`} active={tab === 'overdue'} onPress={() => setTab('overdue')} />
        <Chip variant="tint" fill label={`Returning ${count('returning')}`} active={tab === 'returning'} onPress={() => setTab('returning')} />
        <Chip variant="tint" fill label={`Returned ${count('returned')}`} active={tab === 'returned'} onPress={() => setTab('returned')} />
      </View>

      <FlatList
        data={list}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: s }) => {
          const limitReached = s.attempts >= data.settings.maxAttempts;
          return (
            <ShipmentCard
              shipment={s}
              now={now}
              merchantName={lookup.merchant.get(s.merchantId)?.name}
              riderName={s.riderId ? lookup.rider.get(s.riderId)?.name : undefined}
              onPress={() => router.push({ pathname: '/admin/shipment/[id]', params: { id: s.id } })}
              footer={
                s.status === 'failed' ? (
                  <View style={styles.footer}>
                    <Text style={styles.reason}>
                      {s.failReason ?? 'Delivery failed'} · attempt {s.attempts}/{data.settings.maxAttempts}
                    </Text>
                    <View style={styles.actions}>
                      <Button
                        compact
                        variant="outline"
                        title="Return"
                        icon={(c) => <ReturnArrowIcon size={15} color={c} />}
                        style={styles.flex}
                        onPress={() => {
                          dispatch({ type: 'returnToMerchant', id: s.id, actor });
                          toast(`${s.id} returning to merchant`);
                        }}
                      />
                      <Button
                        compact
                        title={limitReached ? 'Limit reached' : 'Re-attempt'}
                        disabled={limitReached}
                        icon={(c) => <ClockIcon size={15} color={c} />}
                        style={styles.flex}
                        onPress={() => {
                          dispatch({ type: 'reattempt', id: s.id, actor });
                          toast(`${s.id} queued for another attempt`);
                        }}
                      />
                    </View>
                  </View>
                ) : s.status === 'returning' && !s.riderId ? (
                  <View style={styles.footer}>
                    <Button compact title="Assign return rider" icon={(c) => <BikeIcon size={15} color={c} />} onPress={() => setAssigning(s)} />
                  </View>
                ) : undefined
              }
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState icon={<AlertTriangleIcon size={30} color={C.red} />} title="Nothing to resolve" message="Parcels that need attention will show up here." />
        }
      />

      <AssignSheet visible={!!assigning} shipments={assigning ? [assigning] : []} onClose={() => setAssigning(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  tabs: { flexDirection: 'row', gap: 6, padding: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F2F4' },
  list: { padding: 12, gap: 12, paddingBottom: 40 },
  footer: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  reason: { fontSize: 12, fontWeight: '600', color: C.red },
  actions: { flexDirection: 'row', gap: 10 },
});
