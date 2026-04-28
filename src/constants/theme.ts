export const COLORS = {
  background:          '#0B1426',
  backgroundSecondary: '#0F1D35',
  cardPrimary:         '#1A2E50',
  glassCard:           'rgba(255,255,255,0.08)',
  glassBorder:         'rgba(255,255,255,0.12)',
  accent:              '#4D9FFF',
  accentLight:         '#7BB8FF',
  textPrimary:         '#FFFFFF',
  textSecondary:       'rgba(255,255,255,0.65)',
  textMuted:           'rgba(255,255,255,0.4)',
  warning:             '#FFD166',
  danger:              '#FF6B6B',
  rainy:               '#74B9FF',
  gradientSky:         ['#1A2E50', '#0B1426'] as const,
} as const;

export const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
} as const;

export const RADIUS = {
  sm: 8, md: 16, lg: 24, xl: 32, round: 9999,
} as const;