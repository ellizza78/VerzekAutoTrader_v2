import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Card, Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user';
import { Exchange } from '../../types';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout, refreshUser } = useAuth();
  const [autoTradeEnabled, setAutoTradeEnabled] = useState(user?.auto_trade_enabled || false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadExchanges();
      setAutoTradeEnabled(user.auto_trade_enabled);
    }
  }, [user]);

  const loadExchanges = async () => {
    if (!user) return;
    try {
      const response = await userService.getExchanges(user.id);
      if (response.ok) {
        setExchanges(response.exchanges);
      }
    } catch (error) {
      console.error('Load exchanges error:', error);
    }
  };

  const toggleAutoTrade = async (value: boolean) => {
    if (!user) return;
    
    if (value && exchanges.length === 0) {
      Alert.alert(
        'No Exchange Connected',
        'Please connect at least one exchange before enabling auto trading.',
        [{ text: 'OK' }]
      );
      return;
    }

    setAutoTradeEnabled(value);
    try {
      await userService.updateGeneralSettings(user.id, { auto_trade_enabled: value });
      await refreshUser();
    } catch (error) {
      setAutoTradeEnabled(!value);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const menuItems = [
    { icon: 'wallet', label: 'Connected Exchanges', screen: 'Exchanges', badge: exchanges.length },
    { icon: 'settings', label: 'Trading Settings', screen: 'Settings' },
    { icon: 'time', label: 'Trade History', screen: 'TradeHistory' },
    { icon: 'diamond', label: 'Subscription', screen: 'Subscription' },
    { icon: 'notifications', label: 'Notifications', screen: 'Notifications' },
    { icon: 'help-circle', label: 'Help & Support', screen: 'Help' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Card */}
        <Card style={styles.userCard} variant="gradient" gradientColors={colors.gradients.primary}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FFF', '#F0F0F0']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.subscriptionBadge}>
            <Ionicons name="diamond" size={14} color={colors.accent.gold} />
            <Text style={styles.subscriptionText}>{user?.subscription_type || 'TRIAL'}</Text>
          </View>
          {user?.referral_code && (
            <View style={styles.referralRow}>
              <Text style={styles.referralLabel}>Your Referral Code:</Text>
              <Text style={styles.referralCode}>{user.referral_code}</Text>
            </View>
          )}
        </Card>

        {/* Auto Trade Toggle */}
        <Card style={styles.autoTradeCard}>
          <View style={styles.autoTradeRow}>
            <View style={styles.autoTradeInfo}>
              <Ionicons name="flash" size={28} color={autoTradeEnabled ? colors.accent.primary : colors.text.muted} />
              <View>
                <Text style={styles.autoTradeTitle}>Auto Trading</Text>
                <Text style={styles.autoTradeDesc}>
                  {autoTradeEnabled ? 'Signals are being executed automatically' : 'Enable to trade signals automatically'}
                </Text>
              </View>
            </View>
            <Switch
              value={autoTradeEnabled}
              onValueChange={toggleAutoTrade}
              trackColor={{ false: colors.background.elevated, true: colors.accent.primary + '50' }}
              thumbColor={autoTradeEnabled ? colors.accent.primary : colors.text.muted}
            />
          </View>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon as any} size={22} color={colors.accent.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <View style={styles.menuRight}>
                {item.badge !== undefined && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            icon={<Ionicons name="log-out" size={20} color={colors.status.error} />}
            textStyle={{ color: colors.status.error }}
            style={styles.logoutButton}
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>

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
  userCard: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.accent.primary,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#FFF',
  },
  userEmail: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  subscriptionText: {
    color: colors.accent.gold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  referralRow: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  referralLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  referralCode: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#FFF',
    letterSpacing: 2,
  },
  autoTradeCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  autoTradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoTradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  autoTradeTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  autoTradeDesc: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    maxWidth: 200,
  },
  menuContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    color: '#FFF',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  logoutContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  logoutButton: {
    borderColor: colors.status.error,
  },
  version: {
    textAlign: 'center',
    color: colors.text.muted,
    fontSize: fontSize.sm,
    marginTop: spacing.lg,
  },
  bottomPadding: {
    height: 100,
  },
});

