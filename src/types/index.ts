// User Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  subscription_type: 'TRIAL' | 'VIP' | 'PREMIUM';
  is_verified: boolean;
  auto_trade_enabled: boolean;
  referral_code: string;
  created_at: string;
}

export interface UserSettings {
  capital_usdt: number;
  per_trade_usdt: number;
  leverage: number;
  max_concurrent_trades: number;
  dca_enabled: boolean;
  auto_reversal_enabled: boolean;
  preferences: Record<string, unknown>;
}

// Exchange Types
export type ExchangeName = 'binance' | 'bybit' | 'okx' | 'phemex';

export interface Exchange {
  id: number;
  exchange: ExchangeName;
  testnet: boolean;
  is_active: boolean;
}

export interface ExchangeBalance {
  exchange: ExchangeName;
  testnet: boolean;
  balance: {
    total: number;
    available: number;
    currency: string;
  };
}

// Signal Types
export type SignalSource = 'SCALPER' | 'TREND' | 'QFL' | 'AI_ML';
export type SignalSide = 'LONG' | 'SHORT';
export type SignalStatus = 'ACTIVE' | 'CLOSED' | 'CANCELLED' | 'EXPIRED';

export interface Signal {
  id: number;
  source: SignalSource;
  symbol: string;
  side: SignalSide;
  entry: number;
  stop_loss: number;
  take_profits: number[];
  timeframe: string;
  confidence: number;
  version: string;
  metadata: Record<string, unknown>;
  status: SignalStatus;
  created_at: string;
}

// Position Types
export type PositionStatus = 'OPEN' | 'PARTIAL' | 'CLOSED' | 'STOPPED' | 'CANCELLED';

export interface Position {
  id: number;
  signal_id: number;
  symbol: string;
  side: SignalSide;
  leverage: number;
  qty: number;
  entry_price: number;
  remaining_qty: number;
  status: PositionStatus;
  pnl_usdt: number;
  pnl_pct: number;
  created_at: string;
  targets: PositionTarget[];
}

export interface PositionTarget {
  index: number;
  price: number;
  qty: number;
  hit: boolean;
  hit_at?: string;
}

// Subscription Types
export interface Subscription {
  plan: 'TRIAL' | 'VIP' | 'PREMIUM';
  auto_trade_enabled: boolean;
  features: {
    signals: boolean;
    auto_trading: boolean;
    advanced_analytics: boolean;
  };
}

// API Response Types
export interface ApiResponse<T> {
  ok: boolean;
  error?: string;
  message?: string;
  data?: T;
}

// Auth Types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  ok: boolean;
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterResponse {
  ok: boolean;
  token: string;
  access_token: string;
  refresh_token: string;
  user: User;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { email: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Signals: undefined;
  Trading: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  SignalDetail: { signal: Signal };
  PositionDetail: { position: Position };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  Exchanges: undefined;
  AddExchange: { exchange?: ExchangeName };
  Subscription: undefined;
  TradeHistory: undefined;
};


