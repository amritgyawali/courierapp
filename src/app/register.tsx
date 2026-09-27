import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthLayout, EMAIL_RE, FormError, OrDivider } from '@/components/auth-form';
import { LockIcon, MailIcon } from '@/components/icons';
import { Button, IconInput } from '@/components/ui';
import { DEFAULT_USER_ROLE } from '@/constants/user-roles';
import { useAppState } from '@/state/app-state';

export default function RegisterScreen() {
  const { signIn } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const onSignUp = () => {
    if (!EMAIL_RE.test(email.trim())) return setError('Please enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setError('');
    // Self-registration creates customer accounts; the auth guard then opens the Track tab.
    signIn({ email: email.trim().toLowerCase(), role: DEFAULT_USER_ROLE });
  };

  return (
    <AuthLayout title="Register" bold>
      <View style={styles.form}>
        <IconInput
          icon={<MailIcon strokeWidth={2} color="#111827" />}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <IconInput
          icon={<LockIcon />}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureToggle
          autoComplete="new-password"
        />
        <IconInput
          icon={<LockIcon />}
          placeholder="Confirm Password"
          value={confirm}
          onChangeText={setConfirm}
          secureToggle
          autoComplete="new-password"
          returnKeyType="go"
          onSubmitEditing={onSignUp}
        />
        <FormError message={error} />
        <Button title="Sign Up" onPress={onSignUp} style={{ marginTop: 16 }} />
      </View>
      <OrDivider />
      <Button
        title="Login"
        variant="soft"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
});
