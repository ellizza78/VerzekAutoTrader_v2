import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Button } from '../../components';
import { authService } from '../../services/auth';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';
import { AuthStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'EmailVerification'>;
  route: RouteProp<AuthStackParamList, 'EmailVerification'>;
};

export function EmailVerificationScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await authService.resendVerification(email);
      setSent(true);
    } catch (error) {
      // Handle error
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-unread" size={64} color={colors.accent.primary} />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification link to
        </Text>
        <Text style={styles.email}>{email}</Text>

        <Text style={styles.description}>
          Please check your inbox and click the verification link to activate your account.
        </Text>

        {sent && (
          <View style={styles.sentBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
            <Text style={styles.sentText}>Email sent!</Text>
          </View>
        )}

        <Button
          title="Resend Verification Email"
          onPress={handleResend}
          loading={loading}
          variant="outline"
          style={styles.resendButton}
        />

        <Button
          title="Back to Login"
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.muted,
  },
  email: {
    fontSize: fontSize.md,
    color: colors.accent.primary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  sentText: {
    color: colors.status.success,
    fontWeight: fontWeight.medium,
  },
  resendButton: {
    marginBottom: spacing.md,
    width: '100%',
  },
});

