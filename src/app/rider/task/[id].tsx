import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBadge, Timeline } from '@/components/ops/shipment';
import { DateButton } from '@/components/portal/date-button';
import {
  AlertTriangleIcon,
  CalendarOutlineIcon,
  CubeIcon,
  MessageIcon,
  NavigationIcon,
  PhoneOutlineIcon,
  ScanIcon,
  WineGlassIcon,
} from '@/components/portal/icons';
import { ScannerModal } from '@/components/portal/scanner';
import { SwipeToConfirm } from '@/components/portal/swipe-confirm';
import { Badge, Card, Chip, EmptyState, PortalHeader } from '@/components/portal/ui';
import { Button, KeyValue, Sheet, TextField, useToast } from '@/components/portal/widgets';
import { taskParty } from '@/components/rider/task-card';
import { useRider } from '@/components/rider/use-rider';
import { PortalColors as C } from '@/constants/theme';
import { FAIL_REASONS, type PaymentMethod, TASK_META, taskKind } from '@/data/ops';
import { addDays, formatDate, formatDateTime, formatRs, startOfDay } from '@/utils/format';
import { callPhone, navigateTo, sendSms } from '@/utils/links';

const RESCHEDULE_REASON = 'Receiver asked to reschedule';

export default function RiderTaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data, dispatch, me, hub, route, actor } = useRider();
  const toast = useToast();

  const [deliverOpen, setDeliverOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [receivedBy, setReceivedBy] = useState('');
  const [otp, setOtp] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState(FAIL_REASONS[0]);
  const [reschedule, setReschedule] = useState<Date>(addDays(startOfDay(new Date()), 1));
  const [showHistory, setShowHistory] = useState(false);

  const s = data.shipments.find((x) => x.id === id);
  const kind = s ? taskKind(s) : null;
  const stop = route.stops.find((st) => st.shipment.id === id);

  if (!s || !kind || s.riderId !== me.id) {
    const finished = s && (s.pod?.riderId === me.id || s.events.some((e) => e.actor === me.name));
    return (
      <View style={styles.screen}>
        <PortalHeader title="Task" back backHref="/rider/tasks" />
        <EmptyState
          icon={<CubeIcon size={30} color={C.red} />}
          title={finished ? 'Task completed' : 'Task not available'}
          message={finished ? `${s?.id} is now ${s?.status.replace(/-/g, ' ')}.` : 'This parcel is not assigned to you any more.'}
        />
        <View style={styles.pad}>
          <Button title="Back to tasks" onPress={() => router.navigate('/rider/tasks')} />
        </View>
      </View>
    );
  }

  const meta = TASK_META[kind];
  const party = taskParty(data, s, hub);
  const target = stop ?? { latitude: s.latitude, longitude: s.longitude };
  const otpRequired = data.settings.otpRequired;
  const otpOk = !otpRequired || otp === s.otp;
  const canDeliver = receivedBy.trim().length >= 2 && otpOk;

  const done = (message: string) => {
    toast(message);
    router.back();
  };

  const confirmStatus = (status: 'picked-up' | 'at-hub' | 'returned', message: string) => {
    dispatch({ type: 'setStatus', id: s.id, status, actor, silent: true, note: status === 'at-hub' ? `Handed over at ${hub.name}` : undefined });
    done(message);
  };

  const deliver = () => {
    dispatch({
      type: 'deliver',
      id: s.id,
      riderId: me.id,
      receivedBy: receivedBy.trim(),
      otpVerified: otpRequired && otp === s.otp,
      collected: s.cod,
      method: s.cod ? method : 'cash',
      note: note.trim() || undefined,
      actor,
    });
    setDeliverOpen(false);
    done(`Delivered to ${receivedBy.trim()}${s.cod ? ` · ${formatRs(s.cod)} collected` : ''}`);
  };

  const fail = () => {
    dispatch({
      type: 'fail',
      id: s.id,
      reason: note.trim() ? `${reason} — ${note.trim()}` : reason,
      rescheduledFor: reason === RESCHEDULE_REASON ? reschedule.toISOString() : undefined,
      actor,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setFailOpen(false);
    toast('Attempt recorded — return the parcel to the hub', 'info');
    router.back();
  };

  return (
    <View style={styles.screen}>
      <PortalHeader title={`Stop ${stop?.sequence ?? ''} · ${meta.label}`} back backHref="/rider/tasks" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 140 + insets.bottom }]}>
        {/* Task banner */}
        <View style={[styles.banner, { backgroundColor: meta.bg }]}>
          <Text style={[styles.bannerKind, { color: meta.color }]}>{meta.verb}</Text>
          <StatusBadge status={s.status} />
        </View>

        {/* Party */}
        <Card style={styles.card}>
          <Text style={styles.label}>{kind === 'delivery' ? 'Receiver' : kind === 'drop' ? 'Hub' : 'Merchant'}</Text>
          <Text style={styles.party}>{party.title}</Text>
          <Text style={styles.address}>{party.address}</Text>
          {kind === 'delivery' && <Text style={styles.phone}>{party.phone}</Text>}
          <View style={styles.contactRow}>
            <ContactButton label="Call" icon={<PhoneOutlineIcon size={18} color={C.red} />} onPress={() => callPhone(party.phone)} />
            <ContactButton
              label="SMS"
              icon={<MessageIcon size={18} color={C.red} />}
              onPress={() => sendSms(party.phone, `Namaste, this is ${me.name.split(' ')[0]} from Karnali Smart Group about parcel ${s.id}. I am on my way.`)}
            />
            <ContactButton label="Navigate" icon={<NavigationIcon size={18} color={C.red} />} onPress={() => navigateTo(target.latitude, target.longitude)} />
          </View>
        </Card>

        {/* Money */}
        {kind === 'delivery' && (
          <Card style={[styles.card, styles.codCard, s.cod === 0 && styles.prepaidCard]}>
            <Text style={styles.label}>{s.cod ? 'Collect cash on delivery' : 'Prepaid parcel'}</Text>
            <Text style={[styles.codAmount, s.cod === 0 && { color: '#16A34A' }]}>{s.cod ? formatRs(s.cod) : 'Nothing to collect'}</Text>
          </Card>
        )}

        {/* Warnings */}
        {(s.fragile || s.attempts > 0 || s.rescheduledFor) && (
          <Card style={[styles.card, styles.notes]}>
            {s.fragile && (
              <View style={styles.noteRow}>
                <WineGlassIcon size={16} color="#D97706" />
                <Text style={styles.noteText}>Fragile — handle with care, keep upright.</Text>
              </View>
            )}
            {s.attempts > 0 && (
              <View style={styles.noteRow}>
                <AlertTriangleIcon size={16} color={C.red} />
                <Text style={styles.noteText}>
                  Attempt {s.attempts + 1} of {data.settings.maxAttempts}
                  {s.failReason ? ` · last time: ${s.failReason}` : ''}
                </Text>
              </View>
            )}
            {s.rescheduledFor && (
              <View style={styles.noteRow}>
                <CalendarOutlineIcon size={16} color="#2563EB" />
                <Text style={styles.noteText}>Receiver asked for {formatDate(new Date(s.rescheduledFor))}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Parcel */}
        <Card style={styles.card}>
          <KeyValue label="Tracking ID" value={s.id} />
          <KeyValue label="Contents" value={s.item} />
          <KeyValue label="Weight" value={`${s.weightKg} kg`} />
          <KeyValue label="Merchant" value={data.merchants.find((m) => m.id === s.merchantId)?.name ?? s.merchantId} />
          <KeyValue label="Booked" value={formatDateTime(s.createdAt)} />
          <Pressable accessibilityRole="button" onPress={() => setShowHistory(!showHistory)} style={styles.historyToggle}>
            <Text style={styles.link}>{showHistory ? 'Hide tracking history' : 'Show tracking history'}</Text>
          </Pressable>
          {showHistory && <Timeline events={s.events} />}
        </Card>
      </ScrollView>

      {/* Actions */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
        {kind === 'pickup' && (
          <>
            <SwipeToConfirm label="Slide to confirm pickup" color="#4F46E5" onConfirm={() => confirmStatus('picked-up', `Picked up ${s.id}`)} />
            <Button compact variant="ghost" title="Scan label to verify" icon={(c) => <ScanIcon size={16} color={c} />} onPress={() => setScanning(true)} />
          </>
        )}
        {kind === 'drop' && (
          <SwipeToConfirm label={`Slide to hand over at ${hub.name.replace(' Hub', '')}`} color="#7E22CE" onConfirm={() => confirmStatus('at-hub', `${s.id} handed over at ${hub.name}`)} />
        )}
        {kind === 'return' && (
          <SwipeToConfirm label="Slide to confirm return" color="#B45309" onConfirm={() => confirmStatus('returned', `${s.id} returned to merchant`)} />
        )}
        {kind === 'delivery' && (
          <View style={styles.row}>
            <Button title="Unable to deliver" variant="danger" onPress={() => setFailOpen(true)} style={styles.flex} />
            <Button
              title="Deliver"
              variant="success"
              onPress={() => {
                setReceivedBy(s.receiver.name);
                setOtp('');
                setDeliverOpen(true);
              }}
              style={styles.flex}
            />
          </View>
        )}
      </View>

      {/* Deliver */}
      <Sheet
        visible={deliverOpen}
        title="Complete delivery"
        subtitle={`${s.id} · ${s.receiver.name}`}
        onClose={() => setDeliverOpen(false)}
        footer={<SwipeToConfirm label="Slide to complete delivery" disabled={!canDeliver} onConfirm={deliver} />}>
        <TextField label="Received by" value={receivedBy} onChangeText={setReceivedBy} autoCapitalize="words" placeholder="Name of the person receiving" />
        {otpRequired && (
          <View style={styles.otpBlock}>
            <Text style={styles.otpLabel}>Delivery OTP from receiver</Text>
            <TextInput
              value={otp}
              onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="••••"
              placeholderTextColor={C.faint}
              style={[styles.otpInput, otp.length === 4 && (otpOk ? styles.otpOk : styles.otpBad)]}
              accessibilityLabel="Delivery OTP"
            />
            <Text style={[styles.otpHint, otp.length === 4 && !otpOk && { color: '#DC2626' }]}>
              {otp.length === 4 && !otpOk ? 'OTP does not match. Ask the receiver to check their SMS.' : `Demo build: receiver OTP is ${s.otp}`}
            </Text>
          </View>
        )}
        {s.cod > 0 && (
          <>
            <Text style={styles.otpLabel}>Payment received ({formatRs(s.cod)})</Text>
            <View style={styles.row}>
              <Chip variant="tint" fill label="Cash" active={method === 'cash'} onPress={() => setMethod('cash')} />
              <Chip variant="tint" fill label="Online / QR" active={method === 'online'} onPress={() => setMethod('online')} />
            </View>
          </>
        )}
        <TextField label="Note (optional)" value={note} onChangeText={setNote} placeholder="e.g. Left with the guard" />
      </Sheet>

      {/* Fail */}
      <Sheet
        visible={failOpen}
        title="Unable to deliver"
        subtitle="The receiver is notified and the parcel goes back to the hub."
        onClose={() => setFailOpen(false)}
        footer={<Button title="Record failed attempt" variant="danger" onPress={fail} />}>
        {FAIL_REASONS.map((r) => (
          <Pressable key={r} role="radio" aria-checked={reason === r} onPress={() => setReason(r)} style={[styles.reason, reason === r && styles.reasonActive]}>
            <View style={[styles.radio, reason === r && styles.radioActive]} />
            <Text style={[styles.reasonText, reason === r && styles.reasonTextActive]}>{r}</Text>
          </Pressable>
        ))}
        {reason === RESCHEDULE_REASON && (
          <DateButton value={reschedule} minimumDate={addDays(startOfDay(new Date()), 1)} accessibilityLabel="Reschedule date" onChange={setReschedule}>
            <View style={styles.dateBox}>
              <CalendarOutlineIcon size={18} color={C.red} />
              <Text style={styles.dateText}>Deliver on {formatDate(reschedule)}</Text>
              <Badge label="CHANGE" bg={C.redTint} color={C.red} />
            </View>
          </DateButton>
        )}
        <TextField label="Details (optional)" value={note} onChangeText={setNote} placeholder="What happened?" />
      </Sheet>

      <ScannerModal
        visible={scanning}
        title="Verify parcel label"
        onClose={() => setScanning(false)}
        onScan={(code) => {
          setScanning(false);
          if (code === s.id) confirmStatus('picked-up', `Label verified · picked up ${s.id}`);
          else toast(`Scanned ${code} — this is not ${s.id}`, 'error');
        }}
      />
    </View>
  );
}

function ContactButton({ label, icon, onPress }: { label: string; icon: ReactNode; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.contact, pressed && { opacity: 0.7 }]}>
      {icon}
      <Text style={styles.contactText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { padding: 16 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 12, gap: 12 },
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, padding: 14 },
  bannerKind: { fontSize: 15, fontWeight: '800' },
  card: { padding: 14 },
  label: { fontSize: 11, fontWeight: '700', color: C.faint, textTransform: 'uppercase', letterSpacing: 0.6 },
  party: { fontSize: 20, fontWeight: '800', color: C.textStrong, marginTop: 4 },
  address: { fontSize: 14, color: '#4B5563', marginTop: 4, lineHeight: 20 },
  phone: { fontSize: 14, fontWeight: '600', color: C.text, marginTop: 4 },
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  contact: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: 12, backgroundColor: C.redTint },
  contactText: { fontSize: 12, fontWeight: '700', color: C.red },
  codCard: { borderColor: '#FECACA', backgroundColor: '#FFF7F7', alignItems: 'center' },
  prepaidCard: { borderColor: '#BBF7D0', backgroundColor: '#F7FEF9' },
  codAmount: { fontSize: 30, fontWeight: '800', color: C.red, marginTop: 4 },
  notes: { gap: 8 },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noteText: { flex: 1, fontSize: 13, fontWeight: '600', color: C.text },
  historyToggle: { paddingVertical: 10 },
  link: { fontSize: 13, fontWeight: '700', color: C.red },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F3',
  },
  row: { flexDirection: 'row', gap: 10 },
  otpBlock: { gap: 8 },
  otpLabel: { fontSize: 12, fontWeight: '600', color: C.muted },
  otpInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 16,
    textAlign: 'center',
    paddingVertical: 10,
    color: C.textStrong,
    outlineWidth: 0,
  },
  otpOk: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  otpBad: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  otpHint: { fontSize: 12, color: C.muted, textAlign: 'center' },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  reasonActive: { borderColor: C.red, backgroundColor: C.redTint },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#9CA3AF' },
  radioActive: { borderColor: C.red, borderWidth: 6 },
  reasonText: { flex: 1, fontSize: 14, color: C.text },
  reasonTextActive: { fontWeight: '700', color: C.red },
  dateBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F4C8D2' },
  dateText: { flex: 1, fontSize: 14, fontWeight: '600', color: C.text },
});
