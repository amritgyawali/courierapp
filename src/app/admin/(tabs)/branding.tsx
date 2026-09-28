import { Image } from 'expo-image';
import { type ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, type TextStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAdmin } from '@/components/admin/use-admin';
import { LogoMark } from '@/components/brand';
import {
  BrushIcon,
  CheckIcon,
  ImageIcon,
  LinkIcon,
  PaletteIcon,
  RefreshIcon,
  TrashIcon,
  TypeIcon,
  UploadIcon,
} from '@/components/portal/icons';
import { Card, Chip, PortalHeader, SectionHeading } from '@/components/portal/ui';
import { Button, Sheet, TextField, useToast } from '@/components/portal/widgets';
import { Text } from '@/components/text';
import type { SupportContacts } from '@/data/content';
import { BRANDING_LIMITS, type BrandingSettings, useBranding } from '@/state/branding-state';
import {
  buildPalette,
  FONT_FAMILIES,
  FONT_FAMILY_IDS,
  type FontFamilyId,
  fontFace,
  loadFontFamily,
  makeStyles,
  normalizeHex,
  TEXT_SCALES,
  type TextScaleId,
  THEME_PRESETS,
  useColors,
} from '@/theme';
import { type BrandImageKind, pickBrandImage } from '@/utils/brand-image';

const INFO = {
  title: 'Branding & Appearance',
  body: 'White-label the whole app: name, logo, app icon, brand colour, font, text size and the contact details customers see. Preview your changes at the top, then tap Save — every screen (customer, vendor, rider and admin) updates instantly. Settings are stored on this device until the backend shares them with every user.',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s/.]+\.[^\s]+$/i;
const PHONE_RE = /^\+?[\d\s()-]{6,20}$/;

const EMAIL_FIELDS = ['salesEmail', 'supportEmail'] as const;
const LINK_FIELDS = ['website', 'facebook', 'instagram', 'linkedin', 'twitter'] as const;

const LINK_LABELS: Record<(typeof LINK_FIELDS)[number], string> = {
  website: 'Website',
  facebook: 'Facebook page',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  twitter: 'X / Twitter',
};

type FieldErrors = Partial<Record<'appName' | 'shortName' | keyof SupportContacts, string>>;

function validate(d: BrandingSettings): FieldErrors {
  const errors: FieldErrors = {};
  if (!d.appName.trim()) errors.appName = 'Enter the app name.';
  if (!d.shortName.trim()) errors.shortName = 'Enter a short name, e.g. KSG.';
  const phone = d.support.phone.trim();
  if (phone && !PHONE_RE.test(phone)) errors.phone = 'Use digits, spaces and an optional +.';
  for (const key of EMAIL_FIELDS) {
    const v = d.support[key].trim();
    if (v && !EMAIL_RE.test(v)) errors[key] = 'Enter a valid email address.';
  }
  for (const key of LINK_FIELDS) {
    const v = d.support[key].trim();
    if (v && !URL_RE.test(v)) errors[key] = 'Enter a full link starting with https://';
  }
  return errors;
}

/** Trimmed copy for saving. */
function clean(d: BrandingSettings): BrandingSettings {
  const support = Object.fromEntries(Object.entries(d.support).map(([k, v]) => [k, v.trim()])) as SupportContacts;
  return { ...d, appName: d.appName.trim(), shortName: d.shortName.trim(), tagline: d.tagline.trim(), support };
}

/** Everything except the save timestamp, for change detection. */
const fingerprint = (d: BrandingSettings) => JSON.stringify({ ...clean(d), updatedAt: null });

const PLATFORM_FONT = Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui, sans-serif' });

