import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Signal } from '../types';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';

interface SignalCardProps {
  signal: Signal;
  onPress?: () => void;
}

const botColors: Record<string, string[]> = {
  SCALPER: ['#00D4AA', '#00B894'],
  TREND: ['#7B61FF', '#6B51EF'],
  QFL: ['#FF6B9D', '#FF5B8D'],
  AI_ML: ['#FFD700', '#FFC700'],
};

const botIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  SCALPER: 'flash',
  TREND: 'trending-up',
  QFL: 'analytics',
  AI_ML: 'hardware-chip',
};

export function SignalCard({ signal, onPress }: SignalCardProps) {
  const isLong = signal.side === 'LONG';
  const gradientColors = botColors[signal.source] || botColors.SCALPER;
  const botIcon = botIcons[signal.source] || 'flash';

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.container}>
        {/* Header with gradient accent */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Ionicons name={botIcon} size={18} color="#FFF" />
            <Text style={styles.botName}>{signal.source}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{signal.confidence}%</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Body */}
        <View style={styles.body}>
          {/* Symbol and Direction */}
          <View style={styles.symbolRow}>
            <Text style={styles.symbol}>{signal.symbol}</Text>
            <View style={[styles.directionBadge, isLong ? styles.longBadge : styles.shortBadge]}>
              <Ionicons
                name={isLong ? 'arrow-up' : 'arrow-down'}
                size={14}
                color="#FFF"
              />
              <Text style={styles.directionText}>{signal.side}</Text>
            </View>
          </View>

          {/* Price Info */}
          <View style={styles.priceGrid}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Entry</Text>
              <Text style={styles.priceValue}>{formatPrice(signal.entry)}</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Stop Loss</Text>
              <Text style={[styles.priceValue, styles.slValue]}>
                {formatPrice(signal.stop_loss)}
              </Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Take Profits</Text>
              <Text style={[styles.priceValue, styles.tpValue]}>
                {signal.take_profits.length} targets
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.timeframeBadge}>
              <Text style={styles.timeframeText}>{signal.timeframe}</Text>
            </View>
            <Text style={styles.timeText}>{formatTime(signal.created_at)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  botName: {
    color: '#FFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  confidenceText: {
    color: '#FFF',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  body: {
    padding: spacing.md,
  },
  symbolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  symbol: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  longBadge: {
    backgroundColor: colors.trading.long,
  },
  shortBadge: {
    backgroundColor: colors.trading.short,
  },
  directionText: {
    color: '#FFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  priceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    color: colors.text.muted,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  priceValue: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  slValue: {
    color: colors.trading.loss,
  },
  tpValue: {
    color: colors.trading.profit,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeframeBadge: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  timeframeText: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  timeText: {
    color: colors.text.muted,
    fontSize: fontSize.xs,
  },
});


