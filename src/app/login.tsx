import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthLayout, EMAIL_RE, FormError, OrDivider, RoleSelector } from '@/components/auth-form';
import { LockIcon, MailIcon } from '@/components/icons';
import { Button, IconInput } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { DEFAULT_USER_ROLE, type UserRole } from '@/constants/user-roles';
import { useAppState } from '@/state/app-state';

export default function LoginScreen() {
  const { signIn } = useAppState();
  const [role, setRole] = useState<UserRole>(DEFAULT_USER_ROLE);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const onSignIn = () => {
    if (!EMAIL_RE.test(email.trim())) return setError('Please enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setError('');
    // The root stack's auth guard moves to the Track tab once the user is set.
    signIn({ email: email.trim().toLowerCase(), role });
  };

  return (
    <AuthLayout title="Login">
      <View style={styles.form}>
        <RoleSelector value={role} onChange={setRole} />
        <IconInput
          icon={<MailIcon />}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
        />
        <IconInput
          icon={<LockIcon />}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureToggle
          autoComplete="password"
          returnKeyType="go"
          onSubmitEditing={onSignIn}
        />
        <FormError message={error} />
        <View style={styles.forgotRow}>
          <Pressable
            hitSlop={8}
            onPress={() =>
              setInfo(
                EMAIL_RE.test(email.trim())
                  ? `Password reset instructions will be sent to ${email.trim()}.`
                  : 'Enter your email above to reset your password.',
              )
            }>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </Pressable>
        </View>
        {!!info && <Text style={styles.info}>{info}</Text>}
        <Button title="Sign In" onPress={onSignIn} style={{ marginTop: 4 }} />
      </View>
      <OrDivider />
      <Button title="Register" variant="gray" onPress={() => router.push('/register')} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  forgotRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 4 },
  forgot: { fontSize: 14, fontWeight: '600', color: Colors.link },
  info: { fontSize: 13, color: Colors.textMuted, marginTop: -8 },
});
