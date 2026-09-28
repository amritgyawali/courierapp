import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { DateButton } from '@/components/portal/date-button';
import { BarsIcon, CalendarOutlineIcon, DownloadIcon, OfficeIcon, StoreSmallIcon } from '@/components/portal/icons';
import { Card, Chip, PortalHeader, SectionHeading } from '@/components/portal/ui';
import { BarChart, Button, ProgressBar, StatTile } from '@/components/portal/widgets';
import { PortalColors as C } from '@/constants/theme';
import { deliveredOn, shipmentsBetween, shipmentsCsv, STATUS_META, statusBreakdown } from '@/data/ops';
import { addDays, daysInclusive, formatDayMonthYear, formatRs, formatShortDate, percent, startOfDay } from '@/utils/format';
import { shareText } from '@/utils/links';

type Preset = 'today' | '7d' | '30d' | 'custom';

const INFO = {
  title: 'Reports & Analytics',
  body: 'Network performance for any date range: bookings, delivery success, revenue and COD, the status mix, top merchants and hub performance. Export the range as CSV to share with finance or management.',
};

export default function ReportsScreen() {
  const { data, lookup } = useAdmin();
  const today = startOfDay(new Date());
  const [preset, setPreset] = useState<Preset>('7d');
  const [from, setFrom] = useState(addDays(today, -6));
  const [to, setTo] = useState(today);

  const choose = (p: Preset) => {
    setPreset(p);
    if (p === 'today') setFrom(today);
    if (p === '7d') setFrom(addDays(today, -6));
    if (p === '30d') setFrom(addDays(today, -29));
    if (p !== 'custom') setTo(today);
  };

  const days = daysInclusive(from, to);
  const booked = shipmentsBetween(data, from, to);
  const dayList = Array.from({ length: days }, (_, i) => addDays(startOfDay(from), i));
  const deliveredInRange = dayList.flatMap((d) => deliveredOn(data, d));
  const failedInRange = booked.filter((s) => s.events.some((e) => e.status === 'failed')).length;
  const revenue = deliveredInRange.reduce((sum, s) => sum + s.charge, 0);
  const cod = deliveredInRange.reduce((sum, s) => sum + (s.pod?.collected ?? 0), 0);
  const success = percent(deliveredInRange.length, deliveredInRange.length + failedInRange);

  const chartDays = dayList.slice(-14);
  const breakdown = statusBreakdown(booked).sort((a, b) => b.count - a.count);

  const merchants = data.merchants
    .map((m) => ({ m, count: booked.filter((s) => s.merchantId === m.id).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const hubs = data.hubs
    .map((h) => {
      const hs = booked.filter((s) => s.hubId === h.id);
      const delivered = hs.filter((s) => s.status === 'delivered').length;
      return { h, total: hs.length, delivered, rate: percent(delivered, hs.filter((s) => s.status !== 'cancelled').length) };
    })
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <View style={styles.screen}>
      <PortalHeader title="Reports" info={INFO} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row} role="tablist">
          <Chip variant="tint" fill label="Today" active={preset === 'today'} onPress={() => choose('today')} />
          <Chip variant="tint" fill label="7 days" active={preset === '7d'} onPress={() => choose('7d')} />
          <Chip variant="tint" fill label="30 days" active={preset === '30d'} onPress={() => choose('30d')} />
          <Chip variant="tint" fill label="Custom" active={preset === 'custom'} onPress={() => setPreset('custom')} />
        </View>

        {preset === 'custom' && (
          <View style={styles.row}>
            <DateButton
              value={from}
              maximumDate={to}
              accessibilityLabel="Start date"
              onChange={(d) => setFrom(startOfDay(d))}>
              <DateBox label="From" date={from} />
            </DateButton>
            <DateButton
              value={to}
              minimumDate={from}
              maximumDate={today}
              accessibilityLabel="End date"
              onChange={(d) => setTo(startOfDay(d))}>
              <DateBox label="To" date={to} />
            </DateButton>
          </View>
        )}
        <Text style={styles.range}>
          {formatDayMonthYear(from)} – {formatDayMonthYear(to)} · {days} day{days === 1 ? '' : 's'}
        </Text>

        <View style={styles.row}>
          <StatTile icon={<BarsIcon size={20} color="#3B82F6" />} tint="#EFF6FF" value={booked.length} label="Booked" note={`${(booked.length / days).toFixed(1)} per day`} />
          <StatTile
            icon={<BarsIcon size={20} color="#16A34A" />}
            tint="#ECFDF5"
            value={deliveredInRange.length}
            label="Delivered"
            note={`${success}% success`}
            noteColor="#16A34A"
          />
        </View>
        <View style={styles.row}>
          <StatTile icon={<BarsIcon size={20} color="#0F766E" />} tint="#F0FDFA" value={formatRs(revenue)} label="Revenue" />
          <StatTile icon={<BarsIcon size={20} color={C.amber} />} tint="#FFFBEB" value={formatRs(cod)} label="COD collected" />
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Daily volume{days > 14 ? ' (last 14 days of range)' : ''}</Text>
          <BarChart
            data={chartDays.map((d) => ({
              label: formatShortDate(d).split(' ')[1],
              values: [data.shipments.filter((s) => startOfDay(new Date(s.createdAt)).getTime() === d.getTime()).length, deliveredOn(data, d).length],
            }))}
            colors={[C.red, '#16A34A']}
            legend={['Booked', 'Delivered']}
          />
        </Card>

        <SectionHeading icon={<BarsIcon size={20} color={C.red} />} title="Status mix" />
        <Card style={styles.card}>
          {breakdown.length === 0 && <Text style={styles.muted}>No shipments booked in this range.</Text>}
          {breakdown.map(({ status, count }) => (
            <View key={status} style={styles.barRow}>
              <View style={styles.barHead}>
                <Text style={styles.barLabel}>{STATUS_META[status].label}</Text>
                <Text style={styles.barValue}>
                  {count} · {percent(count, booked.length)}%
                </Text>
              </View>
              <ProgressBar value={percent(count, booked.length)} color={STATUS_META[status].color} height={7} />
            </View>
          ))}
        </Card>

        <SectionHeading icon={<StoreSmallIcon size={20} color={C.red} />} title="Top merchants" />
        <Card style={styles.card}>
          {merchants.length === 0 && <Text style={styles.muted}>No merchant activity in this range.</Text>}
          {merchants.map(({ m, count }, i) => (
            <View key={m.id} style={styles.tableRow}>
              <Text style={styles.rank}>{i + 1}</Text>
              <Text style={styles.tableName} numberOfLines={1}>
                {m.name}
              </Text>
              <Text style={styles.tableValue}>{count}</Text>
            </View>
          ))}
        </Card>

        <SectionHeading icon={<OfficeIcon size={20} color={C.red} />} title="Hub performance" />
        <Card style={styles.card}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableName, styles.th]}>Hub</Text>
            <Text style={[styles.tableCell, styles.th]}>Booked</Text>
            <Text style={[styles.tableCell, styles.th]}>Delivered</Text>
            <Text style={[styles.tableCell, styles.th]}>Success</Text>
          </View>
          {hubs.map(({ h, total, delivered, rate }) => (
            <View key={h.id} style={styles.tableRow}>
              <Text style={styles.tableName} numberOfLines={1}>
                {lookup.hub.get(h.id)?.name.replace(' Hub', '')}
              </Text>
              <Text style={styles.tableCell}>{total}</Text>
              <Text style={styles.tableCell}>{delivered}</Text>
              <Text style={[styles.tableCell, { color: rate >= 85 ? '#16A34A' : rate >= 70 ? C.amber : '#DC2626' }]}>{rate}%</Text>
            </View>
          ))}
        </Card>

        <Button
          title={`Export ${booked.length} shipments (CSV)`}
          icon={(c) => <DownloadIcon size={18} color={c} />}
          onPress={() => shareText(`KSG report ${formatDayMonthYear(from)}–${formatDayMonthYear(to)}`, shipmentsCsv(data, booked))}
        />
      </ScrollView>
    </View>
  );
}

