import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withSpring,
} from 'react-native-reanimated';
import {
  formatWind, formatHumidity, formatPressure, formatVisibility,
} from '../utils/weatherUtils';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import type { CurrentWeather } from '../types/weather';

function StatCard({ icon, label, value, index }: { icon: string; label: string; value: string; index: number }) {
  const opacity = useSharedValue(0);
  const scale   = useSharedValue(0.85);
  useEffect(() => {
    opacity.value = withDelay(index * 70, withSpring(1));
    scale.value   = withDelay(index * 70, withSpring(1, { damping: 12 }));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[styles.card, style]}>
      <Ionicons name={icon as any} size={20} color={COLORS.accent} style={{ marginBottom: 6 }} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

export default function WeatherStats({ current }: { current: CurrentWeather }) {
  const stats = [
    { icon: 'water-outline',        label: 'Humidity',   value: formatHumidity(current.main.humidity) },
    { icon: 'flag-outline',         label: 'Wind',        value: formatWind(current.wind.speed) },
    { icon: 'eye-outline',          label: 'Visibility',  value: formatVisibility(current.visibility) },
    { icon: 'speedometer-outline',  label: 'Pressure',    value: formatPressure(current.main.pressure) },
    { icon: 'thermometer-outline',  label: 'Feels Like',  value: `${Math.round(current.main.feels_like)}°` },
    { icon: 'partly-sunny-outline', label: 'Cloud Cover', value: `${current.clouds.all}%` },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Details</Text>
      <View style={styles.grid}>
        {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  card:         { width: '30.5%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder },
  value:        { color: COLORS.textPrimary,   fontSize: 15, fontWeight: '700', marginBottom: 2 },
  label:        { color: COLORS.textMuted,     fontSize: 11, fontWeight: '500' },
});