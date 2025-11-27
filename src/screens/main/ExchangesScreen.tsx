import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, Input, ExchangeCard, AddExchangeCard } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user';
import { Exchange, ExchangeName } from '../../types';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';

const SUPPORTED_EXCHANGES: ExchangeName[] = ['binance', 'bybit', 'okx', 'phemex'];

export function ExchangesScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [balances, setBalances] = useState<Record<number, { total: number; available: number }>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<ExchangeName | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [testnet, setTestnet] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExchanges();
  }, []);

  const loadExchanges = async () => {
    if (!user) return;
    try {
      const response = await userService.getExchanges(user.id);
      if (response.ok) {
        setExchanges(response.exchanges);
        // Load balances for each exchange
        response.exchanges.forEach(ex => loadBalance(ex.id));
      }
    } catch (error) {
      console.error('Load exchanges error:', error);
    }
  };

  const loadBalance = async (exchangeId: number) => {
    if (!user) return;
    try {
      const response = await userService.getExchangeBalance(user.id, exchangeId);
      if (response.ok) {
        setBalances(prev => ({
          ...prev,
          [exchangeId]: {
            total: response.balance.total,
            available: response.balance.available,
          },
        }));
      }
    } catch (error) {
      // Balance fetch failed - might be invalid API keys
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExchanges();
    setRefreshing(false);
  };

  const handleAddExchange = async () => {
    if (!user || !selectedExchange || !apiKey || !apiSecret) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.addExchange(user.id, {
        exchange: selectedExchange,
        api_key: apiKey,
        api_secret: apiSecret,
        testnet,
      });

      if (response.ok) {
        Alert.alert('Success', 'Exchange connected successfully');
        setShowAddForm(false);
        setSelectedExchange(null);
        setApiKey('');
        setApiSecret('');
        await loadExchanges();
      } else {
        Alert.alert('Error', response.message || 'Failed to add exchange');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to connect exchange');
    }
    setLoading(false);
  };

  const handleDeleteExchange = async (exchangeId: number) => {
    if (!user) return;

    Alert.alert(
      'Remove Exchange',
      'Are you sure you want to disconnect this exchange?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteExchange(user.id, exchangeId);
              await loadExchanges();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove exchange');
            }
          },
        },
      ]
    );
  };

  const connectedExchangeNames = exchanges.map(e => e.exchange);
  const availableExchanges = SUPPORTED_EXCHANGES.filter(e => !connectedExchangeNames.includes(e));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Exchanges</Text>
          <Text style={styles.subtitle}>Connect your exchange accounts for auto trading</Text>
        </View>

        {/* Connected Exchanges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected ({exchanges.length})</Text>
          
          {exchanges.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="wallet" size={48} color={colors.text.muted} />
              <Text style={styles.emptyText}>No exchanges connected</Text>
              <Text style={styles.emptySubtext}>Add an exchange to start trading</Text>
            </Card>
          ) : (
            exchanges.map((exchange) => (
              <ExchangeCard
                key={exchange.id}
                exchange={exchange}
                balance={balances[exchange.id]}
                onDelete={() => handleDeleteExchange(exchange.id)}
              />
            ))
          )}
        </View>

        {/* Add Exchange */}
        {!showAddForm && availableExchanges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Exchange</Text>
            {availableExchanges.map((exchange) => (
              <AddExchangeCard
                key={exchange}
                exchange={exchange}
                onPress={() => {
                  setSelectedExchange(exchange);
                  setShowAddForm(true);
                }}
              />
            ))}
          </View>
        )}

        {/* Add Exchange Form */}
        {showAddForm && selectedExchange && (
          <View style={styles.section}>
            <Card style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Connect {selectedExchange.charAt(0).toUpperCase() + selectedExchange.slice(1)}</Text>
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.text.muted}
                  onPress={() => {
                    setShowAddForm(false);
                    setSelectedExchange(null);
                  }}
                />
              </View>

              <Input
                label="API Key"
                placeholder="Enter your API key"
                value={apiKey}
                onChangeText={setApiKey}
                icon="key"
              />

              <Input
                label="API Secret"
                placeholder="Enter your API secret"
                value={apiSecret}
                onChangeText={setApiSecret}
                secureTextEntry
                icon="lock-closed"
              />

              <View style={styles.testnetRow}>
                <View>
                  <Text style={styles.testnetLabel}>Testnet Mode</Text>
                  <Text style={styles.testnetDesc}>Use testnet for paper trading</Text>
                </View>
                <Button
                  title={testnet ? 'Testnet' : 'Live'}
                  onPress={() => setTestnet(!testnet)}
                  variant={testnet ? 'secondary' : 'primary'}
                  size="small"
                />
              </View>

              <Button
                title="Connect Exchange"
                onPress={handleAddExchange}
                loading={loading}
                style={styles.connectButton}
              />
            </Card>
          </View>
        )}

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color={colors.accent.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Your API Keys are Secure</Text>
            <Text style={styles.infoText}>
              We encrypt your API keys and never store them in plain text. Only enable trading permissions, not withdrawals.
            </Text>
          </View>
        </Card>

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
  formCard: {
    padding: spacing.lg,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  testnetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  testnetLabel: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  testnetDesc: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  connectButton: {
    marginTop: spacing.sm,
  },
  infoCard: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  infoText: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: 2,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
});

