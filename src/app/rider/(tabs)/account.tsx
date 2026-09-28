import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { appVersionLabel } from '@/components/portal/drawer';
import {
  BikeIcon,
  HistoryIcon,
  LogoutIcon,
  MegaphoneOutlineIcon,
  ShieldCheckIcon,
  SirenIcon,
  SupportIcon,
} from '@/components/portal/icons';
import { Badge, Card, PortalHeader, SectionHeading } from '@/components/portal/ui';
import { Avatar, KeyValue, ListRow, ProgressRing, useNow } from '@/components/portal/widgets';
import { SosSheet } from '@/components/rider/sos-sheet';
import { useRider } from '@/components/rider/use-rider';
import { PortalColors as C } from '@/constants/theme';
import { DUTY_META, KYC_META } from '@/data/ops';
import { useAppState } from '@/state/app-state';
import { formatDate } from '@/utils/format';

export default function RiderAccount() {
  const { me, hub, stats } = useRider();
  const { user, signOut } = useAppState();
  const [sos, setSos] = useState(false);
  const now = useNow(60 * 60000);
  const expiring = me.documents.filter((d) => d.expires && new Date(d.expires).getTime() - now.getTime() < 45 * 24 * 3600000);

  return (
    <View style={styles.screen}>
      <PortalHeader title="Account" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profile}>
          <Avatar name={me.name} size={70} status={DUTY_META[me.duty].color} />
          <Text style={styles.name}>{me.name}</Text>
          <Text style={styles.meta}>
            {me.id} · {hub.name}
          </Text>
          {user && <Text style={styles.meta}>{user.email}</Text>}
          <View style={styles.badges}>
            <Badge label={`★ ${me.rating.toFixed(1)}`} bg="#FFFBEB" color="#B45309" />
            <Badge label={KYC_META[me.kyc].label.toUpperCase()} bg={KYC_META[me.kyc].bg} color={KYC_META[me.kyc].color} />
          </View>
        </Card>

        <Card style={styles.perf}>
          <ProgressRing value={stats.successRate} size={84} label="success" color="#16A34A" />
          <View style={styles.flex}>
            <KeyValue label="Total delivered" value={String(stats.deliveredTotal)} />
            <KeyValue label="On-time" value={`${stats.onTimeRate}%`} />
            <KeyValue label="Member since" value={formatDate(new Date(me.joinedAt))} />
          </View>
        </Card>

        <SectionHeading icon={<BikeIcon size={20} color={C.red} />} title="Vehicle & documents" />
        <Card style={styles.card}>
          <KeyValue label="Vehicle" value={`${me.vehicle.type} · ${me.vehicle.plate}`} />
          <KeyValue label="Phone" value={me.phone} />
          <KeyValue label="Hub manager" value={`${hub.manager} · ${hub.phone}`} />
          <View style={styles.divider} />
          {me.documents.map((d) => (
            <View key={d.name} style={styles.doc}>
              <ShieldCheckIcon size={18} color={KYC_META[d.status].color} />
              <View style={styles.flex}>
                <Text style={styles.docName}>{d.name}</Text>
                {d.expires && <Text style={styles.meta}>Expires {formatDate(new Date(d.expires))}</Text>}
              </View>
              <Badge label={KYC_META[d.status].label.toUpperCase()} bg={KYC_META[d.status].bg} color={KYC_META[d.status].color} />
            </View>
          ))}
          {expiring.length > 0 && (
            <Text style={styles.warn}>Renew {expiring.map((d) => d.name.toLowerCase()).join(', ')} soon and upload it at your hub.</Text>
          )}
        </Card>

        <Card>
          <ListRow icon={<HistoryIcon size={20} color={C.red} />} title="Delivery history" onPress={() => router.navigate('/rider/history')} />
          <ListRow icon={<MegaphoneOutlineIcon size={20} color={C.red} />} title="Announcements" onPress={() => router.navigate('/rider/announcements')} />
          <ListRow icon={<SupportIcon size={20} color={C.red} />} title="Support center" subtitle="Contacts and office location" onPress={() => router.push('/contact')} />
          <ListRow icon={<SirenIcon size={20} color="#DC2626" />} title="Emergency SOS" subtitle="Police, ambulance, hub manager" onPress={() => setSos(true)} />
          <ListRow icon={<LogoutIcon size={20} color={C.red} />} title="Log out" onPress={signOut} />
        </Card>

        <Text style={styles.version}>{appVersionLabel()}</Text>
      </ScrollView>
      <SosSheet visible={sos} onClose={() => setSos(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  profile: { padding: 20, alignItems: 'center', gap: 4 },
  name: { fontSize: 21, fontWeight: '800', color: C.textStrong, marginTop: 8 },
  meta: { fontSize: 12, color: C.muted },
  badges: { flexDirection: 'row', gap: 6, marginTop: 8 },
  perf: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  card: { padding: 14 },
  divider: { height: 1, backgroundColor: C.divider, marginVertical: 8 },
  doc: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  docName: { fontSize: 14, fontWeight: '600', color: C.text },
  warn: { fontSize: 12, fontWeight: '600', color: '#B45309', marginTop: 8 },
  version: { fontSize: 12, color: C.faint, textAlign: 'center' },
});
