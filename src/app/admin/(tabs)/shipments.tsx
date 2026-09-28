import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { ShipmentCard } from '@/components/ops/shipment';
import { CubeIcon, DownloadIcon, OfficeIcon } from '@/components/portal/icons';
import { Chip, EmptyState, PortalHeader, SearchCountBar, ToolButton } from '@/components/portal/ui';
import { useNow } from '@/components/portal/widgets';
import { SelectSheet } from '@/components/ui';
import { isOverdue, searchShipments, type Shipment, shipmentsCsv } from '@/data/ops';
import { useBrand } from '@/state/branding-state';
import { makeStyles, useColors } from '@/theme';
import { shareText } from '@/utils/links';
import { oneOf } from '@/utils/params';

const FILTERS = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'pickups', label: 'Pickups', test: (s: Shipment) => ['pickup-requested', 'pickup-assigned', 'picked-up'].includes(s.status) },
  { key: 'at-hub', label: 'At Hub', test: (s: Shipment) => s.status === 'at-hub' },
  { key: 'out-for-delivery', label: 'Out for Delivery', test: (s: Shipment) => s.status === 'out-for-delivery' },
  { key: 'delivered', label: 'Delivered', test: (s: Shipment) => s.status === 'delivered' },
  { key: 'failed', label: 'Failed', test: (s: Shipment) => s.status === 'failed' },
  { key: 'returns', label: 'Returns', test: (s: Shipment) => s.status === 'returning' || s.status === 'returned' },
  { key: 'overdue', label: 'SLA Breached', test: (s: Shipment, now: Date) => isOverdue(s, now) },
  { key: 'cancelled', label: 'Cancelled', test: (s: Shipment) => s.status === 'cancelled' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

const FILTER_KEYS = FILTERS.map((f) => f.key);

const ALL_HUBS = 'All hubs';

const INFO = {
  title: 'Shipments',
  body: 'Every parcel in the network. Filter by stage, find a parcel by tracking ID, phone, receiver or merchant, narrow to a hub, and export the current list as CSV.',
};

export default function AdminShipments() {
  const styles = useStyles();
  const C = useColors();
  const params = useLocalSearchParams<{ q?: string; filter?: string }>();
  const { data, lookup } = useAdmin();
  const { shortName } = useBrand();
  const now = useNow();

  const [filter, setFilter] = useState<FilterKey>(oneOf(params.filter, FILTER_KEYS, 'all'));
  const [query, setQuery] = useState(params.q ?? '');
  const [searching, setSearching] = useState(Boolean(params.q));
  const [hubId, setHubId] = useState<string | null>(null);
  const [hubSheet, setHubSheet] = useState(false);

  // Links from the dashboard re-seed filters when their params change.
  const [seen, setSeen] = useState(params);
  if (params.q !== seen.q || params.filter !== seen.filter) {
    setSeen(params);
    if (params.filter) setFilter(oneOf(params.filter, FILTER_KEYS, 'all'));
    if (params.q !== undefined) {
      setQuery(params.q);
      setSearching(Boolean(params.q));
    }
  }

  const test = (FILTERS.find((f) => f.key === filter) ?? FILTERS[0]).test;
  const list = searchShipments(
    data.shipments.filter((s) => test(s, now) && (!hubId || s.hubId === hubId)),
    query,
    data.merchants,
  );

  const hubOptions = [ALL_HUBS, ...data.hubs.map((h) => h.name)];

  return (
    <View style={styles.screen}>
      <PortalHeader title="Shipments" info={INFO} />

      <View style={styles.chipsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} role="tablist">
          {FILTERS.map((f) => (
            <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.toolbar}>
        <SearchCountBar
          icon={<CubeIcon size={18} color={C.primary} />}
          label={`${list.length} shipment${list.length === 1 ? '' : 's'}${hubId ? ` · ${lookup.hub.get(hubId)?.name}` : ''}`}
          searching={searching}
          onToggleSearch={() => {
            if (searching) setQuery('');
            setSearching(!searching);
          }}
          query={query}
          onQueryChange={setQuery}
          placeholder="Tracking ID, phone, receiver…"
        />
        <ToolButton label="Filter by hub" active={!!hubId} onPress={() => setHubSheet(true)}>
          <OfficeIcon size={20} color={hubId ? C.primary : '#4B5563'} />
        </ToolButton>
        <ToolButton label="Export as CSV" onPress={() => shareText(`${shortName} shipments export`, shipmentsCsv(data, list))}>
          <DownloadIcon size={20} color="#4B5563" />
        </ToolButton>
      </View>

      <FlatList
        data={list}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        windowSize={7}
        renderItem={({ item }) => (
          <ShipmentCard
            shipment={item}
            now={now}
            merchantName={lookup.merchant.get(item.merchantId)?.name}
            riderName={item.riderId ? lookup.rider.get(item.riderId)?.name : undefined}
            onPress={() => router.push({ pathname: '/admin/shipment/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<CubeIcon size={30} color={C.primary} />}
            title="No shipments here"
            message={query || hubId ? 'Try a different search or hub.' : 'Parcels in this stage will appear here.'}
          />
        }
      />

      <SelectSheet
        visible={hubSheet}
        title="Filter by hub"
        options={hubOptions}
        selected={hubId ? lookup.hub.get(hubId)?.name : ALL_HUBS}
        onSelect={(name) => setHubId(data.hubs.find((h) => h.name === name)?.id ?? null)}
        onClose={() => setHubSheet(false)}
        accent={C.primary}
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
  chipsBar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F2F4' },
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  toolbar: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 },
  list: { padding: 12, gap: 12, paddingBottom: 40 },
}));
