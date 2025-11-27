import api from './api';
import { User, UserSettings, Exchange, ExchangeBalance, Subscription, ExchangeName } from '../types';

export const userService = {
  // User Profile
  async getUser(userId: number): Promise<{ ok: boolean; user: User & { settings: UserSettings } }> {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  async updateGeneralSettings(
    userId: number,
    data: { full_name?: string; auto_trade_enabled?: boolean }
  ): Promise<{ ok: boolean; message: string }> {
    const response = await api.put(`/api/users/${userId}/general`, data);
    return response.data;
  },

  // Risk Settings
  async updateRiskSettings(
    userId: number,
    data: {
      capital_usdt?: number;
      per_trade_usdt?: number;
      leverage?: number;
      max_concurrent_trades?: number;
    }
  ): Promise<{ ok: boolean; message: string }> {
    const response = await api.put(`/api/users/${userId}/risk`, data);
    return response.data;
  },

  // DCA Settings
  async updateDCASettings(
    userId: number,
    data: {
      dca_enabled?: boolean;
      dca_steps?: number;
      dca_step_percent?: number;
    }
  ): Promise<{ ok: boolean; message: string }> {
    const response = await api.put(`/api/users/${userId}/dca`, data);
    return response.data;
  },

  // Reversal Settings
  async updateReversalSettings(
    userId: number,
    data: { auto_reversal_enabled: boolean }
  ): Promise<{ ok: boolean; message: string }> {
    const response = await api.put(`/api/users/${userId}/reversal`, data);
    return response.data;
  },

  // Exchanges
  async getExchanges(userId: number): Promise<{ ok: boolean; exchanges: Exchange[] }> {
    const response = await api.get(`/api/users/${userId}/exchanges`);
    return response.data;
  },

  async addExchange(
    userId: number,
    data: {
      exchange: ExchangeName;
      api_key: string;
      api_secret: string;
      testnet?: boolean;
    }
  ): Promise<{ ok: boolean; message: string }> {
    const response = await api.post(`/api/users/${userId}/exchanges`, data);
    return response.data;
  },

  async deleteExchange(userId: number, exchangeId: number): Promise<{ ok: boolean; message: string }> {
    const response = await api.delete(`/api/users/${userId}/exchanges`, {
      params: { exchange_id: exchangeId },
    });
    return response.data;
  },

  async getExchangeBalance(
    userId: number,
    exchangeId: number
  ): Promise<{ ok: boolean; exchange: string; testnet: boolean; balance: ExchangeBalance['balance'] }> {
    const response = await api.get(`/api/users/${userId}/exchanges/${exchangeId}/balance`);
    return response.data;
  },

  // Subscription
  async getSubscription(userId: number): Promise<{ ok: boolean; subscription: Subscription }> {
    const response = await api.get(`/api/users/${userId}/subscription`);
    return response.data;
  },

  // Device Token (Push Notifications)
  async registerDeviceToken(
    userId: number,
    data: {
      push_token: string;
      device_name?: string;
      device_platform?: string;
    }
  ): Promise<{ ok: boolean; message: string }> {
    const response = await api.post(`/api/users/${userId}/device-token`, data);
    return response.data;
  },

  async removeDeviceToken(
    userId: number,
    pushToken: string
  ): Promise<{ ok: boolean; message: string }> {
    const response = await api.delete(`/api/users/${userId}/device-token`, {
      data: { push_token: pushToken },
    });
    return response.data;
  },

  // Notification Settings
  async getNotificationSettings(userId: number): Promise<{
    ok: boolean;
    settings: {
      notifications_enabled: boolean;
      subscription_type: string;
      features: { signal_notifications: boolean; trade_notifications: boolean };
    };
  }> {
    const response = await api.get(`/api/users/${userId}/notifications/settings`);
    return response.data;
  },

  async updateNotificationSettings(
    userId: number,
    data: { notifications_enabled: boolean }
  ): Promise<{ ok: boolean; message: string }> {
    const response = await api.put(`/api/users/${userId}/notifications/settings`, data);
    return response.data;
  },
};


