import { StatusBar } from 'expo-status-bar';
import { Linking, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BranchMap } from '@/components/branch-map';
import { EnvelopeIcon, LocationDotIcon, PaperPlaneIcon, PhoneIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { ScreenHeader } from '@/components/ui';
import { HQ_LOCATION } from '@/data/content';
import { useBrand } from '@/state/branding-state';
import { makeStyles, shadow, useColors } from '@/theme';

function openDirections() {
  const { latitude, longitude } = HQ_LOCATION;
  const url =
    Platform.OS === 'ios'
      ? `https://maps.apple.com/?daddr=${latitude},${longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  Linking.openURL(url).catch(() => {});
}

const open = (url: string) => Linking.openURL(url).catch(() => {});

export default function ContactScreen() {
  const styles = useStyles();
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { appName, support } = useBrand();
  const hq = { ...HQ_LOCATION, title: appName, description: support.address };
  const emails = [support.salesEmail, support.supportEmail].filter(Boolean);
  return (
    <View style={styles.screen}>
      {/* Also opened from the portals, whose brand-coloured headers use light status-bar text. */}
      <StatusBar style="dark" />
      <ScreenHeader title="Contact Us" back />
      <View style={styles.mapArea}>
        <BranchMap
          points={[hq]}
          initialRegion={{ latitude: hq.latitude - 0.004, longitude: hq.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
          showZoom={false}
        />

        <View style={[styles.card, { bottom: insets.bottom + 16 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get directions"
            onPress={openDirections}
            style={({ pressed }) => [styles.navButton, pressed && { backgroundColor: C.primaryPressed }]}>
            <PaperPlaneIcon />
          </Pressable>

          <Text style={styles.heading}>Get In Touch</Text>
          <Text style={styles.subheading}>Reach Us</Text>

          <View style={{ gap: 16 }}>
            {!!support.address && (
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <LocationDotIcon />
                </View>
                <Text style={styles.rowText}>{support.address}</Text>
              </View>
            )}
            {emails.length > 0 && (
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <EnvelopeIcon size={16} color={C.primary} />
                </View>
                <Text style={styles.rowText}>
                  {emails.map((email, i) => (
                    <Text key={email}>
                      {i > 0 && ' or\n'}
                      <Text style={styles.link} onPress={() => open(`mailto:${email}`)}>
                        {email}
                      </Text>
                    </Text>
                  ))}
                </Text>
              </View>
            )}
            {!!support.phone && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Call ${support.phone}`}
                style={[styles.row, { alignItems: 'center' }]}
                onPress={() => open(`tel:${support.phone.replace(/[^+\d]/g, '')}`)}>
                <View style={[styles.rowIcon, { marginTop: 0 }]}>
                  <PhoneIcon />
                </View>
                <Text style={[styles.rowText, styles.phone]}>{support.phone}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
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
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow(6, 20, 0.3, C.primary),
    zIndex: 2,
  },
  heading: { fontSize: 20, fontWeight: '700', color: C.textStrong, marginBottom: 16, letterSpacing: -0.3 },
  subheading: { fontSize: 16, fontWeight: '700', color: C.textStrong, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rowIcon: { width: 18, alignItems: 'center', marginTop: 1 },
  rowText: { flex: 1, fontSize: 13, lineHeight: 18, color: '#1F2937' },
  link: { color: '#1F2937' },
  phone: { fontWeight: '500', letterSpacing: 0.5 },
}));
