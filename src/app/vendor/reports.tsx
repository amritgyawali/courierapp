import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DateButton } from '@/components/portal/date-button';
import {
  BagIcon,
  CalendarGridIcon,
  CalendarOutlineIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  DocumentIcon,
  FilterLinesIcon,
  ReportIcon,
  TrendUpIcon,
} from '@/components/portal/icons';
import { Card, Chip, chunk, GridRow, IconTile, PortalHeader } from '@/components/portal/ui';
import { shadow, PortalColors as C } from '@/constants/theme';
import { dailyBreakdown, MAX_REPORT_DAYS, ordersInRange, reportSummary, type ReportSummary } from '@/data/vendor';
import { useVendorState } from '@/state/vendor-state';
import { addDays, daysInclusive, formatAmount, formatDate, formatDayMonthYear, formatRs, startOfDay } from '@/utils/format';

type Tab = 'sales' | 'daily';
type Range = { from: Date; to: Date };

const INFO = {
  title: 'Reports',
  body: `Pick a date range of up to ${MAX_REPORT_DAYS} days and tap the filter button. Sales Report totals your orders and sales for the whole range; Daily Order Report breaks the same figures down day by day.`,
};

const defaultRange = (): Range => {
  const to = startOfDay(new Date());
  return { from: addDays(to, -7), to };
};

type Tile = { label: string; value: number; bg: string };

const orderTiles = (s: ReportSummary): Tile[] => [
  { label: 'Created', value: s.created, bg: '#ECF4FD' },
  { label: 'Delivered', value: s.delivered, bg: '#EAF8F1' },
  { label: 'Same Day Delivery', value: s.sameDay, bg: '#F0EEFC' },
  { label: 'Pending Delivery', value: s.pendingDelivery, bg: '#FDF4EB' },
  { label: 'Returned', value: s.returned, bg: '#FDECEF' },
  { label: 'Pending Return', value: s.pendingReturn, bg: '#FEF9E7' },
];

const salesTiles = (s: ReportSummary): Tile[] => [
  { label: 'Package Value', value: s.packageValue, bg: '#EDF5FE' },
  { label: 'Delivered Sales', value: s.deliveredSales, bg: '#EAF8F1' },
  { label: 'Pending Sales', value: s.pendingSales, bg: '#FDF4EB' },
  { label: 'Returned Value', value: s.returnedValue, bg: '#FDECEF' },
  { label: 'Pending Return Value', value: s.pendingReturnValue, bg: '#F0F5FA' },
];

