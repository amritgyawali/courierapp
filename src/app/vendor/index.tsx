import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  CalendarFilledIcon,
  CartIcon,
  ChatFilledIcon,
  CheckIcon,
  ChevronRightIcon,
  DocumentLinesIcon,
  DotsIcon,
  FolderIcon,
  MegaphoneIcon,
  ShoppingBagFilledIcon,
  TruckIcon,
  UndoFilledIcon,
} from '@/components/portal/icons';
import { HeaderIconButton, IconTile, InfoSheet, SectionHeading, PortalFab, PortalHeader } from '@/components/portal/ui';
import { shadow, PortalColors as C } from '@/constants/theme';
import { dashboardSummary } from '@/data/vendor';
import { useVendorState } from '@/state/vendor-state';
import { formatRs, greeting, initials, isSameDay } from '@/utils/format';

const NEW_ORDER_INFO = {
  title: 'Create an order',
  body: 'Booking new orders from the app is coming soon. Your existing orders, payments and comments are all available from the tabs below.',
};

export default function DashboardScreen() {
  const { profile, orders, comments, isCommentRead } = useVendorState();
  const [newOrderInfo, setNewOrderInfo] = useState(false);

  const summary = dashboardSummary(orders);
  const today = new Date();
  const todaysComments = comments.filter((c) => isSameDay(new Date(c.createdAt), today)).length;
  const unclosedComments = comments.filter((c) => !isCommentRead(c.id)).length;

  return (
    <View style={styles.screen}>
      <PortalHeader
        right={
          <HeaderIconButton label="Announcements and comments" onPress={() => router.navigate('/vendor/actions')}>
            <MegaphoneIcon size={26} color="#FFFFFF" />
          </HeaderIconButton>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(profile.businessName)}</Text>
          </View>
          <View style={styles.greetingText}>
            <Text style={styles.greetingTitle}>{greeting(today)}</Text>
            <Text style={styles.greetingName} numberOfLines={1}>
              {profile.businessName}
            </Text>
            <Text style={styles.greetingId}>Vendor ID: {profile.vendorId}</Text>
          </View>
        </View>

        {/* Order counts */}
        <View style={styles.row}>
          <StatCard
            color={C.blue}
            icon={<CartIcon size={20} color="#FFFFFF" />}
            value={summary.totalOrders}
            label="Total Orders"
            onPress={() => router.navigate('/vendor/orders')}
          />
          <StatCard
            color={C.green}
            icon={<TruckIcon size={20} color="#FFFFFF" />}
            value={summary.deliveredOrders}
            label="Delivered Orders"
            onPress={() => router.navigate({ pathname: '/vendor/orders', params: { status: 'delivered' } })}
          />
        </View>

        {/* Order values */}
        <SectionHeading icon={<DocumentLinesIcon size={20} color={C.red} />} title="Order Values" />
        <View style={styles.row}>
          <ValueCard
            icon={<ShoppingBagFilledIcon size={20} color={C.blue} />}
            tint="#EBF0FF"
            label="Total Value"
            value={summary.totalValue}
            color={C.blue}
          />
          <ValueCard
            icon={<CheckIcon size={20} color={C.green} />}
            tint="#EAF7EE"
            label="Delivered Value"
            value={summary.deliveredValue}
            color={C.green}
          />
        </View>
        <View style={styles.row}>
          <ValueCard
            icon={<UndoFilledIcon size={20} color={C.rose} />}
            tint="#FDECEE"
            label="Returned Value"
            value={summary.returnedValue}
            color={C.rose}
          />
          <ValueCard
            icon={<DotsIcon size={20} color={C.amber} />}
            tint="#FFF8E6"
            label="Pending Value"
            value={summary.pendingValue}
            color={C.amber}
          />
        </View>

        {/* Today's activities */}
        <SectionHeading icon={<CalendarFilledIcon size={20} color={C.red} />} title="Today's Activities" />
        <ActivityRow
          icon={<ChatFilledIcon size={17} color="#0284C7" />}
          tint="#E0F2FE"
          title="Today's Comments"
          count={todaysComments}
          color="#0284C7"
          chevron
          onPress={() => router.navigate('/vendor/actions')}
        />
        <ActivityRow
          icon={<FolderIcon size={17} color="#D97706" />}
          tint="#FEF3C7"
          title="Unclosed Comments"
          count={unclosedComments}
          color="#D97706"
          onPress={() => router.navigate('/vendor/actions')}
        />
      </ScrollView>

      <PortalFab label="Add new order" variant="outline" onPress={() => setNewOrderInfo(true)} />
      <InfoSheet visible={newOrderInfo} content={NEW_ORDER_INFO} onClose={() => setNewOrderInfo(false)} />
    </View>
  );
}

function StatCard({
  color,
  icon,
  value,
  label,
  onPress,
}: {
  color: string;
  icon: ReactNode;
  value: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [styles.statCard, { backgroundColor: color }, pressed && { opacity: 0.9 }]}>
      <View style={styles.statTop}>
        <View style={styles.statIcon}>{icon}</View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <View style={styles.statBottom}>
        <Text style={styles.statLabel}>{label}</Text>
        <ChevronRightIcon size={15} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

function ValueCard({
  icon,
  tint,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  tint: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.valueCard} accessible accessibilityLabel={`${label}: ${formatRs(value)}`}>
      <IconTile bg={tint} size={42} radius={10}>
        {icon}
      </IconTile>
      <Text style={styles.valueLabel}>{label}</Text>
      <Text style={[styles.valueAmount, { color }]}>{formatRs(value)}</Text>
    </View>
  );
}

function ActivityRow({
  icon,
  tint,
  title,
  count,
  color,
  chevron,
  onPress,
}: {
  icon: ReactNode;
  tint: string;
  title: string;
  count: number;
  color: string;
  chevron?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${count}`}
      onPress={onPress}
      style={({ pressed }) => [styles.activity, pressed && { backgroundColor: '#FAFAFB' }]}>
      <IconTile bg={tint} size={38} radius={10}>
        {icon}
      </IconTile>
      <View style={styles.activityText}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={[styles.activityCount, { color }]}>{count}</Text>
      </View>
      {chevron && <ChevronRightIcon size={16} color={C.faint} />}
    </Pressable>
  );
}

const cardSurface = {
  backgroundColor: C.card,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: C.cardBorder,
  boxShadow: shadow(1, 6, 0.06),
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 14, gap: 14, paddingBottom: 100 },
  greeting: {
    backgroundColor: C.red,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    boxShadow: shadow(1, 4, 0.1),
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 19, fontWeight: '700', letterSpacing: 1 },
  greetingText: { flex: 1 },
  greetingTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  greetingName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 2, opacity: 0.97 },
  greetingId: { color: '#FFFFFF', fontSize: 13, marginTop: 2, opacity: 0.92 },
  row: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, height: 100, borderRadius: 14, padding: 14, justifyContent: 'space-between', boxShadow: shadow(1, 4, 0.1) },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { color: '#FFFFFF', fontSize: 19, fontWeight: '700' },
  statBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  valueCard: { ...cardSurface, flex: 1, alignItems: 'center', paddingVertical: 18, paddingHorizontal: 10 },
  valueLabel: { fontSize: 13, color: C.muted, fontWeight: '500', marginTop: 10 },
  valueAmount: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  activity: { ...cardSurface, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  activityText: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: C.textStrong },
  activityCount: { fontSize: 14, fontWeight: '700', marginTop: 2 },
});
