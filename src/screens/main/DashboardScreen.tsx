import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Card, SignalCard } from '../../components';
import { signalsService } from '../../services/signals';
import { positionsService } from '../../services/positions';
import { Signal, Position } from '../../types';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';

export function DashboardScreen() {
  const { user } = useAuth();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [signalsRes, positionsRes] = await Promise.all([
        signalsService.getLiveSignals().catch(() => ({ signals: [] })),
        positionsService.getOpenPositions().catch(() => ({ positions: [] })),
      ]);
      setSignals(signalsRes.signals || []);
      setPositions(positionsRes.positions || []);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const totalPnL = positions.reduce((sum, p) => sum + (p.pnl_usdt || 0), 0);
  const openPositionsCount = positions.filter(p => p.status === 'OPEN').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.full_name || 'Trader'}</Text>
          </View>
          <View style={styles.subscriptionBadge}>
            <Ionicons name="diamond" size={14} color={colors.accent.gold} />
            <Text style={styles.subscriptionText}>{user?.subscription_type || 'TRIAL'}</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} variant="gradient" gradientColors={['#00D4AA20', '#00D4AA05']}>
            <Text style={styles.statLabel}>Open Positions</Text>
            <Text style={styles.statValue}>{openPositionsCount}</Text>
          </Card>
          <Card style={styles.statCard} variant="gradient" gradientColors={totalPnL >= 0 ? ['#00E67620', '#00E67605'] : ['#FF525220', '#FF525205']}>
            <Text style={styles.statLabel}>Total P&L</Text>
            <Text style={[styles.statValue, totalPnL >= 0 ? styles.profitText : styles.lossText]}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} USDT
            </Text>
          </Card>
        </View>

        {/* Auto Trading Status */}
        <Card style={styles.autoTradeCard}>
          <View style={styles.autoTradeRow}>
            <View style={styles.autoTradeInfo}>
              <Ionicons name="flash" size={24} color={user?.auto_trade_enabled ? colors.accent.primary : colors.text.muted} />
              <View>
                <Text style={styles.autoTradeTitle}>Auto Trading</Text>
                <Text style={styles.autoTradeStatus}>
                  {user?.auto_trade_enabled ? 'Active' : 'Disabled'}
                </Text>
              </View>
            </View>
            <View style={[styles.statusIndicator, user?.auto_trade_enabled ? styles.activeIndicator : styles.inactiveIndicator]} />
          </View>
        </Card>

        {/* Live Signals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Signals</Text>
            <Text style={styles.signalCount}>{signals.length} active</Text>
          </View>
          
          {signals.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="pulse" size={32} color={colors.text.muted} />
              <Text style={styles.emptyText}>No active signals</Text>
              <Text style={styles.emptySubtext}>New signals will appear here</Text>
            </Card>
          ) : (
            signals.slice(0, 3).map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))
          )}
        </View>

        {/* Open Positions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Open Positions</Text>
            <Text style={styles.signalCount}>{openPositionsCount} open</Text>
          </View>
          
          {positions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="layers" size={32} color={colors.text.muted} />
              <Text style={styles.emptyText}>No open positions</Text>
              <Text style={styles.emptySubtext}>Your trades will appear here</Text>
            </Card>
          ) : (
            positions.slice(0, 3).map((position) => (
              <Card key={position.id} style={styles.positionCard}>
                <View style={styles.positionHeader}>
                  <Text style={styles.positionSymbol}>{position.symbol}</Text>
                  <View style={[styles.sideBadge, position.side === 'LONG' ? styles.longBadge : styles.shortBadge]}>
                    <Text style={styles.sideText}>{position.side}</Text>
                  </View>
                </View>
                <View style={styles.positionDetails}>
                  <View>
                    <Text style={styles.detailLabel}>Entry</Text>
                    <Text style={styles.detailValue}>{position.entry_price}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>P&L</Text>
                    <Text style={[styles.detailValue, position.pnl_usdt >= 0 ? styles.profitText : styles.lossText]}>
                      {position.pnl_usdt >= 0 ? '+' : ''}{position.pnl_usdt.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.md,
    color: colors.text.muted,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.gold + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  subscriptionText: {
    color: colors.accent.gold,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  profitText: {
    color: colors.trading.profit,
  },
  lossText: {
    color: colors.trading.loss,
  },
  autoTradeCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  autoTradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoTradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  autoTradeTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  autoTradeStatus: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeIndicator: {
    backgroundColor: colors.status.success,
  },
  inactiveIndicator: {
    backgroundColor: colors.text.muted,
  },
  section: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  signalCount: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
  positionCard: {
    marginBottom: spacing.sm,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  positionSymbol: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  sideBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  longBadge: {
    backgroundColor: colors.trading.long,
  },
  shortBadge: {
    backgroundColor: colors.trading.short,
  },
  sideText: {
    color: '#FFF',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  bottomPadding: {
    height: 100,
  },
});

