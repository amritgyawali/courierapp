import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { DateButton } from '@/components/vendor/date-button';
import {
  CalendarOutlineIcon,
  ChatBubbleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  FlagIcon,
  InfoCircleIcon,
  ListBoxIcon,
  ReplyFilledIcon,
  SortIcon,
  StoreSmallIcon,
  TicketTagIcon,
  TruckOutlineIcon,
} from '@/components/vendor/icons';
import { Card, Chip, EmptyState, ToolButton, VendorHeader } from '@/components/vendor/ui';
import { VendorColors as C } from '@/constants/theme';
import { ORDER_STATUS_LABELS, orderLogs, type VendorComment } from '@/data/vendor';
import { useVendorState } from '@/state/vendor-state';
import { formatDate, formatDateTime, isSameDay } from '@/utils/format';

type Category = 'comments' | 'logs' | 'tickets';
type CommentView = 'unclosed' | 'actions';

const INFO = {
  title: 'Actions',
  body: 'Comments are messages from KSG about your orders. Unclosed shows the ones you have not handled yet; tap Mark As Read once you have seen one and it moves to Actions. Logs is the status history of every order, and Tickets lists support requests.',
};

const openOrder = (orderId: string) => router.navigate({ pathname: '/vendor/orders', params: { q: orderId } });

export default function ActionsScreen() {
  const { orders, comments, isCommentRead, markCommentRead } = useVendorState();
  const [category, setCategory] = useState<Category>('comments');
  const [view, setView] = useState<CommentView>('unclosed');
  const [date, setDate] = useState<Date | null>(null);
  const [newestFirst, setNewestFirst] = useState(true);

  const onDate = (at: string) => !date || isSameDay(new Date(at), date);
  const byTime = (a: string, b: string) => (newestFirst ? b.localeCompare(a) : a.localeCompare(b));
  const statusOf = new Map(orders.map((o) => [o.id, ORDER_STATUS_LABELS[o.status]]));

  const visibleComments = comments
    .filter((c) => (view === 'unclosed' ? !isCommentRead(c.id) : isCommentRead(c.id)) && onDate(c.createdAt))
    .sort((a, b) => byTime(a.createdAt, b.createdAt));
  const visibleLogs = orderLogs(orders)
    .filter((l) => onDate(l.at))
    .sort((a, b) => byTime(a.at, b.at));

  const emptyForDate = date ? ` on ${formatDate(date)}` : '';

  return (
    <View style={styles.screen}>
      <VendorHeader title="Actions" info={INFO} />

      <View style={styles.controls}>
        <View style={styles.row} role="tablist">
          <Chip
            variant="tint"
            fill
            label="Comments"
            icon={(color) => <ChatBubbleIcon size={17} color={color} />}
            active={category === 'comments'}
            onPress={() => setCategory('comments')}
          />
          <Chip
            variant="tint"
            fill
            label="Logs"
            icon={(color) => <ClockIcon size={17} color={color} />}
            active={category === 'logs'}
            onPress={() => setCategory('logs')}
          />
          <Chip
            variant="tint"
            fill
            label="Tickets"
            icon={(color) => <TicketTagIcon size={17} color={color} />}
            active={category === 'tickets'}
            onPress={() => setCategory('tickets')}
          />
        </View>

        {category === 'comments' && (
          <View style={styles.row} role="tablist">
            <Chip
              variant="tint"
              fill
              label="Unclosed"
              icon={(color) => <ListBoxIcon size={17} color={color} />}
              active={view === 'unclosed'}
              onPress={() => setView('unclosed')}
            />
            <Chip
              variant="tint"
              fill
              label="Actions"
              icon={(color) => <ReplyFilledIcon size={17} color={color} />}
              active={view === 'actions'}
              onPress={() => setView('actions')}
            />
          </View>
        )}

        <View style={styles.row}>
          <DateButton value={date} onChange={setDate} maximumDate={new Date()} accessibilityLabel="Select date">
            <View style={styles.dateField}>
              <CalendarOutlineIcon size={18} color={C.faint} />
              <Text style={[styles.dateText, date && styles.dateTextSet]}>{date ? formatDate(date) : 'Select Date'}</Text>
              <ChevronDownIcon size={17} color={C.faint} />
            </View>
          </DateButton>
          {date && (
            <ToolButton label="Clear date" onPress={() => setDate(null)}>
              <CloseIcon size={18} color={C.muted} />
            </ToolButton>
          )}
          <ToolButton
            tint
            label={newestFirst ? 'Showing newest first. Show oldest first' : 'Showing oldest first. Show newest first'}
            onPress={() => setNewestFirst(!newestFirst)}>
            <SortIcon size={19} color={C.red} />
          </ToolButton>
        </View>
      </View>

      {category === 'comments' && (
        <FlatList
          data={visibleComments}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <CommentCard
              comment={item}
              read={isCommentRead(item.id)}
              lastStatus={statusOf.get(item.orderId) ?? '—'}
              onMarkRead={() => markCommentRead(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<ChatBubbleIcon size={30} color={C.red} />}
              title={view === 'unclosed' ? `No unclosed comments${emptyForDate}` : `No closed comments${emptyForDate}`}
              message={
                view === 'unclosed'
                  ? 'You are all caught up. New comments from KSG will appear here.'
                  : 'Comments you mark as read are kept here.'
              }
            />
          }
        />
      )}

      {category === 'logs' && (
        <FlatList
          data={visibleLogs}
          keyExtractor={(l) => l.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <OrderPill id={item.orderId} />
                <Text style={styles.logStatus}>{ORDER_STATUS_LABELS[item.status]}</Text>
              </View>
              <Text style={styles.commentText}>{item.title}</Text>
              <CardFooter at={item.at} onPress={() => openOrder(item.orderId)} />
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<ClockIcon size={30} color={C.red} />}
              title={`No logs${emptyForDate}`}
              message="Order status changes are recorded here."
            />
          }
        />
      )}

      {category === 'tickets' && (
        <EmptyState
          icon={<TicketTagIcon size={30} color={C.red} />}
          title="No tickets"
          message="Support tickets raised for your orders will be listed here."
        />
      )}
    </View>
  );
}

