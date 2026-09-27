import { createElement } from 'react';
import { StyleSheet, View } from 'react-native';

import type { DateButtonProps } from './date-button';

const toInput = (d?: Date | null) =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '';

/** Web: an invisible native `<input type="date">` laid over the trigger opens the browser picker. */
export function DateButton({ value, onChange, children, accessibilityLabel, minimumDate, maximumDate }: DateButtonProps) {
  return (
    <View style={styles.flex}>
      {children}
      {createElement('input', {
        type: 'date',
        'aria-label': accessibilityLabel,
        value: toInput(value),
        min: toInput(minimumDate) || undefined,
        max: toInput(maximumDate) || undefined,
        // Open the calendar on any click, not only on the (hidden) calendar glyph.
        onClick: (e: { currentTarget: { showPicker?: () => void } }) => {
          try {
            e.currentTarget.showPicker?.();
          } catch {}
        },
        onChange: (e: { target: { value: string } }) => {
          const [y, m, d] = e.target.value.split('-').map(Number);
          if (y && m && d) onChange(new Date(y, m - 1, d));
        },
        style: {
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
          border: 'none',
        },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
