import { type ReactNode, useState } from 'react';
import { LayoutAnimation, Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChevronDownIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  TwitterIcon,
} from '@/components/icons';
import { Text } from '@/components/text';
import { ScreenHeader } from '@/components/ui';
import { ABOUT_SECTIONS } from '@/data/content';
import { brandText, useBrand } from '@/state/branding-state';
import { makeStyles, shadow } from '@/theme';

export default function AboutScreen() {
  const styles = useStyles();
  const brand = useBrand();
  const insets = useSafeAreaInsets();
  const { support } = brand;

  // Links an admin cleared in Branding are hidden.
  const socials: { label: string; url: string; icon: ReactNode }[] = [
    { label: 'Website', url: support.website, icon: <GlobeIcon /> },
    { label: 'Facebook', url: support.facebook, icon: <FacebookIcon /> },
    { label: 'Instagram', url: support.instagram, icon: <InstagramIcon /> },
    { label: 'LinkedIn', url: support.linkedin, icon: <LinkedInIcon /> },
    { label: 'Twitter', url: support.twitter, icon: <TwitterIcon /> },
    {
      label: 'Email Us',
      url: support.supportEmail ? `mailto:${support.supportEmail}` : '',
      icon: <MailIcon size={20} color="#FFFFFF" strokeWidth={2} />,
    },
  ].filter((x) => x.url.trim());
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (title: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => (o === title ? null : title));
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="About Us" back compactLogo={false} />
      <ScrollView contentContainerStyle={styles.list}>
        {ABOUT_SECTIONS.map((s) => {
          const expanded = open === s.title;
          return (
            <Pressable
              key={s.title}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => toggle(s.title)}
              style={({ pressed }) => [styles.card, pressed && { backgroundColor: '#F9FAFB' }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <View style={expanded && { transform: [{ rotate: '180deg' }] }}>
                  <ChevronDownIcon />
                </View>
              </View>
              {expanded && <Text style={styles.cardBody}>{brandText(s.body, brand)}</Text>}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.socialWrap, { paddingBottom: insets.bottom }]}>
        <View style={styles.socialBar}>
          {socials.map((s) => (
            <Pressable
              key={s.label}
              accessibilityRole="link"
              accessibilityLabel={s.label}
              onPress={() => Linking.openURL(s.url).catch(() => {})}
              style={({ pressed }) => [styles.socialBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
              {s.icon}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 17,
    boxShadow: shadow(1, 6, 0.06),
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: C.textStrong, lineHeight: 21, paddingRight: 8 },
  cardBody: { marginTop: 10, fontSize: 14, lineHeight: 21, color: '#4B5563' },
  socialWrap: { paddingHorizontal: 8, backgroundColor: C.screenBg },
  socialBar: {
    backgroundColor: C.primarySoft,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow(1, 4, 0.15),
  },
}));
