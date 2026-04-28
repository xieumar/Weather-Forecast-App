import React, { useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withSpring,
} from 'react-native-reanimated';
import WeatherIcon from './WeatherIcon';
import { shortTime } from '../utils/weatherUtils';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import type { HourlyForecastItem } from '../types/weather';

function HourItem({ item, index }: { item: HourlyForecastItem; index: number }) {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const delay = index * 60;
    opacity.value    = withDelay(delay, withSpring(1));
    translateY.value = withDelay(delay, withSpring(0, { damping: 14 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const isNow = index === 0;

  return (
    <Animated.View style={[styles.item, isNow && styles.itemActive, style]}>
      <Text style={[styles.time, isNow && styles.timeActive]}>{isNow ? 'Now' : shortTime(item.dt)}</Text>
      <WeatherIcon iconCode={item.icon} size={26} animated={false} />
      {item.pop > 0.1 && <Text style={styles.pop}>{Math.round(item.pop * 100)}%</Text>}
      <Text style={[styles.temp, isNow && styles.tempActive]}>{item.temp}°</Text>
    </Animated.View>
  );
}

export default function HourlyForecast({ hourly }: { hourly: HourlyForecastItem[] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Hourly Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {hourly.map((item, i) => <HourItem key={item.dt} item={item} index={i} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  label:     { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm, paddingHorizontal: SPACING.lg },
  scroll:    { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  item:      { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm, width: 58, gap: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  itemActive:{ backgroundColor: 'rgba(77,159,255,0.18)', borderColor: 'rgba(77,159,255,0.4)' },
  time:      { color: COLORS.textMuted, fontSize: 11, fontWeight: '500' },
  timeActive:{ color: COLORS.accentLight },
  pop:       { color: COLORS.rainy, fontSize: 10, fontWeight: '500' },
  temp:      { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  tempActive:{ color: COLORS.accentLight },
});