import { type ComponentProps, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { AvatarIcon, CheckIcon } from '@/components/portal/icons';
import { Card, PortalHeader } from '@/components/portal/ui';
import { Text, TextInput } from '@/components/text';
import { useAppState } from '@/state/app-state';
import { useVendorState } from '@/state/vendor-state';
import { makeStyles, shadow, useColors } from '@/theme';

const INFO = {
  title: 'Profile',
  body: 'Your business name, owner name, contact phone and pickup address appear on your dashboard and help riders reach you. Your Vendor ID is fixed.',
};

export default function VendorProfileScreen() {
  const styles = useStyles();
  const C = useColors();
  const { user } = useAppState();
  const { profile, updateProfile } = useVendorState();
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const dirty =
    businessName !== profile.businessName ||
    ownerName !== profile.ownerName ||
    phone !== profile.phone ||
    address !== profile.address;

  const save = () => {
    if (!businessName.trim()) return setError('Business name is required.');
    if (ownerName.trim().length < 2) return setError('Enter the owner’s name.');
    if (!/^9\d{9}$/.test(phone.trim())) return setError('Enter a 10-digit mobile number starting with 9.');
    setError('');
    updateProfile({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    setSaved(true);
  };

  const edit = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setSaved(false);
  };

  return (
    <View style={styles.screen}>
      <PortalHeader title="Profile" info={INFO} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <AvatarIcon size={34} color={C.primary} />
            </View>
            <Text style={styles.idText}>Vendor ID: {profile.vendorId}</Text>
            {user && <Text style={styles.email}>{user.email}</Text>}
          </View>

          <Card style={styles.card}>
            <Field label="Business name" value={businessName} onChangeText={edit(setBusinessName)} autoCapitalize="words" />
            <Field label="Owner name" value={ownerName} onChangeText={edit(setOwnerName)} autoCapitalize="words" />
            <Field label="Contact phone" value={phone} onChangeText={edit(setPhone)} keyboardType="phone-pad" maxLength={10} />
            <Field label="Pickup address" value={address} onChangeText={edit(setAddress)} autoCapitalize="words" multiline />
          </Card>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            accessibilityRole="button"
            disabled={!dirty}
            onPress={save}
            style={({ pressed }) => [styles.save, !dirty && styles.saveDisabled, pressed && { backgroundColor: C.primaryPressed }]}>
            {saved && !dirty ? <CheckIcon size={18} color={C.onPrimary} /> : null}
            <Text style={styles.saveText}>{saved && !dirty ? 'Saved' : 'Save changes'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  ...input
}: { label: string } & ComponentProps<typeof TextInput>) {
  const styles = useStyles();
  const C = useColors();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={C.faint} style={[styles.input, input.multiline && styles.inputMultiline]} {...input} />
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
  flex: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  identity: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.primaryTint,
    borderWidth: 1,
    borderColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  idText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  email: { fontSize: 13, color: C.muted },
  card: { padding: 16, gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: C.muted },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: C.text,
    backgroundColor: '#FFFFFF',
    outlineWidth: 0,
  },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top' },
  error: { color: C.danger, fontSize: 13, marginTop: -6 },
  save: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    boxShadow: shadow(2, 8, 0.2, C.primary),
  },
  saveDisabled: { opacity: 0.55 },
  saveText: { color: C.onPrimary, fontSize: 15, fontWeight: '700' },
}));
