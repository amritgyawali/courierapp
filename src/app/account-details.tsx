import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyBoxIllustration } from '@/components/brand';
import { Fab, ScreenHeader } from '@/components/ui';
import { Colors, cardShadow } from '@/constants/theme';
import { hasDetails, useAppState } from '@/state/app-state';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  );
}

export default function AccountDetailsScreen() {
  const { details } = useAppState();
  const filled = hasDetails(details);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="My Account details" back />
      {filled ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.section}>Personal Details</Text>
          <View style={styles.card}>
            <Row label="Name" value={details.name} />
            <Row label="Surname" value={details.surname} />
            <Row label="Date of birth" value={details.dob} />
          </View>
          <Text style={styles.section}>Contact Details</Text>
          <View style={styles.card}>
            <Row label="Email" value={details.email} />
            <Row label="Province" value={details.province} />
            <Row label="District" value={details.district} />
            <Row label="Municipality" value={details.municipality} />
            <Row label="Ward No." value={details.ward} />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.empty}>
          <EmptyBoxIllustration color="#C5C8CE" />
          <Text style={styles.emptyText}>Seems like you haven&apos;t filled out your details!</Text>
        </View>
      )}
      <Fab label={filled ? 'Edit details' : 'Add details'} bottom={40} onPress={() => router.push('/details-form')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.screenBgAlt },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginTop: -64 },
  emptyText: { marginTop: 32, fontSize: 17, color: '#1F2937', textAlign: 'center', lineHeight: 26 },
  content: { padding: 16, paddingBottom: 120 },
  section: { fontSize: 15, color: Colors.textMuted, marginTop: 8, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, ...cardShadow },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  rowLabel: { fontSize: 15, color: Colors.textMuted },
  rowValue: { fontSize: 15, color: Colors.black, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
});
