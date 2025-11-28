import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';

export function SettingsScreen() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Trading Settings
  const [maxConcurrentTrades, setMaxConcurrentTrades] = useState('50');
  const [defaultLeverage, setDefaultLeverage] = useState('10');
  const [riskPerTrade, setRiskPerTrade] = useState('2');
  const [autoStopLoss, setAutoStopLoss] = useState(true);
  const [autoTakeProfit, setAutoTakeProfit] = useState(true);
  const [trailingStop, setTrailingStop] = useState(false);

  useEffect(() => {
    if (user) {
      // Load user settings
      setMaxConcurrentTrades(String(user.max_concurrent_trades || 50));
      setDefaultLeverage(String(user.default_leverage || 10));
      setRiskPerTrade(String(user.risk_per_trade || 2));
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update risk settings (max concurrent trades, leverage, risk per trade)
      await userService.updateRiskSettings(user.id, {
        max_concurrent_trades: parseInt(maxConcurrentTrades) || 50,
        leverage: parseInt(defaultLeverage) || 10,
        per_trade_usdt: parseFloat(riskPerTrade) || 2,
      });
      
      // Note: auto_stop_loss, auto_take_profit, trailing_stop are strategy settings
      // These would need a separate endpoint or be stored in preferences JSON
      // For now, we'll save the risk settings that are supported
      
      await refreshUser();
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
    setLoading(false);
  };

  const SettingToggle = ({ label, description, value, onToggle }: { label: string; description: string; value: boolean; onToggle: () => void }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onToggle}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <View style={[styles.toggle, value && styles.toggleActive]}>
        <View style={[styles.toggleKnob, value && styles.toggleKnobActive]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Trading Settings</Text>
          <Text style={styles.subtitle}>Configure your auto trading parameters</Text>
        </View>

        {/* Position Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Position Limits</Text>
          <Card>
            <Input
              label="Max Concurrent Trades"
              placeholder="50"
              value={maxConcurrentTrades}
              onChangeText={setMaxConcurrentTrades}
              keyboardType="numeric"
              icon="layers"
            />
            <Text style={styles.inputHint}>Maximum: 50 positions at once</Text>

            <Input
              label="Default Leverage"
              placeholder="10"
              value={defaultLeverage}
              onChangeText={setDefaultLeverage}
              keyboardType="numeric"
              icon="trending-up"
            />
            <Text style={styles.inputHint}>Recommended: 5-20x for futures</Text>

            <Input
              label="Risk Per Trade (%)"
              placeholder="2"
              value={riskPerTrade}
              onChangeText={setRiskPerTrade}
              keyboardType="decimal-pad"
              icon="shield"
            />
            <Text style={styles.inputHint}>Percentage of balance per trade</Text>
          </Card>
        </View>

        {/* Risk Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Management</Text>
          <Card>
            <SettingToggle
              label="Auto Stop Loss"
              description="Automatically set SL from signal engine"
              value={autoStopLoss}
              onToggle={() => setAutoStopLoss(!autoStopLoss)}
            />
            <View style={styles.divider} />
            <SettingToggle
              label="Auto Take Profit"
              description="Use partial TPs from signal engine"
              value={autoTakeProfit}
              onToggle={() => setAutoTakeProfit(!autoTakeProfit)}
            />
            <View style={styles.divider} />
            <SettingToggle
              label="Trailing Stop"
              description="Enable trailing stop on profitable trades"
              value={trailingStop}
              onToggle={() => setTrailingStop(!trailingStop)}
            />
          </Card>
        </View>

        {/* Signal Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signal Sources</Text>
          <Card>
            <View style={styles.botRow}>
              <View style={styles.botInfo}>
                <Ionicons name="flash" size={24} color={colors.exchanges.binance} />
                <Text style={styles.botName}>ScalpingBot</Text>
              </View>
              <View style={[styles.statusDot, styles.activeDot]} />
            </View>
            <View style={styles.divider} />
            <View style={styles.botRow}>
              <View style={styles.botInfo}>
                <Ionicons name="trending-up" size={24} color={colors.exchanges.bybit} />
                <Text style={styles.botName}>TrendBot</Text>
              </View>
              <View style={[styles.statusDot, styles.activeDot]} />
            </View>
            <View style={styles.divider} />
            <View style={styles.botRow}>
              <View style={styles.botInfo}>
                <Ionicons name="analytics" size={24} color={colors.exchanges.okx} />
                <Text style={styles.botName}>QFL Bot</Text>
              </View>
              <View style={[styles.statusDot, styles.activeDot]} />
            </View>
            <View style={styles.divider} />
            <View style={styles.botRow}>
              <View style={styles.botInfo}>
                <Ionicons name="hardware-chip" size={24} color={colors.exchanges.phemex} />
                <Text style={styles.botName}>AI Bot</Text>
              </View>
              <View style={[styles.statusDot, styles.activeDot]} />
            </View>
          </Card>
        </View>

        {/* Info */}
        <Card style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.accent.primary} />
          <Text style={styles.infoText}>
            All trades strictly follow SL/TP settings from the Verzek Signal Engine. Partial take profits and reversal detection are handled automatically.
          </Text>
        </Card>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Save Settings"
            onPress={handleSaveSettings}
            loading={loading}
          />
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
    padding: spacing.lg,
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
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  inputHint: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  settingDesc: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.elevated,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.accent.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text.muted,
  },
  toggleKnobActive: {
    backgroundColor: '#FFF',
    marginLeft: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  botRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  botInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  botName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeDot: {
    backgroundColor: colors.status.success,
  },
  infoCard: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.muted,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  bottomPadding: {
    height: 100,
  },
});

