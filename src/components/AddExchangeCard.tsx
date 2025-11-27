import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExchangeName } from '../types';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';

interface AddExchangeCardProps {
  exchange: ExchangeName;
  onPress: () => void;
}

const EXCHANGE_INFO: Record<ExchangeName, { name: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  binance: { name: 'Binance', color: colors.exchanges.binance, icon: 'logo-bitcoin' },
  bybit: { name: 'Bybit', color: colors.exchanges.bybit, icon: 'bar-chart' },
  okx: { name: 'OKX', color: colors.exchanges.okx, icon: 'swap-horizontal' },
  phemex: { name: 'Phemex', color: colors.exchanges.phemex, icon: 'rocket' },
};

export function AddExchangeCard({ exchange, onPress }: AddExchangeCardProps) {
  const info = EXCHANGE_INFO[exchange];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: info.color + '20' }]}>
        <Ionicons name={info.icon} size={24} color={info.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{info.name}</Text>
        <Text style={styles.subtitle}>Tap to connect</Text>
      </View>
      <Ionicons name="add-circle" size={28} color={colors.accent.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
});

