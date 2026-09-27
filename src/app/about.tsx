import { type ReactNode, useState } from 'react';
import { LayoutAnimation, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
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
import { ScreenHeader } from '@/components/ui';
import { Colors, shadow } from '@/constants/theme';
import { ABOUT_SECTIONS, SOCIAL_LINKS } from '@/data/content';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

const SOCIALS: { label: string; url: string; icon: ReactNode }[] = [
  { label: 'Website', url: SOCIAL_LINKS.website, icon: <GlobeIcon /> },
  { label: 'Facebook', url: SOCIAL_LINKS.facebook, icon: <FacebookIcon /> },
  { label: 'Instagram', url: SOCIAL_LINKS.instagram, icon: <InstagramIcon /> },
  { label: 'LinkedIn', url: SOCIAL_LINKS.linkedin, icon: <LinkedInIcon /> },
  { label: 'Twitter', url: SOCIAL_LINKS.twitter, icon: <TwitterIcon /> },
  { label: 'Email Us', url: SOCIAL_LINKS.email, icon: <MailIcon size={20} color="#FFFFFF" strokeWidth={2} /> },
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
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
              {expanded && <Text style={styles.cardBody}>{s.body}</Text>}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.socialWrap, { paddingBottom: insets.bottom }]}>
        <View style={styles.socialBar}>
          {SOCIALS.map((s) => (
            <Pressable
              key={s.label}
              accessibilityRole="link"
              accessibilityLabel={s.label}
              onPress={() => Linking.openURL(s.url)}
              style={({ pressed }) => [styles.socialBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
              {s.icon}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E9E9EB' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 17,
    boxShadow: shadow(1, 6, 0.06),
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.black, lineHeight: 21, paddingRight: 8 },
  cardBody: { marginTop: 10, fontSize: 14, lineHeight: 21, color: '#4B5563' },
  socialWrap: { paddingHorizontal: 8, backgroundColor: '#E9E9EB' },
  socialBar: {
    backgroundColor: '#D8D8DC',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow(1, 4, 0.15),
  },
});
