import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon, ScanIcon } from '@/components/portal/icons';
import { PortalColors as C } from '@/constants/theme';

/**
 * Full-screen barcode / QR scanner with a manual entry fallback (no camera, permission denied,
 * damaged label). Calls `onScan` once per opening with the trimmed, upper-cased code.
 */
export function ScannerModal({
  visible,
  onClose,
  onScan,
  title = 'Scan parcel',
  hint = 'Point the camera at the barcode or QR code on the parcel label.',
}: {
  visible: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
  hint?: string;
}) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState('');
  const handled = useRef(false);

  const finish = (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code || handled.current) return;
    handled.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setManual('');
    onScan(code);
  };

  const close = () => {
    setManual('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onShow={() => {
        handled.current = false;
      }}
      onRequestClose={close}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.title}>{title}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close scanner" hitSlop={10} onPress={close} style={styles.close}>
            <CloseIcon size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.cameraArea}>
          {permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8', 'upc_a', 'datamatrix'] }}
              onBarcodeScanned={visible ? (r) => finish(r.data) : undefined}
            />
          ) : (
            <View style={styles.permission}>
              <ScanIcon size={48} color="#FFFFFF" />
              <Text style={styles.permissionText}>
                {permission?.canAskAgain === false
                  ? 'Camera access is off. Enable it in Settings, or type the tracking number below.'
                  : 'Allow camera access to scan parcel labels.'}
              </Text>
              {permission?.canAskAgain !== false && (
                <Pressable accessibilityRole="button" onPress={requestPermission} style={styles.permissionButton}>
                  <Text style={styles.permissionButtonText}>Allow camera</Text>
                </Pressable>
              )}
            </View>
          )}
          <View style={styles.frame} />
        </View>

        <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.hint}>{hint}</Text>
          <View style={styles.manualRow}>
            <TextInput
              value={manual}
              onChangeText={setManual}
              placeholder="Or type tracking number (KSG…)"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => finish(manual)}
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Find parcel"
              disabled={!manual.trim()}
              onPress={() => finish(manual)}
              style={[styles.go, !manual.trim() && { opacity: 0.5 }]}>
              <Text style={styles.goText}>Find</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0B0F' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  cameraArea: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  frame: {
    width: '72%',
    aspectRatio: 1.4,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    pointerEvents: 'none',
  },
  permission: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 32,
  },
  permissionText: { color: '#E5E7EB', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  permissionButton: { backgroundColor: C.red, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11 },
  permissionButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  bottom: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, gap: 12 },
  hint: { fontSize: 13, color: C.muted, textAlign: 'center' },
  manualRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: C.text,
    minHeight: 48,
    outlineWidth: 0,
  },
  go: { backgroundColor: C.red, borderRadius: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  goText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
