import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  type SharedValue
} from 'react-native-reanimated';
import {
  formatWind, formatHumidity, formatPressure, formatVisibility,
} from '../utils/weatherUtils';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import type { CurrentWeather } from '../types/weather';

function StatCard({ icon, label, value }: { icon: string; label: string; value: string; index: number }) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon as any} size={20} color={COLORS.accent} style={{ marginBottom: 6 }} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export default function WeatherStats({ current, scrollY }: { current: CurrentWeather; scrollY: SharedValue<number> }) {
  const stats = [
    { icon: 'water-outline',        label: 'Humidity',   value: formatHumidity(current.main.humidity) },
    { icon: 'flag-outline',         label: 'Wind',       value: formatWind(current.wind.speed) },
    { icon: 'eye-outline',          label: 'Visibility', value: formatVisibility(current.visibility) },
    { icon: 'speedometer-outline',  label: 'Pressure',   value: formatPressure(current.main.pressure) },
    { icon: 'thermometer-outline',  label: 'Feels Like', value: `${Math.round(current.main.feels_like)}°` },
    { icon: 'partly-sunny-outline', label: 'Cloud Cover',value: `${current.clouds.all}%` },
  ];

  const { height } = useWindowDimensions();
  const layoutY = useSharedValue(0);
  const isMeasured = useSharedValue(false);
  const hasAppeared = useSharedValue(0);

  const style = useAnimatedStyle(() => {
    if (!isMeasured.value) {
      return { opacity: 0, transform: [{ translateY: 50 }] };
    }

    if (scrollY.value + height > layoutY.value + 100) {
      hasAppeared.value = 1;
    }

    return {
      opacity: withTiming(hasAppeared.value, { duration: 500 }),
      transform: [
        { translateY: withSpring(hasAppeared.value ? 0 : 50, { damping: 14, stiffness: 100 }) }
      ]
    };
  });

  return (
    <Animated.View 
      style={[styles.container, style]}
      onLayout={(e) => { 
        if (!isMeasured.value) {
          layoutY.value = e.nativeEvent.layout.y; 
          isMeasured.value = true;
        }
      }}
    >
      <Text style={styles.sectionTitle}>Details</Text>
      <View style={styles.grid}>
        {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container:    { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: SPACING.sm },
  card:         { width: '31.5%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder },
  value:        { color: COLORS.textPrimary,   fontSize: 15, fontWeight: '700', marginBottom: 2 },
  label:        { color: COLORS.textMuted,     fontSize: 11, fontWeight: '500' },
});