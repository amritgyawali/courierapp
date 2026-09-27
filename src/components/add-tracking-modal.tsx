import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { TicketIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { Colors, shadow } from '@/constants/theme';

export function AddTrackingModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  /** Return false to keep the dialog open (e.g. duplicate number). */
  onAdd: (number: string) => boolean;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const close = () => {
    setValue('');
    setError('');
    onClose();
  };

  const add = () => {
    if (!value.trim()) return setError('Please enter a tracking number.');
    if (!onAdd(value)) return setError('This tracking number is already added.');
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <TicketIcon />
            <TextInput
              autoFocus
              value={value}
              onChangeText={(t) => {
                setValue(t);
                setError('');
              }}
              placeholder="Enter your Tracking Number"
              placeholderTextColor="#374151"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={add}
              style={styles.input}
            />
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.actions}>
            <Button title="Cancel" variant="soft" bold={false} radius={8} onPress={close} style={styles.action} />
            <Button title="Add" bold={false} radius={8} onPress={add} style={styles.action} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    boxShadow: shadow(10, 50, 0.2),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    minHeight: 52,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 14,
    outlineWidth: 0,
  },
  error: { color: Colors.red, fontSize: 13, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  action: { flex: 1, paddingVertical: 12 },
});
