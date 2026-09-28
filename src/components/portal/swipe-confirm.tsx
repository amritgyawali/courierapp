import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ChevronRightIcon } from '@/components/portal/icons';
import { Text } from '@/components/text';
import { shadow, useColors } from '@/theme';

const KNOB = 52;
const PAD = 4;

/**
 * "Slide to confirm" control for irreversible rider actions (deliver, pick up). Prevents
 * accidental taps while riding; screen-reader users get a plain double-tap button instead.
 */
export function SwipeToConfirm({
  label,
  onConfirm,
  color = '#16A34A',
  disabled,
}: {
  label: string;
  onConfirm: () => void;
  color?: string;
  disabled?: boolean;
}) {
  const C = useColors();
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);
  const max = Math.max(0, width - KNOB - PAD * 2);

  const confirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onConfirm();
  };

  const pan = Gesture.Pan()
    .enabled(!disabled && max > 0)
    .onUpdate((e) => {
      x.value = Math.min(max, Math.max(0, e.translationX));
    })
    .onEnd(() => {
      if (x.value > max * 0.85) {
        x.value = withSequence(withTiming(max, { duration: 120 }), withDelay(350, withTiming(0, { duration: 300 })));
        scheduleOnRN(confirm);
      } else {
        x.value = withSpring(0, { damping: 18 });
      }
    });

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: x.value + KNOB + PAD }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, max * 0.6 || 1], [1, 0]) }));

  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Double tap to confirm"
      accessibilityState={{ disabled }}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'activate' && !disabled) confirm();
      }}
      style={[styles.track, { backgroundColor: disabled ? '#E5E7EB' : `${color}1F` }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
      <Animated.View style={[styles.labelWrap, labelStyle]}>
        <Text style={[styles.label, { color: disabled ? C.faint : color }]} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.knob, { backgroundColor: disabled ? '#9CA3AF' : color }, knobStyle]}>
          <View style={styles.chevrons}>
            <ChevronRightIcon size={18} color="#FFFFFF" />
            <ChevronRightIcon size={18} color="rgba(255,255,255,0.6)" />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: KNOB + PAD * 2, borderRadius: (KNOB + PAD * 2) / 2, justifyContent: 'center', overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: (KNOB + PAD * 2) / 2, opacity: 0.25 },
  labelWrap: { position: 'absolute', left: KNOB + 16, right: 16, pointerEvents: 'none' },
  label: { textAlign: 'center', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  knob: {
    position: 'absolute',
    left: PAD,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow(2, 8, 0.25),
  },
  chevrons: { flexDirection: 'row', marginLeft: 6 },
});
