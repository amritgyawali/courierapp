import { View } from 'react-native';

import { UserCircleIcon } from '@/components/portal/icons';
import { EmptyState, PortalHeader } from '@/components/portal/ui';
import { makeStyles, useColors } from '@/theme';

const INFO = {
  title: 'Manage Staffs',
  body: 'Give your shop staff their own logins so they can book and track orders for your business.',
};

export default function StaffsScreen() {
  const styles = useStyles();
  const C = useColors();
  return (
    <View style={styles.screen}>
      <PortalHeader title="Manage Staffs" info={INFO} />
      <EmptyState
        icon={<UserCircleIcon size={32} color={C.primary} />}
        title="No staff accounts"
        message="Staff members you add to your vendor account will be listed here."
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
}));
