import { Pressable, View } from 'react-native';

import { OfficeIcon, PhoneFilledIcon, PinFilledIcon, SirenIcon } from '@/components/portal/icons';
import { Sheet } from '@/components/portal/widgets';
import { useRider } from '@/components/rider/use-rider';
import { Text } from '@/components/text';
import { makeStyles, useColors } from '@/theme';
import { callPhone, shareText } from '@/utils/links';

/** Emergency options for riders on the road (Nepal: Police 100, Ambulance 102). */
export function SosSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const styles = useStyles();
  const C = useColors();
  const { me, hub } = useRider();

  const options = [
    { label: 'Call Police', detail: '100', icon: <SirenIcon size={22} color="#FFFFFF" />, color: '#1D4ED8', onPress: () => callPhone('100') },
    { label: 'Call Ambulance', detail: '102', icon: <PhoneFilledIcon size={22} color="#FFFFFF" />, color: '#DC2626', onPress: () => callPhone('102') },
    { label: 'Call hub manager', detail: `${hub.manager} · ${hub.phone}`, icon: <OfficeIcon size={22} color="#FFFFFF" />, color: C.primary, onPress: () => callPhone(hub.phone) },
    {
      label: 'Share my location',
      detail: 'Send your last position to someone',
      icon: <PinFilledIcon size={22} color="#FFFFFF" />,
      color: '#0F766E',
      onPress: () =>
        shareText(
          'Rider emergency',
          `EMERGENCY — ${me.name} (${me.id}, ${me.vehicle.plate}) needs help.\nLast location: https://maps.google.com/?q=${me.latitude.toFixed(5)},${me.longitude.toFixed(5)}`,
        ),
    },
  ];

  return (
    <Sheet visible={visible} title="Emergency SOS" subtitle="Stay calm. Choose who to contact." onClose={onClose}>
      {options.map((o) => (
        <Pressable
          key={o.label}
          accessibilityRole="button"
          accessibilityLabel={`${o.label}, ${o.detail}`}
          onPress={o.onPress}
          style={({ pressed }) => [styles.option, pressed && { opacity: 0.8 }]}>
          <View style={[styles.icon, { backgroundColor: o.color }]}>{o.icon}</View>
          <View style={styles.flex}>
            <Text style={styles.label}>{o.label}</Text>
            <Text style={styles.detail}>{o.detail}</Text>
          </View>
        </Pressable>
      ))}
    </Sheet>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  flex: { flex: 1 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#EEF0F3' },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: '800', color: C.textStrong },
  detail: { fontSize: 13, color: C.muted, marginTop: 2 },
}));
