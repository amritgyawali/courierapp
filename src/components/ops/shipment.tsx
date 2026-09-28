import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AlertTriangleIcon,
  CheckSquareIcon,
  ChevronRightIcon,
  ClockIcon,
  PinOutlineIcon,
  WineGlassIcon,
} from '@/components/portal/icons';
import { Badge, Card } from '@/components/portal/ui';
import { PortalColors as C } from '@/constants/theme';
import { isOverdue, type Shipment, type ShipmentEvent, type ShipmentStatus, STATUS_META } from '@/data/ops';
import { formatDateTime, formatRs, timeAgo } from '@/utils/format';

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const m = STATUS_META[status];
  return <Badge label={m.label.toUpperCase()} bg={m.bg} color={m.color} />;
}

/** Shipment summary card used across admin lists. Long-press or the checkbox toggles selection. */
export function ShipmentCard({
  shipment: s,
  merchantName,
  riderName,
  onPress,
  selected,
  onToggleSelect,
  footer,
  now = new Date(),
}: {
  shipment: Shipment;
  merchantName?: string;
  riderName?: string;
  onPress?: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
  footer?: ReactNode;
  now?: Date;
}) {
  const overdue = isOverdue(s, now);
  return (
    <Card style={[styles.card, selected && styles.cardSelected]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Shipment ${s.id}, ${STATUS_META[s.status].label}`}
        onPress={onPress}
        onLongPress={onToggleSelect}
        style={({ pressed }) => [styles.body, pressed && { opacity: 0.85 }]}>
        <View style={styles.header}>
          <View style={styles.idRow}>
            {onToggleSelect && (
              <Pressable role="checkbox" aria-checked={!!selected} aria-label={`Select ${s.id}`} hitSlop={10} onPress={onToggleSelect}>
                <CheckSquareIcon checked={!!selected} size={22} color={selected ? C.red : '#9CA3AF'} />
              </Pressable>
            )}
            <Text style={styles.id}>{s.id}</Text>
            {s.fragile && (
              <View style={styles.flag} accessibilityLabel="Fragile">
                <WineGlassIcon size={11} color="#D97706" />
              </View>
            )}
          </View>
          <StatusBadge status={s.status} />
        </View>

        <View style={styles.mainRow}>
          <View style={styles.flex}>
            <Text style={styles.receiver} numberOfLines={1}>
              {s.receiver.name}
            </Text>
            <View style={styles.metaRow}>
              <PinOutlineIcon size={13} color={C.faint} />
              <Text style={styles.meta} numberOfLines={1}>
                {s.receiver.address}
              </Text>
            </View>
          </View>
          <View style={styles.amounts}>
            <Text style={[styles.cod, s.cod === 0 && styles.codZero]}>{s.cod ? formatRs(s.cod) : 'Prepaid'}</Text>
            <Text style={styles.charge}>Fee {formatRs(s.charge)}</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.small} numberOfLines={1}>
            {merchantName ?? s.merchantId}
            {riderName ? ` · ${riderName}` : ''}
          </Text>
          <View style={styles.timeRow}>
            {overdue ? (
              <>
                <AlertTriangleIcon size={13} color="#DC2626" />
                <Text style={[styles.small, styles.overdue]}>SLA breached</Text>
              </>
            ) : (
              <>
                <ClockIcon size={13} color={C.faint} />
                <Text style={styles.small}>{timeAgo(s.updatedAt, now)}</Text>
              </>
            )}
            {onPress && <ChevronRightIcon size={14} color={C.red} />}
          </View>
        </View>
      </Pressable>
      {footer}
    </Card>
  );
}

/** Vertical tracking timeline, newest event first. */
export function Timeline({ events }: { events: ShipmentEvent[] }) {
  const list = [...events].reverse();
  return (
    <View>
      {list.map((e, i) => {
        const m = STATUS_META[e.status];
        const last = i === list.length - 1;
        return (
          <View key={`${e.status}-${e.at}-${i}`} style={styles.tlRow}>
            <View style={styles.tlRail}>
              <View style={[styles.tlDot, { backgroundColor: i === 0 ? m.color : '#CBD5E1' }]} />
              {!last && <View style={styles.tlLine} />}
            </View>
            <View style={[styles.flex, !last && styles.tlGap]}>
              <Text style={[styles.tlTitle, i === 0 && { color: m.color }]}>{m.label}</Text>
              {e.note && <Text style={styles.tlNote}>{e.note}</Text>}
              <Text style={styles.tlMeta}>
                {formatDateTime(e.at)} · {e.actor}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { overflow: 'hidden' },
  cardSelected: { borderColor: C.red, borderWidth: 1.5 },
  body: { padding: 14, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  id: { fontSize: 15, fontWeight: '800', color: C.textStrong, letterSpacing: 0.2 },
  flag: { padding: 3, borderRadius: 5, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  mainRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  receiver: { fontSize: 15, fontWeight: '600', color: C.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  meta: { fontSize: 12, color: C.muted, flexShrink: 1 },
  amounts: { alignItems: 'flex-end' },
  cod: { fontSize: 15, fontWeight: '800', color: C.red },
  codZero: { color: '#16A34A', fontSize: 13 },
  charge: { fontSize: 11, color: C.muted, marginTop: 2 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.divider,
    paddingTop: 9,
    gap: 8,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  small: { fontSize: 12, color: C.muted, flexShrink: 1 },
  overdue: { color: '#DC2626', fontWeight: '700' },
  tlRow: { flexDirection: 'row', gap: 12 },
  tlRail: { alignItems: 'center', width: 14 },
  tlDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  tlLine: { flex: 1, width: 2, backgroundColor: '#E5E7EB', marginVertical: 2 },
  tlGap: { paddingBottom: 16 },
  tlTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  tlNote: { fontSize: 13, color: '#4B5563', marginTop: 1 },
  tlMeta: { fontSize: 11, color: C.faint, marginTop: 3 },
});
