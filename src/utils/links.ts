import { Linking, Platform, Share } from 'react-native';

const open = (url: string, fallback?: string) =>
  Linking.openURL(url).catch(() => (fallback ? Linking.openURL(fallback).catch(() => {}) : undefined));

export const callPhone = (phone: string) => open(`tel:${phone.replace(/\s+/g, '')}`);

export const sendSms = (phone: string, body = '') => {
  const separator = Platform.OS === 'ios' ? '&' : '?';
  return open(`sms:${phone.replace(/\s+/g, '')}${separator}body=${encodeURIComponent(body)}`);
};

export const sendEmail = (email: string, subject = '') =>
  open(`mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`);

/** Turn-by-turn directions in Google Maps (app if installed, otherwise the website). */
export function navigateTo(latitude: number, longitude: number) {
  const web = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
  const native = Platform.select({
    android: `google.navigation:q=${latitude},${longitude}&mode=l`,
    ios: `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`,
  });
  return native ? open(native, web) : open(web);
}

/** Multi-stop route in Google Maps (up to 9 waypoints + destination). */
export function navigateRoute(stops: { latitude: number; longitude: number }[]) {
  if (stops.length === 0) return Promise.resolve();
  const list = stops.slice(0, 10);
  const destination = list[list.length - 1];
  const waypoints = list
    .slice(0, -1)
    .map((s) => `${s.latitude},${s.longitude}`)
    .join('|');
  return open(
    `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}` +
      (waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : '') +
      '&travelmode=driving',
  );
}

/** Share text (CSV exports, tracking details) through the system share sheet. */
export async function shareText(title: string, message: string) {
  try {
    await Share.share({ title, message });
  } catch {
    // Dismissed or unsupported.
  }
}