function DateBox({ label, date }: { label: string; date: Date }) {
  return (
    <View style={styles.dateBox}>
      <CalendarOutlineIcon size={17} color={C.faint} />
      <View>
        <Text style={styles.dateLabel}>{label}</Text>
        <Text style={styles.dateValue}>{formatDayMonthYear(date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 10 },
  range: { fontSize: 12, color: C.muted, fontWeight: '600', paddingHorizontal: 4 },
  card: { padding: 14, gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  muted: { fontSize: 13, color: C.muted },
  barRow: { gap: 5 },
  barHead: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontSize: 13, color: C.text, fontWeight: '600' },
  barValue: { fontSize: 12, color: C.muted, fontWeight: '600' },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  tableHeader: { borderBottomWidth: 1, borderBottomColor: C.divider, paddingBottom: 8 },
  th: { fontSize: 11, fontWeight: '700', color: C.faint, textTransform: 'uppercase' },
  rank: { width: 20, fontSize: 13, fontWeight: '800', color: C.faint },
  tableName: { flex: 1, fontSize: 14, fontWeight: '600', color: C.text },
  tableValue: { fontSize: 14, fontWeight: '800', color: C.textStrong },
  tableCell: { width: 68, textAlign: 'right', fontSize: 13, fontWeight: '700', color: C.textStrong },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateLabel: { fontSize: 11, color: C.muted },
  dateValue: { fontSize: 14, fontWeight: '700', color: C.textStrong },
});
