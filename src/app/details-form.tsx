import { type ReactNode, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { DateField } from '@/components/date-field';
import {
  BuildingIcon,
  CaretDownIcon,
  EnvelopeIcon,
  FlagIcon,
  NumberedListIcon,
  PersonAddIcon,
  PersonIcon,
  PinOutlineIcon,
} from '@/components/icons';
import { Text } from '@/components/text';
import { IconInput, ScreenHeader, SelectSheet } from '@/components/ui';
import { PROVINCES } from '@/data/content';
import { type Details, useAppState } from '@/state/app-state';
import { cardShadow, makeStyles } from '@/theme';

function SelectRow({
  icon,
  placeholder,
  value,
  onPress,
}: {
  icon: ReactNode;
  placeholder: string;
  value: string;
  onPress: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.select, pressed && { backgroundColor: '#E5E7EB' }]}>
      <View style={styles.selectLeft}>
        <View style={styles.selectIcon}>{icon}</View>
        <Text style={[styles.selectText, !!value && { color: '#1F2937' }]}>{value || placeholder}</Text>
      </View>
      <CaretDownIcon />
    </Pressable>
  );
}

export default function DetailsFormScreen() {
  const styles = useStyles();
  const { details, saveDetails, user } = useAppState();
  const [form, setForm] = useState<Details>({ ...details, email: details.email || user?.email || '' });
  const [sheet, setSheet] = useState<'province' | 'district' | null>(null);

  // Every edit is saved immediately, so leaving the screen never loses input.
  const update = (patch: Partial<Details>) => {
    const next = { ...form, ...patch };
    setForm(next);
    saveDetails(next);
  };

  const districts = form.province ? PROVINCES[form.province] : Object.values(PROVINCES).flat().sort();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Details Form" back right={null} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.subtitle}>Fill out your details</Text>

            <Text style={styles.legend}>Personal Details</Text>
            <View style={styles.group}>
              <IconInput
                icon={<PersonIcon />}
                placeholder="Name"
                value={form.name}
                onChangeText={(name) => update({ name })}
                containerStyle={styles.field}
                style={styles.fieldText}
                placeholderTextColor="#374151"
              />
              <IconInput
                icon={<PersonAddIcon />}
                placeholder="Surname"
                value={form.surname}
                onChangeText={(surname) => update({ surname })}
                containerStyle={styles.field}
                style={styles.fieldText}
                placeholderTextColor="#374151"
              />
              <DateField placeholder="Date of birth" value={form.dob} onChange={(dob) => update({ dob })} />
            </View>

            <Text style={[styles.legend, { marginTop: 28 }]}>Contact Details</Text>
            <View style={styles.group}>
              <IconInput
                icon={<EnvelopeIcon />}
                placeholder="Email"
                value={form.email}
                onChangeText={(email) => update({ email })}
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={styles.field}
                style={styles.fieldText}
                placeholderTextColor="#374151"
              />
              <SelectRow
                icon={<BuildingIcon />}
                placeholder="Province"
                value={form.province}
                onPress={() => setSheet('province')}
              />
              <SelectRow
                icon={<FlagIcon />}
                placeholder="District"
                value={form.district}
                onPress={() => setSheet('district')}
              />
              <IconInput
                icon={<PinOutlineIcon />}
                placeholder="Municipality"
                value={form.municipality}
                onChangeText={(municipality) => update({ municipality })}
                containerStyle={styles.field}
                style={styles.fieldText}
                placeholderTextColor="#374151"
              />
              <IconInput
                icon={<NumberedListIcon />}
                placeholder="Ward No."
                value={form.ward}
                onChangeText={(ward) => update({ ward: ward.replace(/[^0-9]/g, '') })}
                keyboardType="number-pad"
                containerStyle={styles.field}
                style={styles.fieldText}
                placeholderTextColor="#374151"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectSheet
        visible={sheet === 'province'}
        title="Select Province"
        options={Object.keys(PROVINCES)}
        selected={form.province}
        onSelect={(province) =>
          update({ province, district: PROVINCES[province].includes(form.district) ? form.district : '' })
        }
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        visible={sheet === 'district'}
        title="Select District"
        options={districts}
        selected={form.district}
        onSelect={(district) => {
          const province = form.province || Object.keys(PROVINCES).find((p) => PROVINCES[p].includes(district)) || '';
          update({ district, province });
        }}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { paddingTop: 12, paddingHorizontal: 14, paddingBottom: 32 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24, ...cardShadow },
  subtitle: { textAlign: 'center', fontSize: 16, color: '#1F2937', marginBottom: 24 },
  legend: { fontSize: 15, color: C.muted, letterSpacing: 0.4, marginLeft: 4, marginBottom: 20 },
  group: { gap: 12 },
  field: { backgroundColor: '#F1F3F5' },
  fieldText: { fontSize: 15 },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F3F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  selectLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  selectIcon: { marginRight: 14, width: 24, alignItems: 'center' },
  selectText: { fontSize: 15, color: '#374151' },
}));
