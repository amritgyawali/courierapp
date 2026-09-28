import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { CheckIcon, ShieldCheckIcon, UsersIcon } from '@/components/portal/icons';
import { Badge, Card, Chip, PortalHeader, SectionHeading } from '@/components/portal/ui';
import { Avatar, Button, Sheet, TextField, Toggle, useNow, useToast } from '@/components/portal/widgets';
import { PortalColors as C } from '@/constants/theme';
import { ALL_PERMISSIONS, ROLE_META, type StaffRole } from '@/data/ops';
import { timeAgo } from '@/utils/format';

const ROLES = Object.keys(ROLE_META) as StaffRole[];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INFO = {
  title: 'Staff & Roles',
  body: 'Who can use the admin portal and what each role may do. Invite staff by email with a role; deactivating someone blocks their access immediately. Every change is written to the audit log.',
};

export default function StaffScreen() {
  const { data, dispatch, actor, me, lookup } = useAdmin();
  const toast = useToast();
  const now = useNow();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('dispatcher');
  const [hubId, setHubId] = useState<string | undefined>('KTM');
  const [error, setError] = useState('');

  const invite = () => {
    if (name.trim().length < 3) return setError('Enter the staff member’s full name.');
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.');
    if (data.staff.some((s) => s.email.toLowerCase() === email.trim().toLowerCase())) return setError('This email already has access.');
    setError('');
    dispatch({ type: 'inviteStaff', staff: { name: name.trim(), email: email.trim().toLowerCase(), role, hubId }, actor });
    toast(`Invitation sent to ${email.trim()}`);
    setInviteOpen(false);
    setName('');
    setEmail('');
  };

  return (
    <View style={styles.screen}>
      <PortalHeader title="Staff & Roles" info={INFO} />
      <ScrollView contentContainerStyle={styles.content}>
        <Button title="Invite staff member" icon={(c) => <UsersIcon size={18} color={c} />} onPress={() => setInviteOpen(true)} />

        <SectionHeading icon={<UsersIcon size={20} color={C.red} />} title={`Team (${data.staff.length})`} />
        <Card>
          {data.staff.map((s, i) => (
            <View key={s.id} style={[styles.member, i > 0 && styles.divider]}>
              <Avatar name={s.name} size={40} status={s.active ? '#16A34A' : '#9CA3AF'} />
              <View style={styles.flex}>
                <Text style={[styles.name, !s.active && styles.inactive]}>
                  {s.name}
                  {s.id === me.id ? ' (you)' : ''}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {ROLE_META[s.role].label}
                  {s.hubId ? ` · ${lookup.hub.get(s.hubId)?.name}` : ' · All hubs'} · {s.active ? `active ${timeAgo(s.lastActiveAt, now)}` : 'deactivated'}
                </Text>
              </View>
              {s.id !== me.id && (
                <Toggle
                  value={s.active}
                  label={`${s.name} access`}
                  onChange={(v) => {
                    dispatch({ type: 'staffActive', id: s.id, active: v, actor });
                    toast(v ? `${s.name} reactivated` : `${s.name} deactivated`, v ? 'success' : 'info');
                  }}
                />
              )}
            </View>
          ))}
        </Card>

        <SectionHeading icon={<ShieldCheckIcon size={20} color={C.red} />} title="Role permissions" />
        {ROLES.map((r) => (
          <Card key={r} style={styles.roleCard}>
            <View style={styles.roleHead}>
              <Text style={styles.roleName}>{ROLE_META[r].label}</Text>
              <Badge label={`${data.staff.filter((s) => s.role === r).length} STAFF`} bg="#F1F5F9" color="#475569" />
            </View>
            <View style={styles.perms}>
              {ALL_PERMISSIONS.map((p) => {
                const allowed = ROLE_META[r].permissions.some((x) => x.startsWith(p));
                return (
                  <View key={p} style={[styles.perm, allowed ? styles.permOn : styles.permOff]}>
                    {allowed && <CheckIcon size={11} color="#15803D" sw={3} />}
                    <Text style={[styles.permText, allowed ? styles.permTextOn : styles.permTextOff]}>{p}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        ))}
      </ScrollView>

      <Sheet
        visible={inviteOpen}
        title="Invite staff member"
        subtitle="They receive an email to set their password."
        onClose={() => setInviteOpen(false)}
        footer={<Button title="Send invitation" onPress={invite} />}>
        <TextField label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
        <TextField label="Work email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={error} />
        <Text style={styles.label}>Role</Text>
        <View style={styles.chips}>
          {ROLES.filter((r) => r !== 'super-admin').map((r) => (
            <Chip key={r} variant="tint" label={ROLE_META[r].label} active={role === r} onPress={() => setRole(r)} />
          ))}
        </View>
        <Text style={styles.label}>Hub</Text>
        <View style={styles.chips}>
          <Chip variant="neutral" label="All hubs" active={!hubId} onPress={() => setHubId(undefined)} />
          {data.hubs.map((h) => (
            <Chip key={h.id} variant="neutral" label={h.name.replace(' Hub', '')} active={hubId === h.id} onPress={() => setHubId(h.id)} />
          ))}
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  member: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  divider: { borderTopWidth: 1, borderTopColor: C.divider },
  name: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  inactive: { color: C.faint, textDecorationLine: 'line-through' },
  meta: { fontSize: 12, color: C.muted, marginTop: 2 },
  roleCard: { padding: 14, gap: 10 },
  roleHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleName: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  perms: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  perm: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  permOn: { backgroundColor: '#DCFCE7' },
  permOff: { backgroundColor: '#F3F4F6' },
  permText: { fontSize: 11, fontWeight: '600' },
  permTextOn: { color: '#15803D' },
  permTextOff: { color: '#9CA3AF' },
  label: { fontSize: 12, fontWeight: '600', color: C.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
