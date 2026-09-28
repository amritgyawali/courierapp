import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/text';
import { Button, ScreenHeader } from '@/components/ui';
import { SERVICES } from '@/data/content';
import { makeStyles, useColors } from '@/theme';

export default function ServicesScreen() {
  const styles = useStyles();
  const C = useColors();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [page, setPage] = useState(0);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Services" back />
      <View style={styles.cta}>
        <Text style={styles.ctaText}>Interested?</Text>
        <Button
          title="Get Started"
          radius={8}
          style={styles.ctaButton}
          onPress={() => router.push('/contact')}
        />
      </View>

      <FlatList
        ref={listRef}
        data={SERVICES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.title}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        onScroll={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={32}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={[styles.dots, { paddingBottom: insets.bottom + 36 }]}>
        {SERVICES.map((s, i) => (
          <Pressable
            key={s.title}
            accessibilityLabel={`Show ${s.title}`}
            hitSlop={6}
            onPress={() => listRef.current?.scrollToIndex({ index: i, animated: true })}
            style={[styles.dot, { backgroundColor: i === page ? C.primary : C.primaryMuted }]}
          />
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
  cta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  ctaText: { fontSize: 15, fontWeight: '600', color: C.textStrong },
  ctaButton: { paddingVertical: 9, paddingHorizontal: 16 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 32 },
  title: { color: C.primary, fontWeight: '700', fontSize: 25, marginBottom: 12, letterSpacing: -0.4 },
  body: {
    color: C.textStrong,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: 340,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
}));
