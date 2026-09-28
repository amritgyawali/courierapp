import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { StoreSmallIcon } from '@/components/portal/icons';
import { Badge, Card, Chip, EmptyState, PortalHeader, SearchCountBar } from '@/components/portal/ui';
import { PortalColors as C } from '@/constants/theme';
import { KYC_META, type Merchant, merchantStats } from '@/data/ops';
import { formatRs } from '@/utils/format';

type Filter = 'all' | 'verified' | 'pending' | 'suspended';

const FILTERS: { key: Filter; label: string; test: (m: Merchant) => boolean }[] = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'verified', label: 'Verified', test: (m) => m.kyc === 'verified' && m.active },
  { key: 'pending', label: 'KYC pending', test: (m) => m.kyc === 'pending' },
  { key: 'suspended', label: 'Suspended', test: (m) => !m.active },
];

const INFO = {
  title: 'Merchants',
  body: 'Businesses that ship with Karnali Smart Group. Review KYC for new merchants, check volume and success rates, and see what each merchant is owed.',
};

export default function MerchantsScreen() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const { data, lookup } = useAdmin();
  const [filter, setFilter] = useState<Filter>((params.filter as Filter) ?? 'all');
  const [seen, setSeen] = useState(params.filter);
  if (params.filter !== seen) {
    setSeen(params.filter);
    if (params.filter) setFilter(params.filter as Filter);
  }
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const test = FILTERS.find((f) => f.key === filter)!.test;
  const list = data.merchants
    .filter((m) => test(m) && (!q || m.name.toLowerCase().includes(q) || m.owner.toLowerCase().includes(q) || m.phone.includes(q)))
    .map((m) => ({ merchant: m, stats: merchantStats(data, m.id) }))
    .sort((a, b) => b.stats.total - a.stats.total);

  return (
    <View style={styles.screen}>
      <PortalHeader title="Merchants" info={INFO} />
      <View style={styles.chipsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} role="tablist">
          {FILTERS.map((f) => (
            <Chip key={f.key} label={`${f.label} · ${data.merchants.filter(f.test).length}`} active={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </ScrollView>
      </View>
      <View style={styles.toolbar}>
        <SearchCountBar
          icon={<StoreSmallIcon size={18} color={C.red} />}
          label={`${list.length} merchant${list.length === 1 ? '' : 's'}`}
          searching={searching}
          onToggleSearch={() => {
            if (searching) setQuery('');
            setSearching(!searching);
          }}
          query={query}
          onQueryChange={setQuery}
          placeholder="Business, owner or phone"
        />
      </View>
      <FlatList
        data={list}
        keyExtractor={(x) => x.merchant.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: { merchant: m, stats } }) => (
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/admin/merchant/[id]', params: { id: m.id } })}>
            {({ pressed }) => (
              <Card style={[styles.card, pressed && { opacity: 0.85 }]}>
                <View style={styles.head}>
                  <View style={styles.logo}>
                    <StoreSmallIcon size={20} color={C.red} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.name}>{m.name}</Text>
                    <Text style={styles.meta}>
                      {m.owner} · {lookup.hub.get(m.hubId)?.name}
                    </Text>
                  </View>
                  {!m.active ? (
                    <Badge label="SUSPENDED" bg="#F3F4F6" color="#6B7280" />
                  ) : (
                    <Badge label={KYC_META[m.kyc].label.toUpperCase()} bg={KYC_META[m.kyc].bg} color={KYC_META[m.kyc].color} />
                  )}
                </View>
                <View style={styles.stats}>
                  <Stat label="Shipments" value={stats.total} />
                  <Stat label="Success" value={`${stats.successRate}%`} color="#16A34A" />
                  <Stat label="Due" value={formatRs(stats.pendingPayout)} color={C.amber} />
                </View>
              </Card>
            )}
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState icon={<StoreSmallIcon size={30} color={C.red} />} title="No merchants" message="Try another filter or search." />}
      />
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, color ? { color } : null]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  chipsBar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F2F4' },
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  toolbar: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4, flexDirection: 'row' },
  list: { padding: 12, gap: 12, paddingBottom: 40 },
  card: { padding: 14, gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.redTint, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  meta: { fontSize: 12, color: C.muted, marginTop: 2 },
  stats: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, paddingVertical: 10 },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  statValue: { fontSize: 15, fontWeight: '800', color: C.textStrong },
  statLabel: { fontSize: 11, color: C.muted, marginTop: 2 },
});
