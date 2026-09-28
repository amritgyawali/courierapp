import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { BikeIcon, CubeIcon, MessageIcon, StoreSmallIcon, UserIcon } from '@/components/portal/icons';
import { Badge, Card, Chip, EmptyState, PortalHeader } from '@/components/portal/ui';
import { Button, KeyValue, Sheet, useNow, useToast } from '@/components/portal/widgets';
import { Text } from '@/components/text';
import { PRIORITY_META, type Ticket, TICKET_STATUS_META, type TicketStatus } from '@/data/ops';
import { makeStyles, useColors } from '@/theme';
import { formatDateTime, timeAgo } from '@/utils/format';

type Filter = TicketStatus | 'all';

const CHANNEL_ICON = {
  customer: (c: string) => <UserIcon size={15} color={c} />,
  merchant: (c: string) => <StoreSmallIcon size={15} color={c} />,
  rider: (c: string) => <BikeIcon size={15} color={c} />,
};

const INFO = {
  title: 'Support Tickets',
  body: 'Requests from customers, merchants and riders, most urgent first. Start a ticket to take ownership, and resolve it when the issue is fixed. Linked parcels open in one tap.',
};

export default function TicketsScreen() {
  const styles = useStyles();
  const C = useColors();
  const { data, dispatch, actor, me } = useAdmin();
  const toast = useToast();
  const now = useNow();
  const [filter, setFilter] = useState<Filter>('open');
  const [openId, setOpenId] = useState<string | null>(null);

  const count = (f: Filter) => data.tickets.filter((t) => f === 'all' || t.status === f).length;
  const list = data.tickets
    .filter((t) => filter === 'all' || t.status === filter)
    .sort((a, b) => PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank || b.createdAt.localeCompare(a.createdAt));
  const ticket = data.tickets.find((t) => t.id === openId);

  const update = (t: Ticket, status: TicketStatus) => {
    dispatch({ type: 'ticket', id: t.id, status, assignee: status === 'in-progress' ? me.name : undefined, actor });
    toast(status === 'resolved' ? `${t.id} resolved` : status === 'in-progress' ? `You are handling ${t.id}` : `${t.id} reopened`);
    setOpenId(null);
  };

  return (
    <View style={styles.screen}>
      <PortalHeader title="Support Tickets" info={INFO} />
      <View style={styles.tabs} role="tablist">
        {(['open', 'in-progress', 'resolved', 'all'] as Filter[]).map((f) => (
          <Chip
            key={f}
            variant="tint"
            fill
            label={`${f === 'all' ? 'All' : TICKET_STATUS_META[f].label} ${count(f)}`}
            active={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>

      <FlatList
        data={list}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: t }) => {
          const p = PRIORITY_META[t.priority];
          const st = TICKET_STATUS_META[t.status];
          return (
            <Pressable accessibilityRole="button" onPress={() => setOpenId(t.id)}>
              {({ pressed }) => (
                <Card style={[styles.card, pressed && { opacity: 0.85 }, t.priority === 'urgent' && t.status !== 'resolved' && styles.urgent]}>
                  <View style={styles.head}>
                    <Text style={styles.id}>{t.id}</Text>
                    <View style={styles.badges}>
                      <Badge label={p.label.toUpperCase()} bg={p.bg} color={p.color} />
                      <Badge label={st.label.toUpperCase()} bg={st.bg} color={st.color} />
                    </View>
                  </View>
                  <Text style={styles.subject}>{t.subject}</Text>
                  <Text style={styles.body} numberOfLines={2}>
                    {t.body}
                  </Text>
                  <View style={styles.foot}>
                    <View style={styles.requester}>
                      {CHANNEL_ICON[t.channel](C.muted)}
                      <Text style={styles.meta}>{t.requester}</Text>
                    </View>
                    <Text style={styles.meta}>{timeAgo(t.createdAt, now)}</Text>
                  </View>
                </Card>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={<EmptyState icon={<MessageIcon size={30} color={C.primary} />} title="No tickets here" message="Nothing waiting in this queue." />}
      />

      <Sheet
        visible={!!ticket}
        title={ticket?.subject ?? ''}
        subtitle={ticket ? `${ticket.id} · ${PRIORITY_META[ticket.priority].label} priority` : undefined}
        onClose={() => setOpenId(null)}
        footer={
          ticket && (
            <>
              {ticket.status === 'open' && <Button title="Start handling" onPress={() => update(ticket, 'in-progress')} />}
              {ticket.status !== 'resolved' && <Button title="Mark resolved" variant="success" onPress={() => update(ticket, 'resolved')} />}
              {ticket.status === 'resolved' && <Button title="Reopen" variant="outline" onPress={() => update(ticket, 'open')} />}
            </>
          )
        }>
        {ticket && (
          <>
            <Text style={styles.sheetBody}>{ticket.body}</Text>
            <KeyValue label="From" value={`${ticket.requester} (${ticket.channel})`} />
            <KeyValue label="Opened" value={formatDateTime(ticket.createdAt)} />
            <KeyValue label="Last update" value={formatDateTime(ticket.updatedAt)} />
            <KeyValue label="Handled by" value={ticket.assignee ?? 'Unassigned'} />
            {ticket.shipmentId && (
              <Button
                title={`Open parcel ${ticket.shipmentId}`}
                variant="soft"
                icon={(c) => <CubeIcon size={16} color={c} />}
                onPress={() => {
                  setOpenId(null);
                  router.push({ pathname: '/admin/shipment/[id]', params: { id: ticket.shipmentId! } });
                }}
              />
            )}
          </>
        )}
      </Sheet>
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
  tabs: { flexDirection: 'row', gap: 6, padding: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F2F4' },
  list: { padding: 12, gap: 12, paddingBottom: 40 },
  card: { padding: 14, gap: 6 },
  urgent: { borderColor: '#FCA5A5', borderLeftWidth: 4, borderLeftColor: '#DC2626' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  id: { fontSize: 13, fontWeight: '800', color: C.muted },
  badges: { flexDirection: 'row', gap: 6 },
  subject: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  body: { fontSize: 13, color: '#4B5563', lineHeight: 19 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  requester: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: 12, color: C.muted },
  sheetBody: { fontSize: 14, color: C.text, lineHeight: 21 },
}));
