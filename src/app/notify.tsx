import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Checkbox, ScreenHeader } from '@/components/ui';
import { Colors, shadow } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

function OptionCard({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => [styles.option, pressed && { backgroundColor: '#F8FAFC' }]}>
      <Text style={styles.optionLabel}>{label}</Text>
      <Checkbox checked={checked} onChange={onChange} label={label} size={26} borderColor="#4B5563" />
    </Pressable>
  );
}

export default function NotifyScreen() {
  const { notify, saveNotify } = useAppState();
  const [email, setEmail] = useState(notify.email);
  const [phone, setPhone] = useState(notify.phone);
  const [saved, setSaved] = useState(false);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Notify me by" back />
      <View style={styles.content}>
        <Text style={styles.subtitle}>How would you like to be notified?</Text>
        <View style={{ gap: 16 }}>
          <OptionCard label="Notify me by email" checked={email} onChange={(v) => { setEmail(v); setSaved(false); }} />
          <OptionCard label="Notify me by phone" checked={phone} onChange={(v) => { setPhone(v); setSaved(false); }} />
          <Button
            title={saved ? 'Saved' : 'Submit'}
            bold={false}
            radius={4}
            style={{ marginTop: 8, paddingVertical: 13 }}
            onPress={() => {
              saveNotify({ email, phone });
              setSaved(true);
              setTimeout(() => router.canGoBack() && router.back(), 600);
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EAEAEA' },
  content: { paddingHorizontal: 16, paddingTop: 24 },
  subtitle: { fontSize: 16, color: '#1F2937', textAlign: 'center', marginBottom: 24 },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: shadow(1, 6, 0.06),
  },
  optionLabel: { fontSize: 17, fontWeight: '700', color: Colors.black },
});
