import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import { positionsService } from '../../services/positions';
import { userService } from '../../services/user';
import { useAuth } from '../../context/AuthContext';
import { Position, Exchange } from '../../types';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';

type TabType = 'positions' | 'history';

export function TradingScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('positions');
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<Position[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [posRes, histRes, exRes] = await Promise.all([
        positionsService.getOpenPositions().catch(() => ({ positions: [] })),
        positionsService.getClosedPositions(50).catch(() => ({ positions: [] })),
        userService.getExchanges(user.id).catch(() => ({ exchanges: [] })),
      ]);
      
      setPositions(posRes.positions || []);
      setHistory(histRes.positions || []);
      setExchanges(exRes.exchanges || []);
    } catch (error) {
      console.error('Load trading data error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClosePosition = async (position: Position) => {
    Alert.alert(
      'Close Position',
      `Are you sure you want to close ${position.symbol} ${position.side}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: async () => {
            try {
              await positionsService.closePosition(position.id);
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to close position');
            }
          },
        },
      ]
    );
  };

  const totalPnL = positions.reduce((sum, p) => sum + (p.pnl_usdt || 0), 0);
  const winRate = history.length > 0
    ? ((history.filter(p => p.pnl_usdt > 0).length / history.length) * 100).toFixed(1)
    : '0';

  const renderPositionItem = ({ item }: { item: Position }) => (
    <Card style={styles.positionCard}>
      <View style={styles.positionHeader}>
        <View style={styles.symbolRow}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <View style={[styles.sideBadge, item.side === 'LONG' ? styles.longBadge : styles.shortBadge]}>
            <Text style={styles.sideText}>{item.side}</Text>
          </View>
        </View>
        <Text style={styles.leverage}>{item.leverage}x</Text>
      </View>

      <View style={styles.positionBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Entry</Text>
            <Text style={styles.infoValue}>${item.entry_price.toFixed(2)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Qty</Text>
            <Text style={styles.infoValue}>{item.qty}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>P&L</Text>
            <Text style={[styles.infoValue, item.pnl_usdt >= 0 ? styles.profitText : styles.lossText]}>
              {item.pnl_usdt >= 0 ? '+' : ''}{item.pnl_usdt.toFixed(2)} ({item.pnl_pct.toFixed(2)}%)
            </Text>
          </View>
        </View>

        {/* Targets */}
        {item.targets && item.targets.length > 0 && (
          <View style={styles.targetsRow}>
            {item.targets.map((target, index) => (
              <View
                key={index}
                style={[styles.targetDot, target.hit ? styles.targetHit : styles.targetPending]}
              />
            ))}
          </View>
        )}
      </View>

      {activeTab === 'positions' && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => handleClosePosition(item)}
        >
          <Ionicons name="close-circle" size={20} color={colors.status.error} />
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Trading</Text>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="wallet" size={24} color={colors.accent.primary} />
          <Text style={styles.statLabel}>Connected</Text>
          <Text style={styles.statValue}>{exchanges.length} exchanges</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color={colors.trading.profit} />
          <Text style={styles.statLabel}>Win Rate</Text>
          <Text style={styles.statValue}>{winRate}%</Text>
        </Card>
      </View>

      {/* P&L Summary */}
      <Card style={styles.pnlCard}>
        <Text style={styles.pnlLabel}>Open P&L</Text>
        <Text style={[styles.pnlValue, totalPnL >= 0 ? styles.profitText : styles.lossText]}>
          {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} USDT
        </Text>
        <Text style={styles.positionsCount}>{positions.length} open positions</Text>
      </Card>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'positions' && styles.tabActive]}
          onPress={() => setActiveTab('positions')}
        >
          <Text style={[styles.tabText, activeTab === 'positions' && styles.tabTextActive]}>
            Open ({positions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History ({history.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <Card style={styles.emptyCard}>
      <Ionicons name="layers" size={48} color={colors.text.muted} />
      <Text style={styles.emptyTitle}>
        {activeTab === 'positions' ? 'No Open Positions' : 'No Trade History'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'positions'
          ? 'Your active trades will appear here'
          : 'Your closed trades will appear here'}
      </Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={activeTab === 'positions' ? positions : history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPositionItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.primary} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  pnlCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pnlLabel: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
  pnlValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  positionsCount: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  profitText: {
    color: colors.trading.profit,
  },
  lossText: {
    color: colors.trading.loss,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.accent.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.muted,
  },
  tabTextActive: {
    color: '#FFF',
  },
  positionCard: {
    marginBottom: spacing.md,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  symbol: {
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
  leverage: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    fontWeight: fontWeight.medium,
  },
  positionBody: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {},
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  targetsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  targetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  targetHit: {
    backgroundColor: colors.trading.profit,
  },
  targetPending: {
    backgroundColor: colors.text.muted,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  closeText: {
    color: colors.status.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
});