export default function ReportsScreen() {
  const { orders } = useVendorState();
  const [tab, setTab] = useState<Tab>('sales');
  const [draft, setDraft] = useState<Range>(defaultRange);
  const [range, setRange] = useState<Range>(defaultRange);
  const [error, setError] = useState('');

  const apply = () => {
    if (draft.from > draft.to) return setError('Start date must be before the end date.');
    if (daysInclusive(draft.from, draft.to) > MAX_REPORT_DAYS)
      return setError(`Please choose a range of ${MAX_REPORT_DAYS} days or less.`);
    setError('');
    setRange(draft);
  };

  const days = daysInclusive(range.from, range.to);
  const daysLabel = `${days} ${days === 1 ? 'day' : 'days'}`;
  const summary = reportSummary(ordersInRange(orders, range.from, range.to));
  const today = startOfDay(new Date());

  return (
    <View style={styles.screen}>
      <PortalHeader title="Reports" info={INFO} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.row} role="tablist">
          <Chip
            variant="tint"
            fill
            label="Sales Report"
            icon={(color) => <ReportIcon size={17} color={color} filled />}
            active={tab === 'sales'}
            onPress={() => setTab('sales')}
            style={styles.bigChip}
          />
          <Chip
            variant="tint"
            fill
            label="Daily Order Report"
            icon={(color) => <CalendarGridIcon size={17} color={color} />}
            active={tab === 'daily'}
            onPress={() => setTab('daily')}
            style={styles.bigChip}
          />
        </View>

        <View style={styles.filters}>
          <View style={styles.row}>
            <DateFilterField
              label="Start date"
              value={draft.from}
              maximumDate={today}
              onChange={(from) => setDraft((d) => ({ ...d, from }))}
              onClear={() => setDraft((d) => ({ ...d, from: defaultRange().from }))}
            />
            <DateFilterField
              label="End date"
              value={draft.to}
              maximumDate={today}
              onChange={(to) => setDraft((d) => ({ ...d, to }))}
              onClear={() => setDraft((d) => ({ ...d, to: defaultRange().to }))}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Apply date range"
              onPress={apply}
              style={({ pressed }) => [styles.applyButton, pressed && { backgroundColor: C.redPressed }]}>
              <FilterLinesIcon size={22} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={[styles.helper, error && styles.helperError]} accessibilityLiveRegion="polite">
            {error || `Day-wise breakdown · max ${MAX_REPORT_DAYS} days range`}
          </Text>
        </View>

        {tab === 'sales' ? (
          <>
            <View style={styles.row}>
              <StatBox
                icon={<DocumentIcon size={20} color="#3B82F6" />}
                tint="#EFF6FF"
                value={String(summary.created)}
                title="Orders Created"
                note={daysLabel}
                noteColor="#2563EB"
              />
              <StatBox
                icon={<CheckCircleIcon size={20} color="#10B981" />}
                tint="#ECFDF5"
                value={String(summary.delivered)}
                title="Delivered"
                note={`${summary.deliveryRate}% rate`}
                noteColor="#059669"
              />
            </View>
            <View style={styles.row}>
              <StatBox
                icon={<TrendUpIcon size={20} color="#A855F7" />}
                tint="#FAF5FF"
                value={formatRs(summary.deliveredSales)}
                title="Delivered Sales"
              />
              <StatBox
                icon={<ClockIcon size={20} color={C.amber} />}
                tint="#FFF7ED"
                value={formatRs(summary.pendingSales)}
                title="Pending Sales"
              />
            </View>

            <View style={styles.breakdownHeader}>
              <View style={styles.breakdownTitleRow}>
                <CalendarOutlineIcon size={18} color="#334155" />
                <Text style={styles.breakdownTitle}>Daily Breakdown</Text>
              </View>
              <Text style={styles.daysPill}>{daysLabel}</Text>
            </View>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryPill}>
                  <ReportIcon size={15} color="#FFFFFF" filled />
                  <Text style={styles.summaryPillText}>Total Summary</Text>
                </View>
                <View style={styles.summaryDays}>
                  <CalendarOutlineIcon size={15} color="#BE123C" />
                  <Text style={styles.summaryDaysText}>{daysLabel}</Text>
                </View>
              </View>
              <TileGroup
                icon={<BagIcon size={15} color="#2563EB" />}
                title="Orders (Total)"
                color="#2563EB"
                tiles={orderTiles(summary)}
              />
              <TileGroup
                icon={<TrendUpIcon size={15} color="#059669" />}
                title="Sales Value (Rs.) (Total)"
                color="#059669"
                tiles={salesTiles(summary)}
              />
            </Card>
          </>
        ) : (
          dailyBreakdown(orders, range.from, range.to).map(({ day, summary: s }) => (
            <Card key={day.toISOString()} style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryDays}>
                  <CalendarOutlineIcon size={16} color={C.red} />
                  <Text style={styles.dayTitle}>{formatDate(day)}</Text>
                </View>
                <Text style={styles.daySales}>{formatRs(s.packageValue)}</Text>
              </View>
              <GridRow columns={4}>
                {orderTiles(s)
                  .filter((t) => ['Created', 'Delivered', 'Pending Delivery', 'Returned'].includes(t.label))
                  .map((t) => (
                    <MiniTile key={t.label} tile={t} />
                  ))}
              </GridRow>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function DateFilterField({
  label,
  value,
  onChange,
  onClear,
  maximumDate,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  onClear: () => void;
  maximumDate: Date;
}) {
  return (
    <View style={styles.dateWrap}>
      <DateButton value={value} onChange={onChange} maximumDate={maximumDate} accessibilityLabel={label}>
        <View style={styles.dateField}>
          <CalendarOutlineIcon size={17} color={C.faint} />
          <Text style={styles.dateText} numberOfLines={1}>
            {formatDayMonthYear(value)}
          </Text>
          <View style={styles.clearSpace} />
          <ChevronDownIcon size={15} color={C.faint} />
        </View>
      </DateButton>
      {/* Rendered after the picker trigger so it stays tappable above it (including the web overlay). */}
      <Pressable accessibilityRole="button" accessibilityLabel={`Reset ${label.toLowerCase()}`} onPress={onClear} hitSlop={6} style={styles.clear}>
        <CloseIcon size={9} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function StatBox({
  icon,
  tint,
  value,
  title,
  note,
  noteColor,
}: {
  icon: ReactNode;
  tint: string;
  value: string;
  title: string;
  note?: string;
  noteColor?: string;
}) {
  return (
    <View style={styles.statBox} accessible accessibilityLabel={`${title}: ${value}${note ? `, ${note}` : ''}`}>
      <View style={styles.statTop}>
        <IconTile bg={tint} size={40} radius={12}>
          {icon}
        </IconTile>
        <Text style={[styles.statValue, value.startsWith('Rs.') && styles.statValueMoney]}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      {note && (
        <View style={styles.noteRow}>
          <View style={[styles.noteDot, { backgroundColor: noteColor }]} />
          <Text style={[styles.noteText, { color: noteColor }]}>{note}</Text>
        </View>
      )}
    </View>
  );
}

function TileGroup({ icon, title, color, tiles }: { icon: ReactNode; title: string; color: string; tiles: Tile[] }) {
  return (
    <View style={styles.tileGroup}>
      <View style={styles.tileGroupTitle}>
        {icon}
        <Text style={[styles.tileGroupText, { color }]}>{title}</Text>
      </View>
      {chunk(tiles, 4).map((row, i) => (
        <GridRow key={i} columns={4}>
          {row.map((t) => (
            <MiniTile key={t.label} tile={t} />
          ))}
        </GridRow>
      ))}
    </View>
  );
}

function MiniTile({ tile }: { tile: Tile }) {
  return (
    <View style={[styles.miniTile, { backgroundColor: tile.bg }]} accessible accessibilityLabel={`${tile.label}: ${tile.value}`}>
      <Text style={styles.miniValue}>{formatAmount(tile.value, 0)}</Text>
      <Text style={styles.miniLabel}>{tile.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2F6FA' },
  content: { padding: 14, gap: 14, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 10 },
  bigChip: { paddingVertical: 12 },
  filters: { gap: 8 },
  dateWrap: { flex: 1 },
  dateField: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  dateText: { flexShrink: 1, fontSize: 13, fontWeight: '500', color: '#334155' },
  clearSpace: { flex: 1, minWidth: 20 },
  clear: {
    position: 'absolute',
    right: 30,
    top: 16,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow(2, 6, 0.15),
  },
  helper: { fontSize: 12, fontWeight: '500', color: '#64748B', paddingHorizontal: 4 },
  helperError: { color: C.red },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 14,
    boxShadow: shadow(1, 4, 0.04),
  },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  statValueMoney: { fontSize: 15 },
  statTitle: { fontSize: 11, fontWeight: '700', color: '#475569', letterSpacing: 0.8, textTransform: 'uppercase' },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  noteDot: { width: 6, height: 6, borderRadius: 3 },
  noteText: { fontSize: 12, fontWeight: '600' },
  breakdownHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 },
  breakdownTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breakdownTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B', letterSpacing: 1, textTransform: 'uppercase' },
  daysPill: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  summaryCard: { padding: 14, gap: 16 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: C.red,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  summaryPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  summaryDays: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  summaryDaysText: { fontSize: 12, fontWeight: '500', color: '#475569' },
  dayTitle: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  daySales: { fontSize: 13, fontWeight: '700', color: '#059669' },
  tileGroup: { gap: 8 },
  tileGroupTitle: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 2 },
  tileGroupText: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  miniTile: { borderRadius: 9, paddingVertical: 10, paddingHorizontal: 3, alignItems: 'center', minHeight: 62 },
  miniValue: { fontSize: 14, fontWeight: '700', color: '#334155' },
  miniLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 12,
  },
});
