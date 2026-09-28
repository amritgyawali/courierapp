import { View } from 'react-native';

import { UsersIcon } from '@/components/portal/icons';
import { EmptyState, PortalHeader } from '@/components/portal/ui';
import { makeStyles, useColors } from '@/theme';

const INFO = {
  title: 'Customers',
  body: 'People you ship to most often will be saved here so you can book repeat orders faster.',
};

export default function CustomersScreen() {
  const styles = useStyles();
  const C = useColors();
  return (
    <View style={styles.screen}>
      <PortalHeader title="Customers" info={INFO} />
      <EmptyState
        icon={<UsersIcon size={32} color={C.primary} />}
        title="No saved customers yet"
        message="Receivers from your orders will appear here once customer sync is enabled for your account."
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors: C }) => ({
  screen: { flex: 1, backgroundColor: C.screenBg },
}));
