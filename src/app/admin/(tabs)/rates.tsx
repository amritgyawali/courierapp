import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { CalculatorOutlineIcon } from '@/components/portal/icons';
import { Card, Chip, PortalHeader, SectionHeading } from '@/components/portal/ui';
import { Button, KeyValue, TextField, Toggle, useToast } from '@/components/portal/widgets';
import { PortalColors as C } from '@/constants/theme';
import { quote, type RateCard, type ZoneId } from '@/data/ops';
import { formatRs } from '@/utils/format';

const INFO = {
  title: 'Rate Card',
  body: 'Delivery prices by zone: a price for the first kilo, a price for every extra kilo (rounded up to the next half kilo), a COD handling fee and a fragile surcharge. Use the calculator to quote a merchant before saving changes.',
};

const num = (v: string) => {
  const n = Number(v.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export default function RatesScreen() {
  const { data, dispatch, actor } = useAdmin();
  const toast = useToast();
  const [card, setCard] = useState<RateCard>(data.rateCard);
  const dirty = JSON.stringify(card) !== JSON.stringify(data.rateCard);

  const [zone, setZone] = useState<ZoneId>('valley');
  const [weight, setWeight] = useState('1.5');
  const [cod, setCod] = useState('2000');
  const [fragile, setFragile] = useState(false);
  const q = quote(card, zone, num(weight), num(cod), fragile);

  const setZoneField = (id: ZoneId, field: 'firstKg' | 'perExtraKg' | 'slaHours', value: string) =>
    setCard((c) => ({ ...c, zones: c.zones.map((z) => (z.id === id ? { ...z, [field]: num(value) } : z)) }));

  return (
    <View style={styles.screen}>
      <PortalHeader title="Rate Card" info={INFO} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SectionHeading icon={<CalculatorOutlineIcon size={20} color={C.red} />} title="Price calculator" />
        <Card style={styles.card}>
          <View style={styles.chips}>
            {card.zones.map((z) => (
              <Chip key={z.id} variant="tint" label={z.label} active={zone === z.id} onPress={() => setZone(z.id)} />
            ))}
          </View>
          <View style={styles.row}>
            <View style={styles.flex}>
              <TextField label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
            </View>
            <View style={styles.flex}>
              <TextField label="COD amount (Rs.)" value={cod} onChangeText={setCod} keyboardType="number-pad" />
            </View>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Fragile item</Text>
            <Toggle value={fragile} onChange={setFragile} label="Fragile item" />
          </View>
          <View style={styles.quote}>
            <KeyValue label="Base (first kg)" value={formatRs(q.base)} />
            <KeyValue label="Extra weight" value={formatRs(q.weightCharge)} />
            <KeyValue label={`COD fee (${card.codFeePercent}%)`} value={formatRs(q.codFee)} />
            {fragile && <KeyValue label="Fragile handling" value={formatRs(q.fragile)} />}
            <KeyValue label="Delivery charge" value={formatRs(q.total)} bold valueColor={C.red} />
            <Text style={styles.sla}>Delivery promise: within {q.slaHours} hours</Text>
          </View>
        </Card>

        <SectionHeading icon={<CalculatorOutlineIcon size={20} color={C.red} />} title="Zones" />
        {card.zones.map((z) => (
          <Card key={z.id} style={styles.card}>
            <Text style={styles.zone}>{z.label}</Text>
            <View style={styles.row}>
              <Money label="First kg" value={z.firstKg} onChange={(v) => setZoneField(z.id, 'firstKg', v)} />
              <Money label="Each extra kg" value={z.perExtraKg} onChange={(v) => setZoneField(z.id, 'perExtraKg', v)} />
              <Money label="SLA (hours)" value={z.slaHours} onChange={(v) => setZoneField(z.id, 'slaHours', v)} plain />
            </View>
          </Card>
        ))}

        <Card style={styles.card}>
          <Text style={styles.zone}>Fees</Text>
          <View style={styles.row}>
            <Money label="COD fee (%)" value={card.codFeePercent} onChange={(v) => setCard((c) => ({ ...c, codFeePercent: num(v) }))} plain />
            <Money label="Fragile surcharge" value={card.fragileSurcharge} onChange={(v) => setCard((c) => ({ ...c, fragileSurcharge: num(v) }))} />
          </View>
        </Card>

        <Button
          title={dirty ? 'Save rate card' : 'Saved'}
          disabled={!dirty}
          onPress={() => {
            dispatch({ type: 'rateCard', rateCard: card, actor });
            toast('Rate card updated for new bookings');
          }}
        />
        {dirty && <Button title="Discard changes" variant="ghost" onPress={() => setCard(data.rateCard)} />}
      </ScrollView>
    </View>
  );
}

function Money({ label, value, onChange, plain }: { label: string; value: number; onChange: (v: string) => void; plain?: boolean }) {
  return (
    <View style={styles.money}>
      <Text style={styles.moneyLabel}>{label}</Text>
      <View style={styles.moneyInputRow}>
        {!plain && <Text style={styles.prefix}>Rs.</Text>}
        <TextInput
          value={String(value)}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          style={styles.moneyInput}
          accessibilityLabel={label}
          selectTextOnFocus
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  card: { padding: 14, gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', gap: 10 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: C.text },
  quote: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 },
  sla: { fontSize: 12, color: C.muted, marginTop: 6, textAlign: 'center' },
  zone: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  money: { flex: 1, gap: 6 },
  moneyLabel: { fontSize: 11, fontWeight: '600', color: C.muted },
  moneyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  prefix: { fontSize: 13, color: C.muted, marginRight: 4 },
  moneyInput: { flex: 1, fontSize: 15, fontWeight: '700', color: C.textStrong, paddingVertical: 9, outlineWidth: 0, minWidth: 0 },
});
