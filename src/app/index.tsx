import { type Href, Redirect } from 'expo-router';

import type { UserRole } from '@/constants/user-roles';
import { useAppState } from '@/state/app-state';

/** Where each role starts after signing in. */
const HOME: Record<UserRole, Href> = {
  customer: '/track',
  vendor: '/vendor',
  rider: '/rider',
  admin: '/admin',
};

export default function Index() {
  const { user } = useAppState();
  return <Redirect href={user ? HOME[user.role] : '/login'} />;
}
