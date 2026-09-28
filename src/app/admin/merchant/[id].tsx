import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { ShipmentCard } from '@/components/ops/shipment';
import { MessageIcon, PhoneOutlineIcon, StoreSmallIcon } from '@/components/portal/icons';
import { Badge, Card, EmptyState, PortalHeader } from '@/components/portal/ui';
import { Button, KeyValue, useNow, useToast } from '@/components/portal/widgets';
import { PortalColors as C } from '@/constants/theme';
import { KYC_META, merchantStats } from '@/data/ops';
import { formatDate, formatRs } from '@/utils/format';
import { callPhone, sendEmail } from '@/utils/links';

export default function AdminMerchantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, dispatch, actor, lookup } = useAdmin();
  const toast = useToast();
  const now = useNow();

  const m = data.merchants.find((x) => x.id === id);
  if (!m) {
    return (
      <View style={styles.screen}>
        <PortalHeader title="Merchant" back backHref="/admin/merchants" />
        <EmptyState icon={<StoreSmallIcon size={30} color={C.red} />} title="Merchant not found" message={`No merchant with ID ${id}.`} />
      </View>
    );
  }

  const stats = merchantStats(data, m.id);
  const recent = data.shipments.filter((s) => s.merchantId === m.id).slice(0, 8);

  return (
    <View style={styles.screen}>
      <PortalHeader title="Merchant" back backHref="/admin/merchants" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profile}>
          <View style={styles.logo}>
            <StoreSmallIcon size={30} color={C.red} />
          </View>
          <Text style={styles.name}>{m.name}</Text>
          <Text style={styles.meta}>
            {m.id} · {lookup.hub.get(m.hubId)?.name}
          </Text>
          <View style={styles.badges}>
            <Badge label={KYC_META[m.kyc].label.toUpperCase()} bg={KYC_META[m.kyc].bg} color={KYC_META[m.kyc].color} />
            {!m.active && <Badge label="SUSPENDED" bg="#F3F4F6" color="#6B7280" />}
          </View>
          <View style={styles.row}>
            <Button compact variant="soft" title="Call" icon={(c) => <PhoneOutlineIcon size={16} color={c} />} onPress={() => callPhone(m.phone)} style={styles.flex} />
            <Button
              compact
              variant="soft"
              title="Email"
              icon={(c) => <MessageIcon size={16} color={c} />}
              onPress={() => sendEmail(m.email, 'Karnali Smart Group')}
              style={styles.flex}
            />
          </View>
        </Card>

        <View style={styles.kpis}>
          <Kpi label="Shipments" value={stats.total} />
          <Kpi label="In progress" value={stats.active} />
          <Kpi label="Success" value={`${stats.successRate}%`} color="#16A34A" />
          <Kpi label="Returns" value={stats.returned} color={C.red} />
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Settlement</Text>
          <KeyValue label="COD delivered" value={formatRs(stats.codDelivered)} />
          <KeyValue label="Delivery charges" value={`− ${formatRs(stats.charges)}`} />
          <KeyValue label="Already paid out" value={`− ${formatRs(stats.paid)}`} />
          <KeyValue label="Awaiting payout" value={formatRs(stats.pendingPayout)} valueColor={C.amber} />
          <KeyValue label="Net balance" value={formatRs(stats.balance)} bold valueColor={stats.balance < 0 ? '#DC2626' : '#16A34A'} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Business details</Text>
          <KeyValue label="Owner" value={m.owner} />
          <KeyValue label="Phone" value={m.phone} />
          <KeyValue label="Email" value={m.email} />
          <KeyValue label="Pickup address" value={m.pickupAddress} />
          <KeyValue label="Joined" value={formatDate(new Date(m.joinedAt))} />
          {m.kyc === 'pending' && (
            <View style={[styles.row, styles.top]}>
              <Button
                compact
                variant="danger"
                title="Reject"
                style={styles.flex}
                onPress={() => {
                  dispatch({ type: 'merchantKyc', merchantId: m.id, kyc: 'rejected', actor });
                  toast(`${m.name} KYC rejected`, 'info');
                }}
              />
              <Button
                compact
                variant="success"
                title="Approve KYC"
                style={styles.flex}
                onPress={() => {
                  dispatch({ type: 'merchantKyc', merchantId: m.id, kyc: 'verified', actor });
                  toast(`${m.name} approved`);
                }}
              />
            </View>
          )}
        </Card>

        <Text style={styles.section}>Recent shipments</Text>
        {recent.map((s) => (
          <ShipmentCard
            key={s.id}
            shipment={s}
            now={now}
            merchantName={lookup.hub.get(s.hubId)?.name}
            riderName={s.riderId ? lookup.rider.get(s.riderId)?.name : undefined}
            onPress={() => router.push({ pathname: '/admin/shipment/[id]', params: { id: s.id } })}
          />
        ))}

        <Button
          title={m.active ? 'Suspend merchant' : 'Activate merchant'}
          variant={m.active ? 'danger' : 'success'}
          onPress={() => {
            dispatch({ type: 'merchantActive', merchantId: m.id, active: !m.active, actor });
            toast(m.active ? `${m.name} suspended` : `${m.name} activated`, m.active ? 'info' : 'success');
          }}
        />
      </ScrollView>
    </View>
  );
}

function Kpi({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={[styles.kpiValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  profile: { padding: 18, alignItems: 'center', gap: 6 },
  logo: { width: 64, height: 64, borderRadius: 18, backgroundColor: C.redTint, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '800', color: C.textStrong, marginTop: 6, textAlign: 'center' },
  meta: { fontSize: 12, color: C.muted },
  badges: { flexDirection: 'row', gap: 6, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 10 },
  top: { marginTop: 12 },
  kpis: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: C.cardBorder, paddingVertical: 14 },
  kpi: { flex: 1, alignItems: 'center' },
  kpiValue: { fontSize: 18, fontWeight: '800', color: C.textStrong },
  kpiLabel: { fontSize: 11, color: C.muted, marginTop: 2 },
  card: { padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.textStrong, marginBottom: 6 },
  section: { fontSize: 15, fontWeight: '700', color: C.navy, marginTop: 4 },
});
