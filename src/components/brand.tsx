import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';

import { Colors, shadow } from '@/constants/theme';

export function LogoMark({ size = 24, color = Colors.red }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path d="M6 18H18V6H24V24H6V18Z" fill={color} />
      <Path d="M42 30H30V42H24V24H42V30Z" fill={color} />
    </Svg>
  );
}

/** Large wordmark used on the Login / Register screens. */
export function BrandLogoLarge() {
  return (
    <View style={styles.largeRow} accessibilityLabel="Karnali Smart Group Logo">
      <LogoMark size={40} />
      <Text style={styles.largeText}>
        karnali <Text style={styles.largeTextLight}>smart</Text> group
      </Text>
    </View>
  );
}

/** Compact wordmark used at the right of screen headers. */
export function BrandLogoSmall({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.smallRow}>
      <LogoMark size={compact ? 18 : 22} />
      <Text style={[styles.smallText, compact && styles.smallTextCompact]}>karnali smart group</Text>
    </View>
  );
}

/** Open cardboard box with an error bubble — the shared empty-state artwork. */
export function EmptyBoxIllustration({
  circleSize = 192,
  color = Colors.illustration,
}: {
  circleSize?: number;
  color?: string;
}) {
  const art = circleSize * 0.58;
  return (
    <View
      style={[
        styles.emptyCircle,
        { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
      ]}>
      <Svg width={art} height={art} viewBox="0 0 120 120" fill="none" stroke={color}>
        <Path d="M28 42H36M32 38V46" strokeWidth={2.5} strokeLinecap="round" />
        <Path d="M88 40L96 48M96 40L88 48" strokeWidth={2.5} strokeLinecap="round" />
        <Circle cx={36} cy={24} r={2.5} fill={color} stroke="none" />
        <Circle cx={92} cy={74} r={3} strokeWidth={2.2} />
        <Path
          d="M57 23C47 23 39 30 39 39C39 43.5 41.5 47.5 45.5 50L43 57L51.5 53.5C53.2 54.5 55 55 57 55C67 55 75 48 75 39C75 30 67 23 57 23Z"
          fill="white"
          strokeWidth={2.3}
          strokeLinejoin="round"
        />
        <Path d="M52 34L62 44M62 34L52 44" strokeWidth={2.3} strokeLinecap="round" />
        <Path d="M22 62L44 48L60 56L38 70L22 62Z" strokeWidth={2.3} strokeLinejoin="round" />
        <Path d="M98 62L76 48L60 56L82 70L98 62Z" strokeWidth={2.3} strokeLinejoin="round" />
        <Path d="M30 70V98H89V70" strokeWidth={2.3} strokeLinejoin="round" />
        <Line x1={60} y1={70} x2={60} y2={98} strokeWidth={2.3} />
        <Circle cx={41} cy={91} r={1.5} fill={color} stroke="none" />
        <Circle cx={46} cy={91} r={1.5} fill={color} stroke="none" />
        <Circle cx={51} cy={91} r={1.5} fill={color} stroke="none" />
        <Path
          d="M75 92V81M75 81L70.5 85.5M75 81L79.5 85.5"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

/** Nepal landscape silhouette (mountains, stupas, trekkers) shown above the tab bar. */
export function NepalSkyline({ height = 80 }: { height?: number }) {
  return (
    <View style={{ height, width: '100%', pointerEvents: 'none' }}>
      <Svg width="100%" height="100%" viewBox="0 0 600 120" preserveAspectRatio="none">
        <Path
          fill={Colors.skyline}
          opacity={0.35}
          d="M0,75 L45,48 L110,72 L180,38 L240,68 L320,40 L400,65 L480,32 L540,58 L600,42 L600,120 L0,120 Z"
        />
        <Path
          fill={Colors.skyline}
          opacity={0.6}
          d="M0,88 Q30,78 60,82 Q120,70 170,88 Q210,85 240,84 L244,75 L247,75 L248,84 Q270,84 285,82 L288,68 L293,68 L295,82 Q320,83 330,78 L334,70 L337,70 L340,78 L355,79 L357,60 L361,58 L363,79 L385,80 L388,72 L392,72 L395,80 Q420,82 445,74 L450,56 L454,48 L457,48 L460,56 L466,75 Q490,78 520,72 L535,62 L550,75 L565,65 L600,78 L600,120 L0,120 Z"
        />
        <Path
          fill={Colors.skyline}
          opacity={0.85}
          d="M0,98 Q40,94 75,97 Q115,90 150,96 Q200,98 250,94 L252,86 L254,86 L255,94 Q290,95 320,93 L323,80 L327,80 L329,93 Q360,94 390,90 L400,84 L405,84 L410,92 Q460,95 500,88 L510,78 L516,74 L522,78 L530,92 Q565,92 600,90 L600,120 L0,120 Z"
        />
        <Polygon fill={Colors.skyline} points="268,95 272,74 276,95" />
        <Polygon fill={Colors.skyline} points="270,74 272,66 274,74" />
        <Circle fill={Colors.skyline} cx={455} cy={80} r={10} />
        <Polygon fill={Colors.skyline} points="452,70 455,52 458,70" />
        <Circle fill={Colors.skyline} cx={118} cy={79} r={2.2} />
        <Path fill={Colors.skyline} d="M116,81 L120,81 L122,89 L119,89 L118,85 L115,89 L114,89 Z" />
        <Circle cx={180} cy={86} r={3} fill="none" stroke={Colors.skyline} strokeWidth={1} />
        <Circle cx={192} cy={86} r={3} fill="none" stroke={Colors.skyline} strokeWidth={1} />
        <Path
          d="M180,86 L186,81 L192,86 M186,81 L184,76 L187,76"
          stroke={Colors.skyline}
          strokeWidth={1}
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  largeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  largeText: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.red,
    letterSpacing: -0.5,
  },
  largeTextLight: { fontWeight: '400' },
  smallRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  smallText: { fontSize: 17, fontWeight: '700', color: Colors.red, letterSpacing: -0.3 },
  smallTextCompact: { fontSize: 13 },
  emptyCircle: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow(1, 4, 0.05),
  },
});
