import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { type ReactNode, useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';

import { Text } from '@/components/text';
import { makeStyles, useColors } from '@/theme';

export type DateButtonProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  /** Rendered trigger; receives nothing and is wrapped in a pressable. */
  children: ReactNode;
  accessibilityLabel: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

/** Opens the platform date picker when its children are pressed (web version: date-button.web.tsx). */
export function DateButton({ value, onChange, children, accessibilityLabel, minimumDate, maximumDate }: DateButtonProps) {
  const styles = useStyles();
  const C = useColors();
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? new Date());

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: value ?? new Date(),
        mode: 'date',
        minimumDate,
        maximumDate,
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(date);
        },
      });
    } else {
      setDraft(value ?? new Date());
      setIosOpen(true);
    }
  };

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={open} style={styles.flex}>
        {children}
      </Pressable>
      {Platform.OS === 'ios' && (
        <Modal visible={iosOpen} transparent animationType="fade" onRequestClose={() => setIosOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setIosOpen(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <DateTimePicker
                value={draft}
                mode="date"
                display="inline"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                accentColor={C.primary}
                onChange={(_, d) => d && setDraft(d)}
              />
              <View style={styles.actions}>
                <Pressable style={[styles.action, styles.cancel]} onPress={() => setIosOpen(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.action, styles.done]}
                  onPress={() => {
                    onChange(draft);
                    setIosOpen(false);
                  }}>
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 32 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  action: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  cancel: { backgroundColor: '#F3F4F6' },
  cancelText: { color: C.text, fontSize: 15, fontWeight: '600' },
  done: { backgroundColor: C.primary },
  doneText: { color: C.onPrimary, fontSize: 15, fontWeight: '700' },
}));
