import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyBoxIllustration } from '@/components/brand';
import { SmallChevronDownIcon } from '@/components/icons';
import { ScreenHeader, SelectSheet } from '@/components/ui';
import { Colors, shadow } from '@/constants/theme';
import { OFFER_CATEGORIES } from '@/data/content';

export default function OffersScreen() {
  const [category, setCategory] = useState('All');
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Offers" back />
      <View style={styles.content}>
        <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={styles.filter}>
          <Text style={styles.filterText}>{category}</Text>
          <SmallChevronDownIcon size={10} />
        </Pressable>

        <View style={styles.empty}>
          <EmptyBoxIllustration circleSize={170} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            Seems like there aren&apos;t any {category === 'All' ? '' : `${category.toLowerCase()} `}offers at the
            moment
          </Text>
        </View>
      </View>

      <SelectSheet
        visible={open}
        title="Filter offers"
        options={OFFER_CATEGORIES}
        selected={category}
        onSelect={setCategory}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { flex: 1, padding: 16 },
  filter: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 11,
    boxShadow: shadow(1, 6, 0.06),
  },
  filterText: { fontSize: 14, fontWeight: '600', color: Colors.navy },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 96, paddingHorizontal: 16 },
  emptyText: { marginTop: 24, fontSize: 14.5, lineHeight: 22, color: '#171717', textAlign: 'center' },
});
