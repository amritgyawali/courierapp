import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BranchMap, NEPAL_REGION, branchToPoint, type MapPoint } from '@/components/branch-map';
import { CloseIcon, SearchIcon } from '@/components/icons';
import { TextInput } from '@/components/text';
import { filterBranches } from '@/data/branches';
import { shadow, useColors } from '@/theme';

export default function FindUsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [focus, setFocus] = useState<MapPoint | null>(null);

  const points = useMemo(() => filterBranches(query).map(branchToPoint), [query]);

  const search = () => {
    const first = points[0];
    if (query.trim() && first) setFocus({ ...first });
  };

  const clear = () => {
    setQuery('');
    setFocus({ ...NEPAL_REGION });
  };

  return (
    <View style={styles.screen}>
      <BranchMap
        points={points}
        initialRegion={NEPAL_REGION}
        focus={focus}
        focusDelta={focus && focus.title ? 0.35 : NEPAL_REGION.latitudeDelta}
      />
      <View style={[styles.searchWrap, { top: insets.top + 12 }]}>
        <View style={styles.searchBox}>
          <Pressable accessibilityLabel="Clear search" hitSlop={8} onPress={clear}>
            <CloseIcon size={20} />
          </Pressable>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={C.placeholder}
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={search}
            autoCorrect={false}
          />
          <Pressable accessibilityLabel="Submit search" hitSlop={8} onPress={search}>
            <SearchIcon size={20} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E5ECE0' },
  searchWrap: { position: 'absolute', left: 20, right: 20, pointerEvents: 'box-none' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(209,213,219,0.8)',
    paddingHorizontal: 16,
    height: 50,
    boxShadow: shadow(2, 12, 0.12),
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingHorizontal: 12,
    outlineWidth: 0,
  },
});
