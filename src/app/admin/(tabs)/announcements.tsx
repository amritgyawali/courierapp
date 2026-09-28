import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useAdmin } from '@/components/admin/use-admin';
import { MegaphoneOutlineIcon } from '@/components/portal/icons';
import { Badge, Card, Chip, PortalHeader, SectionHeading } from '@/components/portal/ui';
import { Button, TextField, useNow, useToast } from '@/components/portal/widgets';
import { Text } from '@/components/text';
import type { Audience } from '@/data/ops';
import { makeStyles, useColors } from '@/theme';
import { timeAgo } from '@/utils/format';

const AUDIENCE: Record<Audience, { label: string; bg: string; color: string }> = {
  all: { label: 'Everyone', bg: '#EEF2FF', color: '#4F46E5' },
  riders: { label: 'Riders', bg: '#E9F2FE', color: '#2B6CB0' },
  merchants: { label: 'Merchants', bg: '#FEF3C7', color: '#B45309' },
};

const INFO = {
  title: 'Announcements',
  body: 'Broadcast a notice to riders, merchants or everyone. Riders see announcements on their home screen and in their Announcements feed.',
};

export default function AnnouncementsScreen() {
  const styles = useStyles();
  const C = useColors();
  const { data, dispatch, actor } = useAdmin();
  const toast = useToast();
  const now = useNow();
  const [audience, setAudience] = useState<Audience>('riders');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const publish = () => {
    if (title.trim().length < 4) return setError('Give the announcement a short title.');
    if (body.trim().length < 10) return setError('Add a message of at least 10 characters.');
    setError('');
    dispatch({ type: 'announce', title: title.trim(), body: body.trim(), audience, actor });
    toast(`Sent to ${AUDIENCE[audience].label.toLowerCase()}`);
    setTitle('');
    setBody('');
  };

  return (
    <View style={styles.screen}>
      <PortalHeader title="Announcements" info={INFO} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>New announcement</Text>
          <View style={styles.chips}>
            {(Object.keys(AUDIENCE) as Audience[]).map((a) => (
              <Chip key={a} variant="tint" label={AUDIENCE[a].label} active={audience === a} onPress={() => setAudience(a)} />
            ))}
          </View>
          <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Hub closed on Saturday" maxLength={80} />
          <TextField
            label="Message"
            value={body}
            onChangeText={setBody}
            placeholder="What should they know?"
            multiline
            maxLength={500}
            error={error}
            hint={`${body.length}/500`}
          />
          <Button title="Publish" icon={(c) => <MegaphoneOutlineIcon size={18} color={c} />} onPress={publish} />
        </Card>

        <SectionHeading icon={<MegaphoneOutlineIcon size={20} color={C.primary} />} title="Sent" />
        {data.announcements.map((a) => (
          <Card key={a.id} style={styles.card}>
            <View style={styles.head}>
              <Badge label={AUDIENCE[a.audience].label.toUpperCase()} bg={AUDIENCE[a.audience].bg} color={AUDIENCE[a.audience].color} />
              <Text style={styles.meta}>
                {a.author} · {timeAgo(a.at, now)}
              </Text>
            </View>
            <Text style={styles.title}>{a.title}</Text>
            <Text style={styles.body}>{a.body}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  card: { padding: 14, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  chips: { flexDirection: 'row', gap: 8 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { fontSize: 12, color: C.muted },
  title: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  body: { fontSize: 13, color: '#4B5563', lineHeight: 19 },
}));
