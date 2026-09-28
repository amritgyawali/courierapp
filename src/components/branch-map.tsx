import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import { ZoomInIcon, ZoomOutIcon } from '@/components/icons';
import type { Branch } from '@/data/branches';
import { shadow, useColors } from '@/theme';

export type MapPoint = { latitude: number; longitude: number; title?: string; description?: string };

type Props = {
  points: MapPoint[];
  initialRegion: Region;
  /** When set, the map animates to this point. */
  focus?: MapPoint | null;
  focusDelta?: number;
  showZoom?: boolean;
  /** Padding for the zoom control so it clears overlays. */
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

export function BranchMap({ points, initialRegion, focus, focusDelta = 0.4, showZoom = true, zoomBottom = 16 }: Props) {
  const C = useColors();
  const mapRef = useRef<MapView>(null);
  const region = useRef<Region>(initialRegion);

  useEffect(() => {
    if (!focus) return;
    mapRef.current?.animateToRegion(
      { latitude: focus.latitude, longitude: focus.longitude, latitudeDelta: focusDelta, longitudeDelta: focusDelta },
      400,
    );
  }, [focus, focusDelta]);

  const zoom = (factor: number) => {
    const r = region.current;
    mapRef.current?.animateToRegion(
      { ...r, latitudeDelta: r.latitudeDelta * factor, longitudeDelta: r.longitudeDelta * factor },
      250,
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        onRegionChangeComplete={(r) => {
          region.current = r;
        }}
        toolbarEnabled={false}
        showsCompass={false}>
        {points.map((p) => (
          <Marker
            key={`${p.title}-${p.latitude}-${p.longitude}`}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.title}
            description={p.description}
            pinColor={C.primary}
          />
        ))}
      </MapView>
      {showZoom && (
        <View style={[styles.zoom, { bottom: zoomBottom }]}>
          <Pressable accessibilityLabel="Zoom in" style={[styles.zoomBtn, styles.zoomDivider]} onPress={() => zoom(0.5)}>
            <ZoomInIcon />
          </Pressable>
          <Pressable accessibilityLabel="Zoom out" style={styles.zoomBtn} onPress={() => zoom(2)}>
            <ZoomOutIcon />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  zoom: {
    position: 'absolute',
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    boxShadow: shadow(2, 8, 0.15),
  },
  zoomBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  zoomDivider: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
});
