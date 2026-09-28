import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AssignSheet } from '@/components/admin/assign-sheet';
import { useAdmin } from '@/components/admin/use-admin';
import { StatusBadge, Timeline } from '@/components/ops/shipment';
import {
  AlertTriangleIcon,
  BikeIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  MessageIcon,
  NavigationIcon,
  PhoneOutlineIcon,
  ReturnArrowIcon,
  StoreSmallIcon,
  UserIcon,
} from '@/components/portal/icons';
import { Card, EmptyState, PortalHeader } from '@/components/portal/ui';
import { Avatar, Button, KeyValue, Sheet, TextField, useNow, useToast } from '@/components/portal/widgets';
import { Text } from '@/components/text';
import { ALL_STATUSES, CLOSED_STATUSES, DUTY_META, isOverdue, quote, type ShipmentStatus, STATUS_META } from '@/data/ops';
import { useBrand } from '@/state/branding-state';
import { makeStyles, useColors } from '@/theme';
import { formatDateTime, formatDuration, formatRs } from '@/utils/format';
import { callPhone, navigateTo, sendSms, shareText } from '@/utils/links';

const ASSIGNABLE: ShipmentStatus[] = ['pickup-requested', 'pickup-assigned', 'picked-up', 'at-hub', 'out-for-delivery', 'returning'];

