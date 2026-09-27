import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CloseIcon, SearchIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { filterBranches } from '@/data/branches';

export default function BranchesScreen() {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const branches = useMemo(() => filterBranches(query), [query]);

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Search KSG Branches"
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

const styles = StyleSheet.create({
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
    color: Colors.black,
    outlineWidth: 0,
  },
  item: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  index: { color: '#D81B43', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  name: { color: '#000000', fontWeight: '900', fontSize: 15, letterSpacing: 0.6, marginBottom: 4 },
  address: { color: '#7E868E', fontWeight: '600', fontSize: 13, letterSpacing: 0.6, lineHeight: 18 },
  noResults: { textAlign: 'center', color: Colors.textMuted, marginTop: 40, fontSize: 15 },
});
