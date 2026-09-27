import { StatusBar } from 'expo-status-bar';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BranchMap } from '@/components/branch-map';
import { EnvelopeIcon, LocationDotIcon, PaperPlaneIcon, PhoneIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ui';
import { Colors, shadow } from '@/constants/theme';
import { CONTACT } from '@/data/content';

const HQ = {
  latitude: CONTACT.latitude,
  longitude: CONTACT.longitude,
  title: 'Karnali Smart Group',
  description: 'Tinkune, Kathmandu',
};

function openDirections() {
  const { latitude, longitude } = CONTACT;
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${latitude},${longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  Linking.openURL(url);
}

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      {/* Also opened from the vendor portal, whose crimson header uses light status-bar text. */}
      <StatusBar style="dark" />
      <ScreenHeader title="Contact Us" back />
      <View style={styles.mapArea}>
        <BranchMap
          points={[HQ]}
          initialRegion={{ latitude: HQ.latitude - 0.004, longitude: HQ.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
          showZoom={false}
        />

        <View style={[styles.card, { bottom: insets.bottom + 16 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get directions"
            onPress={openDirections}
            style={({ pressed }) => [styles.navButton, pressed && { backgroundColor: Colors.redPressed }]}>
            <PaperPlaneIcon />
          </Pressable>

          <Text style={styles.heading}>Get In Touch</Text>
          <Text style={styles.subheading}>Reach Us</Text>

          <View style={{ gap: 16 }}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <LocationDotIcon />
              </View>
              <Text style={styles.rowText}>{CONTACT.address}</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <EnvelopeIcon size={16} color={Colors.red} />
              </View>
              <Text style={styles.rowText}>
                <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${CONTACT.emails[0]}`)}>
                  {CONTACT.emails[0]}
                </Text>
                {' or\n'}
                <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${CONTACT.emails[1]}`)}>
                  {CONTACT.emails[1]}
                </Text>
              </Text>
            </View>
            <Pressable style={[styles.row, { alignItems: 'center' }]} onPress={() => Linking.openURL(CONTACT.phoneHref)}>
              <View style={[styles.rowIcon, { marginTop: 0 }]}>
                <PhoneIcon />
              </View>
              <Text style={[styles.rowText, styles.phone]}>{CONTACT.phone}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  mapArea: { flex: 1, backgroundColor: '#E8ECEF' },
  card: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    boxShadow: shadow(12, 48, 0.2),
  },
  navButton: {
    position: 'absolute',
    top: -28,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow(6, 20, 0.3, Colors.red),
    zIndex: 2,
  },
  heading: { fontSize: 20, fontWeight: '700', color: Colors.black, marginBottom: 16, letterSpacing: -0.3 },
  subheading: { fontSize: 16, fontWeight: '700', color: Colors.black, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rowIcon: { width: 18, alignItems: 'center', marginTop: 1 },
  rowText: { flex: 1, fontSize: 13, lineHeight: 18, color: '#1F2937' },
  link: { color: '#1F2937' },
  phone: { fontWeight: '500', letterSpacing: 0.5 },
});
