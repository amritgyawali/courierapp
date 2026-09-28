import { FlatList, StyleSheet, Text, View } from 'react-native';

import { MegaphoneOutlineIcon } from '@/components/portal/icons';
import { Badge, Card, EmptyState, PortalHeader } from '@/components/portal/ui';
import { useNow } from '@/components/portal/widgets';
import { useRider } from '@/components/rider/use-rider';
import { PortalColors as C } from '@/constants/theme';
import { formatDateTime, timeAgo } from '@/utils/format';

export default function RiderAnnouncements() {
  const now = useNow();
  const { data } = useRider(now);
  const list = data.announcements.filter((a) => a.audience !== 'merchants');

  return (
    <View style={styles.screen}>
      <PortalHeader title="Announcements" />
      <FlatList
        data={list}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: a }) => {
          const fresh = now.getTime() - new Date(a.at).getTime() < 24 * 3600000;
          return (
            <Card style={[styles.card, fresh && styles.fresh]}>
              <View style={styles.head}>
                {fresh ? <Badge label="NEW" bg={C.redSoft} color={C.red} /> : <View />}
                <Text style={styles.meta}>{timeAgo(a.at, now)}</Text>
              </View>
              <Text style={styles.title}>{a.title}</Text>
              <Text style={styles.body}>{a.body}</Text>
              <Text style={styles.meta}>
                {a.author} · {formatDateTime(a.at)}
              </Text>
            </Card>
          );
        }}
        ListEmptyComponent={<EmptyState icon={<MegaphoneOutlineIcon size={30} color={C.red} />} title="No announcements" message="Notices from operations appear here." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.screenBg },
  list: { padding: 12, gap: 12, paddingBottom: 40 },
  card: { padding: 14, gap: 6 },
  fresh: { borderLeftWidth: 4, borderLeftColor: C.red },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: C.textStrong },
  body: { fontSize: 14, color: '#374151', lineHeight: 21 },
  meta: { fontSize: 12, color: C.muted },
});
