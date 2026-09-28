import { type ReactNode, useState } from 'react';
import { Linking, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';

import {
  ArchiveIcon,
  BuildingsFilledIcon,
  GlobeIcon,
  MunicipalityIcon,
  OfficeIcon,
  PhoneFilledIcon,
  PinFilledIcon,
  PriceTagIcon,
  QrIcon,
  RegionFlagIcon,
} from '@/components/portal/icons';
import { Card, Chip, EmptyState, IconTile, SearchCountBar, PortalHeader } from '@/components/portal/ui';
import { PortalColors as C } from '@/constants/theme';
import { type Branch, BRANCHES, branchCode, branchRegion, filterBranches } from '@/data/branches';

type Tab = 'branches' | 'prices' | 'codes';

const INFO = {
  title: 'Resources',
  body: 'Reference information for your shop: every KSG branch with the areas it covers and its phone number, the delivery price list, and package codes.',
};

const AVATAR_COLORS = ['#4666E5', '#E91E63', '#0EA5E9', '#F59E0B', '#10B981', '#8B5CF6'];

/** Colours cycle down the alphabetical list, so a branch keeps its colour while searching. */
const AVATAR_BY_NAME = new Map(
  [...BRANCHES]
    .sort((a, z) => a.name.localeCompare(z.name))
    .map((b, i) => [b.name, AVATAR_COLORS[i % AVATAR_COLORS.length]]),
);

function groupByLetter(branches: Branch[]) {
  const groups = new Map<string, Branch[]>();
  for (const b of [...branches].sort((a, z) => a.name.localeCompare(z.name))) {
    const letter = b.name[0];
    groups.set(letter, [...(groups.get(letter) ?? []), b]);
  }
  return [...groups].map(([title, data]) => ({ title, data }));
}

export default function ResourcesScreen() {
  const [tab, setTab] = useState<Tab>('branches');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const branches = filterBranches(query);
  const sections = groupByLetter(branches);

  return (
    <View style={styles.screen}>
      <PortalHeader title="Resources" info={INFO} />

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} role="tablist">
          <Chip
            variant="neutral"
            label="Branch List"
            icon={(color) => <BuildingsFilledIcon size={17} color={color} />}
            active={tab === 'branches'}
            onPress={() => setTab('branches')}
          />
          <Chip
            variant="neutral"
            label="Price List"
            icon={(color) => <PriceTagIcon size={17} color={color} />}
            active={tab === 'prices'}
            onPress={() => setTab('prices')}
          />
          <Chip
            variant="neutral"
            label="Package Code"
            icon={(color) => <ArchiveIcon size={17} color={color} />}
            active={tab === 'codes'}
            onPress={() => setTab('codes')}
          />
        </ScrollView>
      </View>

      {tab === 'branches' ? (
        <SectionList
          sections={sections}
          keyExtractor={(b) => b.name}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.search}>
              <SearchCountBar
                icon={<OfficeIcon size={18} color={C.red} />}
                label={`${branches.length} ${branches.length === 1 ? 'Branch' : 'Branches'}`}
                searching={searching}
                onToggleSearch={() => {
                  if (searching) setQuery('');
                  setSearching(!searching);
                }}
                query={query}
                onQueryChange={setQuery}
                placeholder="Branch, municipality or district"
                searchIconColor={C.red}
              />
            </View>
          }
          renderSectionHeader={({ section }) => <Text style={styles.letter}>{section.title}</Text>}
          renderItem={({ item }) => <BranchCard branch={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              icon={<OfficeIcon size={30} color={C.red} />}
              title="No branches found"
              message="Try a different branch, municipality or district name."
            />
          }
        />
      ) : (
        <EmptyState
          icon={tab === 'prices' ? <PriceTagIcon size={30} color={C.red} /> : <ArchiveIcon size={30} color={C.red} />}
          title={tab === 'prices' ? 'Price list coming soon' : 'Package codes coming soon'}
          message={
            tab === 'prices'
              ? 'Delivery rates for your account will be shown here once they are published.'
              : 'Package size and type codes will be shown here once they are published.'
          }
        />
      )}
    </View>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  const region = branchRegion(branch);
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: AVATAR_BY_NAME.get(branch.name) ?? AVATAR_COLORS[0] }]}>
          <Text style={styles.avatarText}>{branch.name.slice(0, 2)}</Text>
        </View>
        <View>
          <Text style={styles.name}>{branch.name}</Text>
          <View style={styles.codeRow}>
            <QrIcon size={14} color={C.faint} />
            <Text style={styles.code}>{branchCode(branch)}</Text>
          </View>
        </View>
      </View>

      <InfoRow icon={<MunicipalityIcon size={17} color="#0284C7" />} tint="#E0F2FE" label="Municipality" value={branch.municipality} />
      <InfoRow icon={<GlobeIcon size={17} color="#D97706" />} tint="#FEF3C7" label="District" value={branch.district} />
      {region && <InfoRow icon={<RegionFlagIcon size={17} color="#EF4444" />} tint="#FEE2E2" label="Region" value={region} />}
      {branch.phone && (
        <InfoRow
          icon={<PhoneFilledIcon size={17} color="#0284C7" />}
          tint="#E0F2FE"
          label="Phone"
          value={branch.phone}
          onPress={() => Linking.openURL(`tel:${branch.phone}`).catch(() => {})}
        />
      )}
      {branch.areas && branch.areas.length > 0 && (
        <InfoRow
          icon={<PinFilledIcon size={17} color="#9333EA" />}
          tint="#F3E8FF"
          label="Areas Covered"
          value={branch.areas.join(', ')}
          small
        />
      )}
    </Card>
  );
}

function InfoRow({
  icon,
  tint,
  label,
  value,
  small,
  onPress,
}: {
  icon: ReactNode;
  tint: string;
  label: string;
  value: string;
  small?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      <IconTile bg={tint} size={32} radius={9}>
        {icon}
      </IconTile>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, small && styles.infoValueSmall]}>{value}</Text>
      </View>
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [styles.infoRow, pressed && { opacity: 0.6 }]}>
      {content}
    </Pressable>
  ) : (
    <View style={styles.infoRow}>{content}</View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FB' },
  chips: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 8, gap: 10 },
  list: { paddingHorizontal: 12, paddingBottom: 40 },
  search: { paddingTop: 6, paddingBottom: 4 },
  letter: { fontSize: 17, fontWeight: '700', color: C.muted, paddingHorizontal: 6, paddingTop: 16, paddingBottom: 8 },
  separator: { height: 14 },
  card: { padding: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  name: { fontSize: 15, fontWeight: '600', color: C.textStrong, letterSpacing: 0.5 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  code: { fontSize: 13, color: C.faint, letterSpacing: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: C.faint },
  infoValue: { fontSize: 13, fontWeight: '500', color: C.textStrong, marginTop: 3, letterSpacing: 0.2 },
  infoValueSmall: { fontSize: 12, lineHeight: 19, color: '#374151', textTransform: 'uppercase' },
});