export default function AdminShipmentDetail() {
  const styles = useStyles();
  const C = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, dispatch, actor, lookup } = useAdmin();
  const { appName, shortName } = useBrand();
  const toast = useToast();
  const now = useNow();
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<ShipmentStatus | null>(null);
  const [note, setNote] = useState('');

  const s = data.shipments.find((x) => x.id === id);
  if (!s) {
    return (
      <View style={styles.screen}>
        <PortalHeader title="Shipment" back backHref="/admin/shipments" />
        <EmptyState icon={<CubeIcon size={30} color={C.primary} />} title="Shipment not found" message={`No parcel with tracking ID ${id}.`} />
      </View>
    );
  }

  const merchant = lookup.merchant.get(s.merchantId);
  const rider = s.riderId ? lookup.rider.get(s.riderId) : undefined;
  const podRider = s.pod ? lookup.rider.get(s.pod.riderId) : undefined;
  const hub = lookup.hub.get(s.hubId);
  const closed = CLOSED_STATUSES.includes(s.status);
  const overdue = isOverdue(s, now);
  const dueIn = new Date(s.promisedBy).getTime() - now.getTime();
  const breakdown = quote(data.rateCard, s.zone, s.weightKg, s.cod, s.fragile);

  const saveStatus = () => {
    if (!nextStatus) return;
    dispatch({ type: 'setStatus', id: s.id, status: nextStatus, note: note.trim() || 'Updated by admin', actor });
    toast(`Status set to ${STATUS_META[nextStatus].label}`);
    setStatusOpen(false);
    setNextStatus(null);
    setNote('');
  };

  const share = () =>
    shareText(
      `Shipment ${s.id}`,
      `${appName} shipment ${s.id}\nStatus: ${STATUS_META[s.status].label}\nReceiver: ${s.receiver.name}, ${s.receiver.address}\nCOD: ${formatRs(s.cod)}\nUpdated: ${formatDateTime(s.updatedAt)}`,
    );

  return (
    <View style={styles.screen}>
      <PortalHeader title={s.id} back backHref="/admin/shipments" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary */}
        <Card style={styles.card}>
          <View style={styles.summaryTop}>
            <StatusBadge status={s.status} />
            {!closed &&
              (overdue ? (
                <View style={styles.sla}>
                  <AlertTriangleIcon size={14} color="#DC2626" />
                  <Text style={[styles.slaText, { color: '#DC2626' }]}>Overdue by {formatDuration(-dueIn)}</Text>
                </View>
              ) : (
                <View style={styles.sla}>
                  <ClockIcon size={14} color={C.muted} />
                  <Text style={styles.slaText}>Due in {formatDuration(dueIn)}</Text>
                </View>
              ))}
          </View>
          <KeyValue label="Booked" value={formatDateTime(s.createdAt)} />
          <KeyValue label="Promised by" value={formatDateTime(s.promisedBy)} />
          <KeyValue label="Hub" value={hub?.name ?? s.hubId} />
          <KeyValue label="Attempts" value={`${s.attempts} of ${data.settings.maxAttempts}`} />
          {s.failReason && <KeyValue label="Last issue" value={s.failReason} valueColor={C.danger} />}
        </Card>

        {/* People */}
        <Card style={styles.card}>
          <Party
            icon={<UserIcon size={18} color="#2563EB" />}
            tint="#EFF6FF"
            role="Receiver"
            name={s.receiver.name}
            detail={`${s.receiver.phone} · ${s.receiver.address}`}
            actions={[
              { label: 'Call receiver', icon: <PhoneOutlineIcon size={17} color={C.primary} />, onPress: () => callPhone(s.receiver.phone) },
              { label: 'Message receiver', icon: <MessageIcon size={17} color={C.primary} />, onPress: () => sendSms(s.receiver.phone, `${shortName}: Update on parcel ${s.id}`) },
              { label: 'Directions', icon: <NavigationIcon size={17} color={C.primary} />, onPress: () => navigateTo(s.latitude, s.longitude) },
            ]}
          />
          <View style={styles.divider} />
          <Party
            icon={<StoreSmallIcon size={18} color="#0369A1" />}
            tint="#E0F2FE"
            role="Merchant"
            name={merchant?.name ?? s.merchantId}
            detail={merchant ? `${merchant.owner} · ${merchant.phone}` : ''}
            onPress={merchant ? () => router.push({ pathname: '/admin/merchant/[id]', params: { id: merchant.id } }) : undefined}
            actions={merchant ? [{ label: 'Call merchant', icon: <PhoneOutlineIcon size={17} color={C.primary} />, onPress: () => callPhone(merchant.phone) }] : []}
          />
          <View style={styles.divider} />
          {rider ? (
            <Party
              icon={<Avatar name={rider.name} size={36} status={DUTY_META[rider.duty].color} />}
              role="Rider"
              name={rider.name}
              detail={`${DUTY_META[rider.duty].label} · ${rider.vehicle.plate}`}
              onPress={() => router.push({ pathname: '/admin/rider/[id]', params: { id: rider.id } })}
              actions={[{ label: 'Call rider', icon: <PhoneOutlineIcon size={17} color={C.primary} />, onPress: () => callPhone(rider.phone) }]}
            />
          ) : (
            <Party icon={<BikeIcon size={18} color={C.muted} />} tint="#F3F4F6" role="Rider" name={closed ? 'None' : 'Not assigned'} detail={closed ? '' : 'Assign a rider to move this parcel'} />
          )}
        </Card>

        {/* Package & money */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Package & charges</Text>
          <KeyValue label="Contents" value={s.item} />
          <KeyValue label="Weight" value={`${s.weightKg} kg${s.fragile ? ' · Fragile' : ''}`} />
          <KeyValue label="Cash on delivery" value={s.cod ? formatRs(s.cod) : 'Prepaid'} valueColor={s.cod ? C.primary : '#16A34A'} />
          <View style={styles.divider} />
          <KeyValue label="Base (first kg)" value={formatRs(breakdown.base)} />
          {breakdown.weightCharge > 0 && <KeyValue label="Extra weight" value={formatRs(breakdown.weightCharge)} />}
          {breakdown.codFee > 0 && <KeyValue label={`COD fee (${data.rateCard.codFeePercent}%)`} value={formatRs(breakdown.codFee)} />}
          {breakdown.fragile > 0 && <KeyValue label="Fragile handling" value={formatRs(breakdown.fragile)} />}
          <KeyValue label="Delivery charge" value={formatRs(s.charge)} bold />
        </Card>

        {/* Proof of delivery */}
        {s.pod && (
          <Card style={[styles.card, styles.pod]}>
            <View style={styles.podHead}>
              <CheckCircleIcon size={20} color="#16A34A" />
              <Text style={styles.cardTitle}>Proof of delivery</Text>
            </View>
            <KeyValue label="Received by" value={s.pod.receivedBy} />
            <KeyValue label="OTP" value={s.pod.otpVerified ? 'Verified' : 'Not verified'} valueColor={s.pod.otpVerified ? '#16A34A' : '#DC2626'} />
            <KeyValue label="Collected" value={`${formatRs(s.pod.collected)} · ${s.pod.method === 'cash' ? 'Cash' : 'Online'}`} />
            <KeyValue label="Delivered by" value={podRider?.name ?? s.pod.riderId} />
            <KeyValue label="Delivered at" value={formatDateTime(s.pod.at)} />
            {s.pod.note && <KeyValue label="Note" value={s.pod.note} />}
          </Card>
        )}

        {/* Timeline */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Tracking history</Text>
          <Timeline events={s.events} />
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          {s.status === 'failed' && (
            <>
              <Button
                title="Queue re-attempt"
                icon={(c) => <ClockIcon size={17} color={c} />}
                onPress={() => {
                  dispatch({ type: 'reattempt', id: s.id, actor });
                  toast('Parcel queued for another attempt');
                }}
              />
              <Button
                title="Return to merchant"
                variant="outline"
                icon={(c) => <ReturnArrowIcon size={17} color={c} />}
                onPress={() => {
                  dispatch({ type: 'returnToMerchant', id: s.id, actor });
                  toast('Return to merchant started');
                }}
              />
            </>
          )}
          {ASSIGNABLE.includes(s.status) && (
            <Button title={rider ? 'Reassign rider' : 'Assign rider'} icon={(c) => <BikeIcon size={17} color={c} />} onPress={() => setAssignOpen(true)} />
          )}
          <Button title="Change status" variant="soft" onPress={() => setStatusOpen(true)} />
          <Button title="Share details" variant="ghost" onPress={share} />
          {!closed && <Button title="Cancel shipment" variant="danger" onPress={() => setCancelOpen(true)} />}
        </View>
      </ScrollView>

      <AssignSheet visible={assignOpen} shipments={[s]} onClose={() => setAssignOpen(false)} />

      <Sheet
        visible={statusOpen}
        title="Change status"
        subtitle="Manual override — recorded in the audit log"
        onClose={() => setStatusOpen(false)}
        footer={<Button title="Save status" disabled={!nextStatus || nextStatus === s.status} onPress={saveStatus} />}>
        <View style={styles.statusGrid}>
          {ALL_STATUSES.map((st) => {
            const active = (nextStatus ?? s.status) === st;
            return (
              <Pressable
                key={st}
                role="radio"
                aria-checked={active}
                onPress={() => setNextStatus(st)}
                style={[styles.statusOption, active && { borderColor: STATUS_META[st].color, backgroundColor: STATUS_META[st].bg }]}>
                <Text style={[styles.statusOptionText, active && { color: STATUS_META[st].color, fontWeight: '700' }]}>{STATUS_META[st].label}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextField label="Note (optional)" value={note} onChangeText={setNote} placeholder="Reason for the change" />
      </Sheet>

      <Sheet
        visible={cancelOpen}
        title="Cancel this shipment?"
        subtitle="The merchant is not charged for cancelled parcels. This cannot be undone."
        onClose={() => setCancelOpen(false)}
        footer={
          <>
            <Button
              title="Yes, cancel shipment"
              variant="danger"
              onPress={() => {
                dispatch({ type: 'setStatus', id: s.id, status: 'cancelled', note: 'Cancelled by admin', actor });
                toast('Shipment cancelled', 'info');
                setCancelOpen(false);
              }}
            />
            <Button title="Keep shipment" variant="ghost" onPress={() => setCancelOpen(false)} />
          </>
        }>
        <Text style={styles.cancelText}>
          {s.id} for {s.receiver.name} ({s.cod ? `COD ${formatRs(s.cod)}` : 'prepaid'}).
        </Text>
      </Sheet>
    </View>
  );
}

function Party({
  icon,
  tint,
  role,
  name,
  detail,
  actions = [],
  onPress,
}: {
  icon: ReactNode;
  tint?: string;
  role: string;
  name: string;
  detail?: string;
  actions?: { label: string; icon: ReactNode; onPress: () => void }[];
  onPress?: () => void;
}) {
  const styles = useStyles();
  const C = useColors();
  return (
    <View style={styles.party}>
      <Pressable disabled={!onPress} onPress={onPress} style={styles.partyMain} accessibilityRole={onPress ? 'button' : undefined}>
        <View style={[styles.partyIcon, tint ? { backgroundColor: tint } : null]}>{icon}</View>
        <View style={styles.flex}>
          <Text style={styles.partyRole}>{role}</Text>
          <Text style={[styles.partyName, onPress && { color: C.primary }]}>{name}</Text>
          {!!detail && <Text style={styles.partyDetail}>{detail}</Text>}
        </View>
      </Pressable>
      <View style={styles.partyActions}>
        {actions.map((a) => (
          <Pressable key={a.label} accessibilityRole="button" accessibilityLabel={a.label} hitSlop={6} onPress={a.onPress} style={styles.partyAction}>
            {a.icon}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  card: { padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.textStrong, marginBottom: 6 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  sla: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  slaText: { fontSize: 12, fontWeight: '700', color: C.muted },
  divider: { height: 1, backgroundColor: C.divider, marginVertical: 10 },
  party: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partyMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  partyIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  partyRole: { fontSize: 11, fontWeight: '700', color: C.faint, textTransform: 'uppercase', letterSpacing: 0.6 },
  partyName: { fontSize: 15, fontWeight: '700', color: C.textStrong, marginTop: 1 },
  partyDetail: { fontSize: 12, color: C.muted, marginTop: 2 },
  partyActions: { flexDirection: 'row', gap: 8 },
  partyAction: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.primaryTint, alignItems: 'center', justifyContent: 'center' },
  pod: { borderColor: '#BBF7D0', backgroundColor: '#F7FEF9' },
  podHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actions: { gap: 10 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusOption: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  statusOptionText: { fontSize: 13, color: C.text },
  cancelText: { fontSize: 14, color: C.text },
}));
