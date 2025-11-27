import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exchange, ExchangeName } from '../types';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';

interface ExchangeCardProps {
  exchange: Exchange;
  balance?: { total: number; available: number };
  onPress?: () => void;
  onDelete?: () => void;
}

const exchangeLogos: Record<ExchangeName, { name: string; color: string }> = {
  binance: { name: 'Binance', color: '#F0B90B' },
  bybit: { name: 'Bybit', color: '#F7A600' },
  okx: { name: 'OKX', color: '#FFFFFF' },
  phemex: { name: 'Phemex', color: '#D4FF00' },
};

export function ExchangeCard({ exchange, balance, onPress, onDelete }: ExchangeCardProps) {
  const exchangeInfo = exchangeLogos[exchange.exchange] || { name: exchange.exchange, color: '#FFF' };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.exchangeInfo}>
          <View style={[styles.logoCircle, { backgroundColor: exchangeInfo.color + '20' }]}>
            <Text style={[styles.logoText, { color: exchangeInfo.color }]}>
              {exchangeInfo.name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.exchangeName}>{exchangeInfo.name}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, exchange.is_active ? styles.activeDot : styles.inactiveDot]} />
              <Text style={styles.statusText}>
                {exchange.is_active ? 'Connected' : 'Disconnected'}
              </Text>
              {exchange.testnet && (
                <View style={styles.testnetBadge}>
                  <Text style={styles.testnetText}>Testnet</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color={colors.status.error} />
          </TouchableOpacity>
        )}
      </View>

      {balance && (
        <View style={styles.balanceSection}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceValue}>
              ${balance.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Available</Text>
            <Text style={[styles.balanceValue, styles.availableValue]}>
              ${balance.available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      </View>
    </TouchableOpacity>
  );
}

// Simplified version for adding new exchange
export function AddExchangeCard({ exchange, onPress }: { exchange: ExchangeName; onPress: () => void }) {
  const exchangeInfo = exchangeLogos[exchange];

  return (
    <TouchableOpacity style={styles.addContainer} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.logoCircle, { backgroundColor: exchangeInfo.color + '20' }]}>
        <Text style={[styles.logoText, { color: exchangeInfo.color }]}>
          {exchangeInfo.name.charAt(0)}
        </Text>
      </View>
      <Text style={styles.addExchangeName}>{exchangeInfo.name}</Text>
      <Ionicons name="add-circle" size={24} color={colors.accent.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exchangeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  exchangeName: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: colors.status.success,
  },
  inactiveDot: {
    backgroundColor: colors.status.error,
  },
  statusText: {
    color: colors.text.muted,
    fontSize: fontSize.sm,
  },
  testnetBadge: {
    backgroundColor: colors.status.warning + '30',
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  testnetText: {
    color: colors.status.warning,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  balanceItem: {},
  balanceLabel: {
    color: colors.text.muted,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  balanceValue: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  availableValue: {
    color: colors.trading.profit,
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },
  // Add Exchange Card
  addContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  addExchangeName: {
    flex: 1,
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});


