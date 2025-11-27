import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'gradient' | 'elevated';
  onPress?: () => void;
  gradientColors?: string[];
}

export function Card({
  children,
  style,
  variant = 'default',
  onPress,
  gradientColors,
}: CardProps) {
  const content = (
    <>
      {variant === 'gradient' ? (
        <LinearGradient
          colors={gradientColors || colors.gradients.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, styles.gradientCard, style]}
        >
          {children}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.card,
            variant === 'elevated' && styles.elevated,
            style,
          ]}
        >
          {children}
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  gradientCard: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  elevated: {
    backgroundColor: colors.background.elevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});


