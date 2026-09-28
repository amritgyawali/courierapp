import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { appVersionLabel } from '@/components/portal/drawer';
import { PaletteIcon, PencilIcon, RefreshIcon, SettingsIcon } from '@/components/portal/icons';
import { Card, PortalHeader, SectionHeading } from '@/components/portal/ui';
import { Avatar, Button, KeyValue, ListRow, Sheet, TextField, Toggle, useToast } from '@/components/portal/widgets';
import { Text } from '@/components/text';
import { type OpsSettings, ROLE_META } from '@/data/ops';
import { makeStyles, useColors } from '@/theme';

const INFO = {
  title: 'Settings',
  body: 'Your admin profile, the app’s branding, and operational rules for the whole network: automatic rider assignment, delivery OTP, how much cash a rider may carry and how many delivery attempts are allowed before a parcel is returned.',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SettingsScreen() {
  const styles = useStyles();
  const C = useColors();
  const { data, dispatch, actor, me, reset } = useAdmin();
  const toast = useToast();
  const [s, setS] = useState<OpsSettings>(data.settings);
  const [resetOpen, setResetOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email);
  const [profileError, setProfileError] = useState('');

  // Saved settings changed underneath (e.g. demo data reset): drop the stale draft.
  const [seenSettings, setSeenSettings] = useState(data.settings);
  if (data.settings !== seenSettings) {
    setSeenSettings(data.settings);
    setS(data.settings);
  }

  const openProfile = () => {
    setName(me.name);
    setEmail(me.email);
    setProfileError('');
    setProfileOpen(true);
  };

  const saveProfile = () => {
    const nextName = name.trim().replace(/\s+/g, ' ');
    const nextEmail = email.trim().toLowerCase();
    if (nextName.length < 2) return setProfileError('Enter your full name.');
    if (!EMAIL_RE.test(nextEmail)) return setProfileError('Enter a valid email address.');
    if (data.staff.some((st) => st.id !== me.id && st.email.toLowerCase() === nextEmail)) {
      return setProfileError('Another staff member already uses this email.');
    }
    dispatch({ type: 'updateStaff', id: me.id, changes: { name: nextName, email: nextEmail }, actor });
    setProfileOpen(false);
    toast('Profile updated');
  };
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
          <Button compact variant="soft" title="Edit" icon={(c) => <PencilIcon size={14} color={c} />} onPress={openProfile} />
        </Card>

        <Card>
          <ListRow
            icon={<PaletteIcon size={22} color={C.primary} />}
            title="Branding & Appearance"
            subtitle="App name, logo, app icon, theme colour, font and contact details"
            onPress={() => router.navigate('/admin/branding')}
          />
        </Card>

        <SectionHeading icon={<SettingsIcon size={20} color={C.primary} />} title="Dispatch & delivery" />
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

        <SectionHeading icon={<RefreshIcon size={20} color={C.primary} />} title="Data" />
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

      <Sheet
        visible={profileOpen}
        title="Edit your profile"
        subtitle="Shown in the menu, on the dashboard greeting and in the audit log."
        onClose={() => setProfileOpen(false)}
        footer={<Button title="Save profile" onPress={saveProfile} />}>
        <TextField label="Full name" value={name} onChangeText={setName} autoCapitalize="words" maxLength={60} />
        <TextField
          label="Work email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={profileError}
        />
      </Sheet>
    </View>
  );
}

function Row({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const styles = useStyles();
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

const useStyles = makeStyles(({ colors: C }) => ({
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
}));
