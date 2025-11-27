// Verzek AutoTrader Color Palette - Vibrant Trading Theme
export const colors = {
  // Primary Background (Deep Space)
  background: {
    primary: '#0A0E27',
    secondary: '#111936',
    tertiary: '#1A2344',
    card: '#151B3B',
    elevated: '#1E2650',
  },

  // Accent Colors (Vibrant)
  accent: {
    primary: '#00D4AA',      // Teal/Cyan - Main accent
    secondary: '#7B61FF',    // Purple - Secondary
    tertiary: '#FF6B9D',     // Pink - Highlights
    gold: '#FFD700',         // Gold - Premium
    orange: '#FF8C42',       // Orange - Warnings
  },

  // Trading Colors
  trading: {
    profit: '#00E676',       // Bright Green
    loss: '#FF5252',         // Bright Red
    long: '#00D4AA',         // Teal for LONG
    short: '#FF6B9D',        // Pink for SHORT
    neutral: '#8892B0',      // Gray for neutral
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B8C5D6',
    muted: '#6B7A99',
    accent: '#00D4AA',
    inverse: '#0A0E27',
  },

  // Status Colors
  status: {
    success: '#00E676',
    warning: '#FFB74D',
    error: '#FF5252',
    info: '#29B6F6',
    pending: '#FFD700',
  },

  // Exchange Brand Colors
  exchanges: {
    binance: '#F0B90B',
    bybit: '#F7A600',
    okx: '#FFFFFF',
    phemex: '#D4FF00',
  },

  // Bot Colors
  bots: {
    scalper: '#00D4AA',
    trend: '#7B61FF',
    qfl: '#FF6B9D',
    ai: '#FFD700',
  },

  // Gradients
  gradients: {
    primary: ['#00D4AA', '#7B61FF'],
    secondary: ['#7B61FF', '#FF6B9D'],
    gold: ['#FFD700', '#FF8C42'],
    dark: ['#0A0E27', '#1A2344'],
    card: ['#151B3B', '#1E2650'],
  },

  // Border Colors
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    accent: 'rgba(0, 212, 170, 0.3)',
  },

  // Overlay
  overlay: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },
};

export type Colors = typeof colors;


