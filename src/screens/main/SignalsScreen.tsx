import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SignalCard, Card } from '../../components';
import { signalsService } from '../../services/signals';
import { Signal, SignalSource } from '../../types';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';

const BOT_FILTERS: { key: SignalSource | 'ALL'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'ALL', label: 'All', icon: 'apps' },
  { key: 'SCALPER', label: 'Scalper', icon: 'flash' },
  { key: 'TREND', label: 'Trend', icon: 'trending-up' },
  { key: 'QFL', label: 'QFL', icon: 'analytics' },
  { key: 'AI_ML', label: 'AI Bot', icon: 'hardware-chip' },
];

export function SignalsScreen() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>([]);
  const [activeFilter, setActiveFilter] = useState<SignalSource | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSignals();
  }, []);

  useEffect(() => {
    if (activeFilter === 'ALL') {
      setFilteredSignals(signals);
    } else {
      setFilteredSignals(signals.filter(s => s.source === activeFilter));
    }
  }, [activeFilter, signals]);

  const loadSignals = async () => {
    try {
      const response = await signalsService.getLiveSignals();
      if (response.ok) {
        setSignals(response.signals);
      }
    } catch (error) {
      console.error('Load signals error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSignals();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Live Signals</Text>
      <Text style={styles.subtitle}>Real-time trading signals from our bots</Text>
      
      {/* Bot Filters */}
      <View style={styles.filterContainer}>
        {BOT_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterButton, activeFilter === filter.key && styles.filterButtonActive]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Ionicons
              name={filter.icon}
              size={16}
              color={activeFilter === filter.key ? '#FFF' : colors.text.muted}
            />
            <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{filteredSignals.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {filteredSignals.filter(s => s.side === 'LONG').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.trading.long }]}>Long</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {filteredSignals.filter(s => s.side === 'SHORT').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.trading.short }]}>Short</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <Card style={styles.emptyCard}>
      <Ionicons name="pulse" size={48} color={colors.text.muted} />
      <Text style={styles.emptyTitle}>No Signals</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'ALL'
          ? 'No active signals at the moment'
          : `No ${activeFilter} signals available`}
      </Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredSignals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <SignalCard signal={item} />}
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
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    fontWeight: fontWeight.medium,
  },
  filterTextActive: {
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.light,
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

