import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { HistoryIcon } from '@/components/portal/icons';
import { Card, EmptyState, PortalHeader, SearchCountBar } from '@/components/portal/ui';
import { Avatar, useNow } from '@/components/portal/widgets';
import { Text } from '@/components/text';
import { makeStyles, useColors } from '@/theme';
import { formatDateTime, timeAgo } from '@/utils/format';

const INFO = {
  title: 'Audit Log',
  body: 'A tamper-evident record of administrative actions: who did what, to which record, and when. Search by person, action or record.',
};

export default function AuditScreen() {
  const styles = useStyles();
  const C = useColors();
  const { data } = useAdmin();
  const now = useNow();
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const list = data.audit.filter((a) => !q || `${a.actor} ${a.action} ${a.target}`.toLowerCase().includes(q));

  return (
    <View style={styles.screen}>
      <PortalHeader title="Audit Log" info={INFO} />
      <View style={styles.toolbar}>
        <SearchCountBar
          icon={<HistoryIcon size={18} color={C.primary} />}
          label={`${list.length} event${list.length === 1 ? '' : 's'}`}
          searching={searching}
          onToggleSearch={() => {
            if (searching) setQuery('');
            setSearching(!searching);
          }}
          query={query}
          onQueryChange={setQuery}
          placeholder="Person, action or record"
        />
      </View>
      <FlatList
        data={list}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: a }) => (
          <Card style={styles.card}>
            <Avatar name={a.actor} size={38} />
            <View style={styles.flex}>
              <Text style={styles.text}>
                <Text style={styles.actor}>{a.actor}</Text> {a.action.charAt(0).toLowerCase() + a.action.slice(1)}
              </Text>
              <Text style={styles.target} numberOfLines={1}>
                {a.target}
              </Text>
              <Text style={styles.meta}>
                {timeAgo(a.at, now)} · {formatDateTime(a.at)}
              </Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState icon={<HistoryIcon size={30} color={C.primary} />} title="No events" message="Admin actions will be recorded here." />}
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  toolbar: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 },
  list: { padding: 12, gap: 10, paddingBottom: 40 },
  card: { flexDirection: 'row', gap: 12, padding: 12, alignItems: 'flex-start' },
  text: { fontSize: 14, color: C.text },
  actor: { fontWeight: '700', color: C.textStrong },
  target: { fontSize: 13, fontWeight: '600', color: C.primary, marginTop: 2 },
  meta: { fontSize: 11, color: C.faint, marginTop: 4 },
}));
