import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DoorIcon, SmallChevronDownIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { Button, Checkbox, ScreenHeader, SelectSheet } from '@/components/ui';
import { DELIVERY_TIMES, LEAVE_PLACES } from '@/data/content';
import { useAppState } from '@/state/app-state';
import { makeStyles, shadow, useColors } from '@/theme';

const TIPS = [
  "We'll only leave parcels that are out of the weather and hidden from view.",
  "If it's not safe to leave parcels they will be taken to a Post Office.",
  'The premises must be safe to enter and easy to access.',
];

function DropdownCard({
  label,
  placeholder,
  value,
  onPress,
}: {
  label: string;
  placeholder: string;
  value: string;
  onPress: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <View style={styles.dropdownRow}>
        <Text style={[styles.dropdownValue, !!value && styles.dropdownValueSet]}>{value || placeholder}</Text>
        <SmallChevronDownIcon />
      </View>
    </Pressable>
  );
}

export default function DeliveryPreferencesScreen() {
  const styles = useStyles();
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { delivery, saveDelivery } = useAppState();
  const [leaveSafe, setLeaveSafe] = useState(delivery.leaveSafe);
  const [place, setPlace] = useState(delivery.place);
  const [time, setTime] = useState(delivery.time);
  const [sheet, setSheet] = useState<'place' | 'time' | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Leave eligible parcels" back />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, styles.noPad]}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <DoorIcon />
            </View>
            <Text style={styles.infoText}>
              Ask us to leave eligible parcels in a safe place if you&apos;re not home to sign.
            </Text>
          </View>
          <View style={styles.hr} />
          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>A few things to keep in mind</Text>
            {TIPS.map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.notice}>Changing this setting won&apos;t affect parcels already on their way.</Text>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: leaveSafe }}
          onPress={() => {
            setLeaveSafe(!leaveSafe);
            setSaved(false);
          }}
          style={[styles.card, styles.toggleRow]}>
          <Text style={styles.toggleText}>Leave eligible parcels in a safe place for future deliveries.</Text>
          <Checkbox
            checked={leaveSafe}
            onChange={(v) => {
              setLeaveSafe(v);
              setSaved(false);
            }}
            borderColor={C.primary}
            size={22}
          />
        </Pressable>

        <DropdownCard
          label="Where should we leave your parcels?"
          placeholder="Select Place"
          value={place}
          onPress={() => setSheet('place')}
        />
        <DropdownCard
          label="Preferred time to deliver your parcels!"
          placeholder="Select Time"
          value={time}
          onPress={() => setSheet('time')}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          title={saved ? 'Saved' : 'Submit'}
          radius={6}
          style={{ paddingVertical: 13 }}
          onPress={() => {
            saveDelivery({ leaveSafe, place, time });
            setSaved(true);
            setTimeout(() => router.canGoBack() && router.back(), 600);
          }}
        />
      </View>

      <SelectSheet
        visible={sheet === 'place'}
        title="Select Place"
        options={LEAVE_PLACES}
        selected={place}
        onSelect={(v) => {
          setPlace(v);
          setSaved(false);
        }}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        visible={sheet === 'time'}
        title="Select Time"
        options={DELIVERY_TIMES}
        selected={time}
        onSelect={(v) => {
          setTime(v);
          setSaved(false);
        }}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    boxShadow: shadow(1, 4, 0.05),
  },
  noPad: { paddingHorizontal: 0, paddingVertical: 0, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1, fontSize: 13.5, lineHeight: 19, fontWeight: '500', color: '#4B5563' },
  hr: { height: 1, backgroundColor: '#E5E7EB' },
  tips: { padding: 16, paddingTop: 14, gap: 10 },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  tipRow: { flexDirection: 'row', paddingLeft: 4 },
  bullet: { fontSize: 18, lineHeight: 20, color: '#1F2937', marginRight: 10 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 20, color: '#4B5563' },
  notice: { fontSize: 13.5, lineHeight: 19, fontWeight: '500', color: '#1F2937', paddingHorizontal: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  toggleText: { flex: 1, fontSize: 13.5, lineHeight: 19, fontWeight: '700', color: C.textStrong, paddingRight: 16 },
  dropdownLabel: { fontSize: 14, fontWeight: '700', color: C.textStrong, marginBottom: 10 },
  dropdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownValue: { fontSize: 14, color: '#9CA3AF' },
  dropdownValueSet: { color: C.textStrong, fontWeight: '500' },
  footer: { paddingHorizontal: 16, paddingTop: 4, backgroundColor: C.screenBg },
}));
