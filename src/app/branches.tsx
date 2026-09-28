import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { CloseIcon, SearchIcon } from '@/components/icons';
import { Text, TextInput } from '@/components/text';
import { ScreenHeader } from '@/components/ui';
import { filterBranches } from '@/data/branches';
import { useBrand } from '@/state/branding-state';
import { makeStyles } from '@/theme';

export default function BranchesScreen() {
  const styles = useStyles();
  const { shortName } = useBrand();
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const branches = useMemo(() => filterBranches(query), [query]);

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={`Search ${shortName} Branches`}
        back
        right={
          <Pressable
            accessibilityLabel="Search"
            hitSlop={10}
            onPress={() => {
              setSearching((s) => !s);
              setQuery('');
            }}>
            {searching ? <CloseIcon /> : <SearchIcon strokeWidth={2.5} />}
          </Pressable>
        }
      />
      {searching && (
        <View style={styles.searchBar}>
          <SearchIcon size={18} color="#9CA3AF" strokeWidth={2} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search by branch, municipality or district"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            autoCorrect={false}
          />
        </View>
      )}
      <FlatList
        data={branches}
        keyExtractor={(b) => b.name}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.noResults}>No branches found</Text>}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.index}>{index + 1}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.address}>
              {item.municipality}
              {'\n'}
              {item.district}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 11,
    color: C.textStrong,
    outlineWidth: 0,
  },
  item: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  index: { color: C.primary, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  name: { color: '#000000', fontWeight: '900', fontSize: 15, letterSpacing: 0.6, marginBottom: 4 },
  address: { color: '#7E868E', fontWeight: '600', fontSize: 13, letterSpacing: 0.6, lineHeight: 18 },
  noResults: { textAlign: 'center', color: C.muted, marginTop: 40, fontSize: 15 },
}));
