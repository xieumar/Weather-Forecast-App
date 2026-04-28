import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  type SharedValue
} from 'react-native-reanimated';
import WeatherIcon from './WeatherIcon';
import { dayLabel } from '../utils/weatherUtils';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import type { DailyForecastItem } from '../types/weather';

function DayRow({ item, index, onPress }: { item: DailyForecastItem; index: number; onPress?: () => void }) {
  return (
    <View>
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
    </View>
  );
}

interface Props { daily: DailyForecastItem[]; onDayPress?: () => void; scrollY: SharedValue<number>; }

export default function DailyForecast({ daily, scrollY, onDayPress }: Props) {
  const { height } = useWindowDimensions();
  const layoutY = useSharedValue(0);
  const isMeasured = useSharedValue(false);
  const hasAppeared = useSharedValue(0); // 0 = hidden, 1 = visible

  const style = useAnimatedStyle(() => {
    // Keep it hidden until we know exactly where it is on the screen
    if (!isMeasured.value) {
      return { opacity: 0, transform: [{ translateY: 50 }] };
    }

    // Trigger the animation when the user scrolls near it (with a 100px buffer)
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
        // Only grab the layout once to prevent re-measurement glitches
        if (!isMeasured.value) {
          layoutY.value = e.nativeEvent.layout.y; 
          isMeasured.value = true;
        }
      }}
    >
      <Text style={styles.label}>7-Day Forecast</Text>
      <View style={styles.card}>
        {daily.slice(0, 7).map((item, i) => (
          <View key={item.dt}>
            <DayRow item={item} index={i} onPress={onDayPress} />
            {i < Math.min(daily.length - 1, 6) && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </Animated.View>
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