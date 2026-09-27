import { StyleSheet, View } from 'react-native';

import type { Branch } from '@/data/branches';

// react-native-maps has no web support, so the web build embeds an OpenStreetMap view instead.

export type MapPoint = { latitude: number; longitude: number; title?: string; description?: string };
type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };

type Props = {
  points: MapPoint[];
  initialRegion: Region;
  focus?: MapPoint | null;
  focusDelta?: number;
  showZoom?: boolean;
  zoomBottom?: number;
};

export const NEPAL_REGION: Region = {
  latitude: 27.9,
  longitude: 84.3,
  latitudeDelta: 4.2,
  longitudeDelta: 4.2,
};

export function branchToPoint(b: Branch): MapPoint {
  return {
    latitude: b.latitude,
    longitude: b.longitude,
    title: b.name,
    description: `${b.municipality}, ${b.district}`,
  };
}

export function BranchMap({ points, initialRegion, focus, focusDelta = 0.4 }: Props) {
  const center = focus ?? (points.length === 1 ? points[0] : null);
  const r: Region = center
    ? { latitude: center.latitude, longitude: center.longitude, latitudeDelta: focusDelta, longitudeDelta: focusDelta }
    : initialRegion;
  const bbox = [
    r.longitude - r.longitudeDelta,
    r.latitude - r.latitudeDelta / 2,
    r.longitude + r.longitudeDelta,
    r.latitude + r.latitudeDelta / 2,
  ].join(',');
  const marker = center ? `&marker=${center.latitude},${center.longitude}` : '';
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`;

  return (
    <View style={StyleSheet.absoluteFill}>
      <iframe title="Map" src={src} style={{ border: 0, width: '100%', height: '100%' }} />
    </View>
  );
}
