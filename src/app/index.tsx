import { Redirect } from 'expo-router';

import { useAppState } from '@/state/app-state';

export default function Index() {
  const { user } = useAppState();
  if (!user) return <Redirect href="/login" />;
  return <Redirect href={user.role === 'vendor' ? '/vendor' : '/track'} />;
}
