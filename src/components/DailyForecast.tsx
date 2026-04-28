import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withSpring,
} from 'react-native-reanimated';
import WeatherIcon from './WeatherIcon';
import { dayLabel } from '../utils/weatherUtils';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import type { DailyForecastItem } from '../types/weather';

function DayRow({ item, index, onPress }: { item: DailyForecastItem; index: number; onPress?: () => void }) {
  const opacity    = useSharedValue(0);
  const translateX = useSharedValue(-30);

  useEffect(() => {
    opacity.value    = withDelay(index * 80, withSpring(1));
    translateX.value = withDelay(index * 80, withSpring(0, { damping: 15 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={style}>
      <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
        <Text style={styles.day}>{dayLabel(item.dt)}</Text>
        <View style={styles.middle}>
          <WeatherIcon iconCode={item.icon} size={22} animated={false} />
          <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
        </View>
        <View style={styles.temps}>
          <Text style={styles.high}>{item.tempMax}°</Text>
          <Text style={styles.low}>{item.tempMin}°</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface Props { daily: DailyForecastItem[]; onDayPress?: () => void }

export default function DailyForecast({ daily, onDayPress }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>7-Day Forecast</Text>
      <View style={styles.card}>
        {daily.slice(0, 7).map((item, i) => (
          <View key={item.dt}>
            <DayRow item={item} index={i} onPress={onDayPress} />
            {i < Math.min(daily.length - 1, 6) && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.xl, paddingHorizontal: SPACING.lg },
  label:     { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm },
  card:      { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.glassBorder, overflow: 'hidden' },
  row:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 13 },
  day:       { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', width: 80 },
  middle:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  desc:      { color: COLORS.textSecondary, fontSize: 13, flex: 1 },
  temps:     { flexDirection: 'row', gap: 10, alignItems: 'center' },
  high:      { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', minWidth: 34, textAlign: 'right' },
  low:       { color: COLORS.textMuted,   fontSize: 15, fontWeight: '500', minWidth: 34, textAlign: 'right' },
  divider:   { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: SPACING.md },
});