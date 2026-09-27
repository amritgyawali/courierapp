import { StyleSheet, View } from 'react-native';

import { UserCircleIcon } from '@/components/vendor/icons';
import { EmptyState, VendorHeader } from '@/components/vendor/ui';
import { VendorColors as C } from '@/constants/theme';

const INFO = {
  title: 'Manage Staffs',
  body: 'Give your shop staff their own logins so they can book and track orders for your business.',
};

export default function StaffsScreen() {
  return (
    <View style={styles.screen}>
      <VendorHeader title="Manage Staffs" info={INFO} />
      <EmptyState
        icon={<UserCircleIcon size={32} color={C.red} />}
        title="No staff accounts"
        message="Staff members you add to your vendor account will be listed here."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.screenBg },
});