function OrderPill({ id }: { id: string }) {
  return (
    <View style={styles.orderPill}>
      <StoreSmallIcon size={15} color={C.red} />
      <Text style={styles.orderPillText}>#{id}</Text>
    </View>
  );
}

function CardFooter({ at, onPress }: { at: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open order"
      onPress={onPress}
      style={({ pressed }) => [styles.footer, pressed && { opacity: 0.6 }]}>
      <View style={styles.footerLeft}>
        <ClockIcon size={16} color={C.faint} />
        <Text style={styles.footerText}>{formatDateTime(at)}</Text>
      </View>
      <ChevronRightIcon size={17} color={C.red} />
    </Pressable>
  );
}

function CommentCard({
  comment,
  read,
  lastStatus,
  onMarkRead,
}: {
  comment: VendorComment;
  read: boolean;
  lastStatus: string;
  onMarkRead: () => void;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <OrderPill id={comment.orderId} />
        {read ? (
          <View style={[styles.readButton, styles.readDone]}>
            <CheckIcon size={15} color={C.muted} sw={3} />
            <Text style={[styles.readText, { color: C.muted }]}>Read</Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Mark comment on order ${comment.orderId} as read`}
            onPress={onMarkRead}
            style={({ pressed }) => [styles.readButton, pressed && { opacity: 0.7 }]}>
            <CheckIcon size={15} color={C.greenDark} sw={3} />
            <Text style={styles.readText}>Mark As Read</Text>
          </Pressable>
        )}
      </View>

      <View>
        <View style={styles.label}>
          <FlagIcon size={16} color="#3B82F6" />
          <Text style={styles.labelText}>Comment</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
      </View>

      <View style={styles.meta}>
        <View style={styles.metaCol}>
          <View style={styles.label}>
            <InfoCircleIcon size={16} color="#3B82F6" />
            <Text style={styles.labelText}>Type</Text>
          </View>
          <Text style={styles.metaValue}>{comment.type}</Text>
        </View>
        <View style={styles.metaCol}>
          <View style={styles.label}>
            <TruckOutlineIcon size={16} color={C.amber} />
            <Text style={styles.labelText}>Last Delivery Status</Text>
          </View>
          <Text style={styles.metaValue}>{lastStatus}</Text>
        </View>
      </View>

      <CardFooter at={comment.createdAt} onPress={() => openOrder(comment.orderId)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F8FA' },
  controls: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },
  row: { flexDirection: 'row', gap: 9 },
  dateField: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  dateText: { flex: 1, fontSize: 14, color: C.faint, fontWeight: '500' },
  dateTextSet: { color: C.text },
  list: { padding: 14, gap: 14, paddingBottom: 40 },
  card: { padding: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  orderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: C.redSoft,
  },
  orderPillText: { fontSize: 13, fontWeight: '700', color: C.red, letterSpacing: 0.3 },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#E7F8F0',
    borderWidth: 1,
    borderColor: '#CDF1DE',
  },
  readDone: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
  readText: { fontSize: 13, fontWeight: '700', color: C.greenDark },
  label: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  labelText: { fontSize: 13, color: C.muted },
  commentText: { fontSize: 15, fontWeight: '500', color: C.textStrong, letterSpacing: -0.1 },
  meta: { flexDirection: 'row', gap: 10 },
  metaCol: { flex: 1 },
  metaValue: { fontSize: 15, fontWeight: '500', color: C.textStrong, paddingLeft: 2 },
  logStatus: { fontSize: 12, fontWeight: '700', color: C.greenDark },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F5F6F8',
    paddingTop: 10,
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  footerText: { fontSize: 13, color: C.faint },
});
