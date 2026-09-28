import { type ReactNode, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { appVersionLabel } from '@/components/portal/drawer';
import { RefreshIcon, SettingsIcon } from '@/components/portal/icons';
import { Card, PortalHeader, SectionHeading } from '@/components/portal/ui';
import { Avatar, Button, KeyValue, Sheet, TextField, Toggle, useToast } from '@/components/portal/widgets';
import { PortalColors as C } from '@/constants/theme';
import { type OpsSettings, ROLE_META } from '@/data/ops';

const INFO = {
  title: 'Settings',
  body: 'Operational rules for the whole network: automatic rider assignment, delivery OTP, how much cash a rider may carry and how many delivery attempts are allowed before a parcel is returned.',
};

export default function SettingsScreen() {
  const { data, dispatch, actor, me, reset } = useAdmin();
  const toast = useToast();
  const [s, setS] = useState<OpsSettings>(data.settings);
  const [resetOpen, setResetOpen] = useState(false);
  const dirty = JSON.stringify(s) !== JSON.stringify(data.settings);
  const set = <K extends keyof OpsSettings>(k: K, v: OpsSettings[K]) => setS((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;

  return (
    <View style={styles.screen}>
      <PortalHeader title="Settings" info={INFO} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.profile}>
          <Avatar name={me.name} size={52} />
          <View style={styles.flex}>
            <Text style={styles.name}>{me.name}</Text>
            <Text style={styles.meta}>
              {ROLE_META[me.role].label} · {me.email}
            </Text>
          </View>
        </Card>

        <SectionHeading icon={<SettingsIcon size={20} color={C.red} />} title="Dispatch & delivery" />
        <Card style={styles.card}>
          <Row title="Auto-assign suggestions" subtitle="Rank riders by hub, duty and workload when assigning.">
            <Toggle value={s.autoAssign} onChange={(v) => set('autoAssign', v)} label="Auto-assign suggestions" />
          </Row>
          <View style={styles.divider} />
          <Row title="Require delivery OTP" subtitle="Riders must enter the receiver’s one-time code.">
            <Toggle value={s.otpRequired} onChange={(v) => set('otpRequired', v)} label="Require delivery OTP" />
          </Row>
          <View style={styles.divider} />
          <View style={styles.fields}>
            <View style={styles.flex}>
              <TextField label="Rider cash limit (Rs.)" value={String(s.riderCashLimit)} onChangeText={(v) => set('riderCashLimit', num(v))} keyboardType="number-pad" />
            </View>
            <View style={styles.flex}>
              <TextField label="Max delivery attempts" value={String(s.maxAttempts)} onChangeText={(v) => set('maxAttempts', Math.max(1, Math.min(5, num(v))))} keyboardType="number-pad" />
            </View>
          </View>
          <TextField label="Working hours" value={s.workingHours} onChangeText={(v) => set('workingHours', v)} />
        </Card>

        <Button
          title={dirty ? 'Save settings' : 'Saved'}
          disabled={!dirty}
          onPress={() => {
            dispatch({ type: 'settings', settings: s, actor });
            toast('Settings saved');
          }}
        />

        <SectionHeading icon={<RefreshIcon size={20} color={C.red} />} title="Data" />
        <Card style={styles.card}>
          <KeyValue label="Shipments" value={String(data.shipments.length)} />
          <KeyValue label="Riders / Merchants / Hubs" value={`${data.riders.length} / ${data.merchants.length} / ${data.hubs.length}`} />
          <KeyValue label="App" value={appVersionLabel()} />
          <Button title="Reset demo data" variant="danger" onPress={() => setResetOpen(true)} style={styles.top} />
        </Card>
      </ScrollView>

      <Sheet
        visible={resetOpen}
        title="Reset demo data?"
        subtitle="All shipments, riders, payouts and changes on this device are replaced with a fresh sample network."
        onClose={() => setResetOpen(false)}
        footer={
          <>
            <Button
              title="Reset data"
              variant="danger"
              onPress={() => {
                reset();
                setResetOpen(false);
                toast('Demo data reset', 'info');
              }}
            />
            <Button title="Cancel" variant="ghost" onPress={() => setResetOpen(false)} />
          </>
        }>
        <Text style={styles.meta}>Use this before a demo or after testing. It cannot be undone.</Text>
      </Sheet>
    </View>
  );
}

function Row({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.meta}>{subtitle}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  name: { fontSize: 17, fontWeight: '800', color: C.textStrong },
  meta: { fontSize: 12, color: C.muted, marginTop: 2 },
  card: { padding: 14, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  divider: { height: 1, backgroundColor: C.divider },
  fields: { flexDirection: 'row', gap: 10 },
  top: { marginTop: 8 },
});
