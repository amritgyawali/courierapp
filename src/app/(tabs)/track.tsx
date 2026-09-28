import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AddTrackingModal } from '@/components/add-tracking-modal';
import { EmptyBoxIllustration } from '@/components/brand';
import { TicketIcon, TrashIcon } from '@/components/icons';
import { Fab, ScreenHeader } from '@/components/ui';
import { Colors, cardShadow } from '@/constants/theme';
import { STATUS_META } from '@/data/ops';
import { useAppState } from '@/state/app-state';
import { useOps } from '@/state/ops-state';
import { timeAgo } from '@/utils/format';

export default function TrackScreen() {
  const { trackings, addTracking, removeTracking } = useAppState();
  const { data } = useOps();
  const shipments = new Map(data.shipments.map((s) => [s.id, s]));
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Track" />

      {trackings.length === 0 ? (
        <View style={styles.empty}>
          <EmptyBoxIllustration />
          <Text style={styles.emptyText}>Add a tracking number to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={trackings}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const live = shipments.get(item.number);
            const status = live ? STATUS_META[live.status] : null;
            return (
              <View style={styles.card}>
                <View style={styles.cardIcon}>
                  <TicketIcon size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardNumber}>{item.number}</Text>
                  {status && live ? (
                    <Text style={styles.cardMeta}>
                      <Text style={{ color: status.color, fontWeight: '700' }}>{status.label}</Text> ·{' '}
                      {timeAgo(live.updatedAt)}
                    </Text>
                  ) : (
                    <Text style={styles.cardMeta}>
                      Added {new Date(item.addedAt).toLocaleDateString()} · Awaiting update
                    </Text>
                  )}
                </View>
                <Pressable
                  accessibilityLabel={`Remove ${item.number}`}
                  hitSlop={10}
                  onPress={() => removeTracking(item.id)}>
                  <TrashIcon />
                </Pressable>
              </View>
            );
          }}
        />
      )}

      <Fab label="Add tracking number" onPress={() => setModalOpen(true)} />

      <AddTrackingModal visible={modalOpen} onClose={() => setModalOpen(false)} onAdd={addTracking} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.screenBg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginTop: -32 },
  emptyText: { marginTop: 28, fontSize: 17, color: '#212529', textAlign: 'center', letterSpacing: -0.2 },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...cardShadow,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDECEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumber: { fontSize: 16, fontWeight: '700', color: Colors.black, letterSpacing: 0.3 },
  cardMeta: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
});