export default function BrandingScreen() {
  const styles = useStyles();
  const C = useColors();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { dispatch, actor } = useAdmin();
  const { settings, update, reset } = useBranding();

  const [draft, setDraft] = useState(settings);
  const [hex, setHex] = useState(settings.primaryColor);
  const [picking, setPicking] = useState<BrandImageKind | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<ReadonlySet<FontFamilyId>>(() => new Set(['system']));

  // Saved settings changed (save, reset): start editing from them.
  const [seen, setSeen] = useState(settings);
  if (settings !== seen) {
    setSeen(settings);
    setDraft(settings);
    setHex(settings.primaryColor);
  }

  // Load every font so the choices below render in their own typeface.
  useEffect(() => {
    let alive = true;
    for (const id of FONT_FAMILY_IDS) {
      loadFontFamily(id)
        .then(() => {
          if (alive) setLoadedFonts((prev) => new Set(prev).add(id));
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, []);

  const errors = validate(draft);
  const hexError = normalizeHex(hex) ? undefined : 'Use a hex colour like #0F766E.';
  const invalid = Object.keys(errors).length > 0 || !!hexError;
  const dirty = fingerprint(draft) !== fingerprint(settings);
  const effective = buildPalette(draft.primaryColor).primary;
  const adjusted = effective !== normalizeHex(draft.primaryColor);

  const set = <K extends keyof BrandingSettings>(key: K, value: BrandingSettings[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setSupport = (key: keyof SupportContacts, value: string) =>
    setDraft((d) => ({ ...d, support: { ...d.support, [key]: value } }));

  const chooseColor = (value: string) => {
    setHex(value);
    const color = normalizeHex(value);
    if (color) set('primaryColor', color);
  };

  /** Font style for a sample in a given family (falls back until the family has loaded). */
  const sample = (family: FontFamilyId, weight: TextStyle['fontWeight']): TextStyle => {
    if (family === 'system') return { fontFamily: PLATFORM_FONT, fontWeight: weight };
    return loadedFonts.has(family) ? { fontFamily: fontFace(family, weight), fontWeight: 'normal' } : { fontWeight: weight };
  };

  const pick = async (kind: BrandImageKind) => {
    // The web picker never reports "cancelled", so only show the spinner on phones.
    if (Platform.OS !== 'web') setPicking(kind);
    try {
      const uri = await pickBrandImage(kind);
      if (uri) set(kind === 'logo' ? 'logoUri' : 'iconUri', uri);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not open that image.', 'error');
    } finally {
      setPicking(null);
    }
  };

  const save = () => {
    if (invalid) return toast('Fix the highlighted fields first.', 'error');
    update(clean(draft));
    dispatch({ type: 'audit', action: 'Updated branding', target: draft.appName.trim(), actor });
    toast('Branding saved — the whole app now uses it');
  };

  const discard = () => {
    setDraft(settings);
    setHex(settings.primaryColor);
  };

  return (
    <View style={styles.screen}>
      <PortalHeader title="Branding" info={INFO} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: (dirty ? 110 : 40) + insets.bottom }]}
          keyboardShouldPersistTaps="handled">
          <Preview draft={draft} sample={sample} />

          {/* Identity */}
          <SectionHeading icon={<BrushIcon size={20} color={C.primary} />} title="Name & tagline" />
          <Card style={styles.card}>
            <TextField
              label="App name"
              value={draft.appName}
              onChangeText={(v) => set('appName', v)}
              maxLength={BRANDING_LIMITS.appName}
              autoCapitalize="words"
              error={errors.appName}
              hint="Shown on the login screen, headers, menus and messages."
            />
            <TextField
              label="Short name"
              value={draft.shortName}
              onChangeText={(v) => set('shortName', v)}
              maxLength={BRANDING_LIMITS.shortName}
              autoCapitalize="characters"
              error={errors.shortName}
              hint="Used where space is tight, e.g. “My KSG account”, exports and SMS."
            />
            <TextField
              label="Tagline"
              value={draft.tagline}
              onChangeText={(v) => set('tagline', v)}
              maxLength={BRANDING_LIMITS.tagline}
              placeholder="Optional"
              hint="Shown under the logo on Login and Register."
            />
          </Card>

          {/* Logos */}
          <SectionHeading icon={<ImageIcon size={20} color={C.primary} />} title="Logo & app icon" />
          <Card style={styles.card}>
            <ImageSlot
              title="Brand logo"
              hint="Wide logo for white backgrounds: Login, Register and customer headers. A PNG with a transparent background looks best."
              uri={draft.logoUri}
              wide
              busy={picking === 'logo'}
              onPick={() => pick('logo')}
              onRemove={() => set('logoUri', null)}
            />
            <View style={styles.divider} />
            <ImageSlot
              title="App icon"
              hint="Square icon for coloured headers, the menu and small spaces. Crop it to a square when asked."
              uri={draft.iconUri}
              busy={picking === 'icon'}
              onPick={() => pick('icon')}
              onRemove={() => set('iconUri', null)}
            />
            <Text style={styles.note}>
              The icon and name under the app on a phone’s home screen are fixed when the app is built (app.json → name, icon).
              Everything inside the app uses the settings here.
            </Text>
          </Card>

          {/* Colour */}
          <SectionHeading icon={<PaletteIcon size={20} color={C.primary} />} title="Theme colour" />
          <Card style={styles.card}>
            <View style={styles.swatches}>
              {THEME_PRESETS.map((preset) => {
                const selected = normalizeHex(draft.primaryColor) === preset.color;
                return (
                  <Pressable
                    key={preset.id}
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${preset.name} theme`}
                    onPress={() => chooseColor(preset.color)}
                    style={({ pressed }) => [styles.swatch, pressed && styles.pressed]}>
                    <View style={[styles.swatchRing, selected && { borderColor: preset.color }]}>
                      <View style={[styles.swatchDot, { backgroundColor: preset.color }]}>
                        {selected && <CheckIcon size={16} color="#FFFFFF" sw={3} />}
                      </View>
                    </View>
                    <Text style={[styles.swatchLabel, selected && styles.swatchLabelActive]}>{preset.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.hexRow}>
              <View style={[styles.hexPreview, { backgroundColor: normalizeHex(hex) ?? draft.primaryColor }]} />
              <View style={styles.flex}>
                <TextField
                  label="Custom colour (hex)"
                  value={hex}
                  onChangeText={chooseColor}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={7}
                  placeholder="#0F766E"
                  error={hexError}
                />
              </View>
            </View>
            {adjusted && !hexError && (
              <Text style={styles.note}>
                This colour is too light for white text, so the app uses the darker {effective} instead.
              </Text>
            )}
          </Card>

          {/* Typography */}
          <SectionHeading icon={<TypeIcon size={20} color={C.primary} />} title="Font & text size" />
          <Card style={styles.card}>
            {FONT_FAMILY_IDS.map((id) => {
              const selected = draft.fontFamily === id;
              const family = FONT_FAMILIES[id];
              return (
                <Pressable
                  key={id}
                  role="radio"
                  aria-checked={selected}
                  aria-label={family.label}
                  onPress={() => set('fontFamily', id)}
                  style={({ pressed }) => [styles.fontRow, selected && styles.fontRowActive, pressed && styles.pressed]}>
                  <Text style={[styles.fontSample, sample(id, '700'), selected && { color: C.primary }]}>Aa</Text>
                  <View style={styles.flex}>
                    <Text style={[styles.fontName, sample(id, '700')]}>{family.label}</Text>
                    <Text style={[styles.fontDesc, sample(id, '400')]}>{family.description}</Text>
                  </View>
                  {!loadedFonts.has(id) ? (
                    <ActivityIndicator size="small" color={C.faint} />
                  ) : (
                    <View style={[styles.radio, selected && styles.radioActive]} />
                  )}
                </Pressable>
              );
            })}
            <Text style={styles.fieldLabel}>Text size</Text>
            <View style={styles.row} role="radiogroup">
              {(Object.keys(TEXT_SCALES) as TextScaleId[]).map((id) => (
                <Chip
                  key={id}
                  variant="tint"
                  fill
                  label={TEXT_SCALES[id].label}
                  active={draft.textScale === id}
                  onPress={() => set('textScale', id)}
                />
              ))}
            </View>
          </Card>

          {/* Contacts */}
          <SectionHeading icon={<LinkIcon size={20} color={C.primary} />} title="Contact & social links" />
          <Card style={styles.card}>
            <Text style={styles.note}>Shown on Contact Us and About Us. Leave a link empty to hide its button.</Text>
            <TextField
              label="Phone"
              value={draft.support.phone}
              onChangeText={(v) => setSupport('phone', v)}
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <TextField
              label="Sales email"
              value={draft.support.salesEmail}
              onChangeText={(v) => setSupport('salesEmail', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.salesEmail}
            />
            <TextField
              label="Support email"
              value={draft.support.supportEmail}
              onChangeText={(v) => setSupport('supportEmail', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.supportEmail}
            />
            <TextField
              label="Head office address"
              value={draft.support.address}
              onChangeText={(v) => setSupport('address', v)}
              multiline
            />
            {LINK_FIELDS.map((key) => (
              <TextField
                key={key}
                label={LINK_LABELS[key]}
                value={draft.support[key]}
                onChangeText={(v) => setSupport(key, v)}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="https://"
                error={errors[key]}
              />
            ))}
          </Card>

          <Button
            title="Reset everything to defaults"
            variant="danger"
            icon={(c) => <RefreshIcon size={17} color={c} />}
            onPress={() => setResetOpen(true)}
          />
          {settings.updatedAt && (
            <Text style={styles.updated}>Last saved {new Date(settings.updatedAt).toLocaleString()}</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {dirty && (
        <View style={[styles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
          <Button title="Discard" variant="ghost" onPress={discard} style={styles.flex} />
          <Button title="Save changes" disabled={invalid} onPress={save} style={styles.flex2} />
        </View>
      )}

      <Sheet
        visible={resetOpen}
        title="Reset branding?"
        subtitle="Name, logos, colour, font, text size and contact details go back to the defaults."
        onClose={() => setResetOpen(false)}
        footer={
          <>
            <Button
              title="Reset to defaults"
              variant="danger"
              onPress={() => {
                reset();
                dispatch({ type: 'audit', action: 'Reset branding to defaults', target: 'Branding', actor });
                setResetOpen(false);
                toast('Branding reset to defaults', 'info');
              }}
            />
            <Button title="Cancel" variant="ghost" onPress={() => setResetOpen(false)} />
          </>
        }>
        <Text style={styles.note}>Uploaded logos are removed from this device.</Text>
      </Sheet>
    </View>
  );
}

/** Mini mock of a header and a card, drawn with the draft (unsaved) settings. */
function Preview({
  draft,
  sample,
}: {
  draft: BrandingSettings;
  sample: (family: FontFamilyId, weight: TextStyle['fontWeight']) => TextStyle;
}) {
  const styles = useStyles();
  const P = buildPalette(draft.primaryColor);
  const font = (weight: TextStyle['fontWeight']) => sample(draft.fontFamily, weight);
  return (
    <View style={styles.preview} accessible accessibilityLabel="Preview of your branding">
      <View style={[styles.previewBar, { backgroundColor: P.primary }]}>
        <View style={styles.previewIcon}>
          {draft.iconUri ? (
            <Image source={{ uri: draft.iconUri }} style={styles.previewIconImage} contentFit="cover" />
          ) : (
            <LogoMark size={18} color={P.primary} />
          )}
        </View>
        <Text style={[styles.previewName, font('800')]} numberOfLines={1}>
          {draft.appName.trim() || 'App name'}
        </Text>
      </View>
      <View style={styles.previewBody}>
        {draft.logoUri ? (
          <Image source={{ uri: draft.logoUri }} style={styles.previewLogo} contentFit="contain" />
        ) : (
          <View style={styles.previewWordmark}>
            <LogoMark size={22} color={P.primary} />
            <Text style={[styles.previewWordmarkText, { color: P.primary }, font('800')]} numberOfLines={1}>
              {draft.appName.trim() || 'App name'}
            </Text>
          </View>
        )}
        {!!draft.tagline.trim() && <Text style={[styles.previewText, font('400')]}>{draft.tagline.trim()}</Text>}
        <View style={styles.previewRow}>
          <View style={[styles.previewButton, { backgroundColor: P.primary }]}>
            <Text style={[styles.previewButtonText, font('700')]}>Sign In</Text>
          </View>
          <View style={[styles.previewChip, { backgroundColor: P.primaryTint, borderColor: P.primarySoft }]}>
            <Text style={[styles.previewChipText, { color: P.primary }, font('600')]}>Orders</Text>
          </View>
          <View style={[styles.previewBadge, { backgroundColor: P.primarySoft }]}>
            <Text style={[styles.previewBadgeText, { color: P.primaryStrong }, font('700')]}>12</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ImageSlot({
  title,
  hint,
  uri,
  wide,
  busy,
  onPick,
  onRemove,
}: {
  title: string;
  hint: string;
  uri: string | null;
  wide?: boolean;
  busy: boolean;
  onPick: () => void;
  onRemove: () => void;
}) {
  const styles = useStyles();
  const C = useColors();
  let preview: ReactNode;
  if (busy) preview = <ActivityIndicator color={C.primary} />;
  else if (uri) preview = <Image source={{ uri }} style={wide ? styles.slotImageWide : styles.slotImage} contentFit="contain" />;
  else preview = <ImageIcon size={26} color={C.faint} />;

  return (
    <View style={styles.slot}>
      <View style={[styles.slotPreview, wide && styles.slotPreviewWide]}>{preview}</View>
      <View style={styles.flex}>
        <Text style={styles.slotTitle}>{title}</Text>
        <Text style={styles.slotHint}>{hint}</Text>
        <View style={styles.slotActions}>
          <Button
            compact
            variant="soft"
            title={uri ? 'Replace' : 'Upload'}
            icon={(c) => <UploadIcon size={15} color={c} />}
            onPress={onPick}
            disabled={busy}
          />
          {uri && (
            <Button compact variant="ghost" title="Remove" icon={(c) => <TrashIcon size={15} color={c} />} onPress={onRemove} />
          )}
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  flex: { flex: 1 },
  flex2: { flex: 2 },
  pressed: { opacity: 0.75 },
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 12, gap: 12 },
  card: { padding: 14, gap: 12 },
  row: { flexDirection: 'row', gap: 8 },
  divider: { height: 1, backgroundColor: C.divider },
  note: { fontSize: 12, lineHeight: 18, color: C.muted },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.muted, marginTop: 4 },
  updated: { fontSize: 12, color: C.faint, textAlign: 'center' },

  preview: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  previewBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  previewIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewIconImage: { width: 30, height: 30 },
  previewName: { flex: 1, color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  previewBody: { padding: 16, gap: 10, alignItems: 'center' },
  previewLogo: { width: '70%', height: 44 },
  previewWordmark: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '100%' },
  previewWordmarkText: { flexShrink: 1, fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  previewText: { fontSize: 12, color: C.muted, textAlign: 'center' },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  previewButton: { borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9 },
  previewButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  previewChip: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  previewChipText: { fontSize: 12, fontWeight: '600' },
  previewBadge: { minWidth: 30, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  previewBadgeText: { fontSize: 12, fontWeight: '700' },

  slot: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  slotPreview: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.borderStrong,
    backgroundColor: C.screenBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slotPreviewWide: { width: 110 },
  slotImage: { width: 72, height: 72 },
  slotImageWide: { width: 104, height: 60 },
  slotTitle: { fontSize: 14, fontWeight: '700', color: C.textStrong },
  slotHint: { fontSize: 12, lineHeight: 17, color: C.muted, marginTop: 2 },
  slotActions: { flexDirection: 'row', gap: 8, marginTop: 10 },

  swatches: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  swatch: { width: '25%', alignItems: 'center', gap: 5 },
  swatchRing: { padding: 3, borderRadius: 999, borderWidth: 2, borderColor: 'transparent' },
  swatchDot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  swatchLabel: { fontSize: 11, fontWeight: '600', color: C.muted },
  swatchLabelActive: { color: C.textStrong, fontWeight: '800' },
  hexRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  hexPreview: { width: 44, height: 44, borderRadius: 12, marginTop: 22, borderWidth: 1, borderColor: C.border },

  fontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  fontRowActive: { borderColor: C.primary, backgroundColor: C.primaryTint },
  fontSample: { width: 42, fontSize: 24, fontWeight: '700', color: C.textStrong, textAlign: 'center' },
  fontName: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  fontDesc: { fontSize: 12, color: C.muted, marginTop: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.faint },
  radioActive: { borderColor: C.primary, borderWidth: 6 },

  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
  },
}));
