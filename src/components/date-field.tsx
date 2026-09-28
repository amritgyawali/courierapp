import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';

import { CalendarIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { IconInput } from '@/components/ui';
import { makeStyles } from '@/theme';

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fromIso = (s: string) => {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date(2000, 0, 1) : d;
};

/** "Date of birth" row: native date picker on iOS/Android, plain text input on web. */
export function DateField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const styles = useStyles();
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState(fromIso(value));

  if (Platform.OS === 'web') {
    return (
      <IconInput
        icon={<CalendarIcon />}
        placeholder={`${placeholder} (YYYY-MM-DD)`}
        value={value}
        onChangeText={onChange}
        containerStyle={styles.container}
        style={styles.text}
      />
    );
  }

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: fromIso(value),
        mode: 'date',
        maximumDate: new Date(),
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(toIso(date));
        },
      });
    } else {
      setDraft(fromIso(value));
      setIosOpen(true);
    }
  };

  return (
    <>
      <Pressable accessibilityRole="button" onPress={open} style={[styles.container, styles.row]}>
        <View style={styles.icon}>
          <CalendarIcon />
        </View>
        <Text style={[styles.text, !value && { color: '#374151' }]}>{value || placeholder}</Text>
      </Pressable>
      {Platform.OS === 'ios' && (
        <Modal visible={iosOpen} transparent animationType="fade" onRequestClose={() => setIosOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setIosOpen(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <DateTimePicker
                value={draft}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(_, d) => d && setDraft(d)}
              />
              <Pressable
                style={styles.done}
                onPress={() => {
                  onChange(toIso(draft));
                  setIosOpen(false);
                }}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  container: { backgroundColor: '#F1F3F5', minHeight: 54 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16 },
  icon: { marginRight: 14, width: 24, alignItems: 'center' },
  text: { fontSize: 15, color: '#1F2937' },
  backdrop: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, paddingBottom: 32 },
  done: { backgroundColor: C.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  doneText: { color: C.onPrimary, fontSize: 16, fontWeight: '600' },
}));
