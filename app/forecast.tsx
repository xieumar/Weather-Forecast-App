import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming,
  FadeInDown, Layout,
} from 'react-native-reanimated';
import { router } from 'expo-router';

import { useWeatherContext } from '@/src/context/WeatherContext';
import WeatherIcon           from '@/src/components/WeatherIcon';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import {
  dayLabel, formatWind, formatHumidity,
  getGradientForCondition,
} from '@/src/utils/weatherUtils';
import type { DailyForecastItem } from '@/src/types/weather';

// ── Expandable day card ───────────────────────────────────────────────────────
function DayCard({ item, index }: { item: DailyForecastItem; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const chevronRotate = useSharedValue(0);
  const detailHeight  = useSharedValue(0);
  const detailOpacity = useSharedValue(0);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    chevronRotate.value = withSpring(next ? 1 : 0);
    detailHeight.value  = withSpring(next ? 1 : 0);
    detailOpacity.value = withTiming(next ? 1 : 0, { duration: 220 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotate.value * 180}deg` }],
  }));

  const detailStyle = useAnimatedStyle(() => ({
    maxHeight: detailHeight.value * 130,
    opacity:   detailOpacity.value,
    overflow:  'hidden',
  }));

  const stats = [
    { icon: 'thermometer-outline', label: 'High',     value: `${item.tempMax}°` },
    { icon: 'thermometer-outline', label: 'Low',      value: `${item.tempMin}°` },
    { icon: 'water-outline',       label: 'Humidity', value: item.humidity != null ? formatHumidity(item.humidity) : '—' },
    { icon: 'flag-outline',        label: 'Wind',     value: item.wind != null ? formatWind(item.wind) : '—' },
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 65).duration(380)}
      layout={Layout.springify()}
      style={styles.card}
    >
      {/* Header row — always visible */}
      <TouchableOpacity style={styles.cardRow} onPress={toggle} activeOpacity={0.8}>
        <Text style={styles.dayLabel}>{dayLabel(item.dt)}</Text>

        <View style={styles.cardMiddle}>
          <WeatherIcon iconCode={item.icon} size={26} animated={false} />
          <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.highTemp}>{item.tempMax}°</Text>
          <Text style={styles.lowTemp}>{item.tempMin}°</Text>
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Expanded detail — animates in/out */}
      <Animated.View style={detailStyle}>
        <View style={styles.detailRow}>
          {stats.map(({ icon, label, value }) => (
            <View key={label} style={styles.detailCell}>
              <Ionicons name={icon as any} size={16} color={COLORS.accent} />
              <Text style={styles.detailValue}>{value}</Text>
              <Text style={styles.detailLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ForecastScreen() {
  const { daily, current, cityName } = useWeatherContext();
  const gradient = getGradientForCondition(current?.weather[0]?.icon);

  return (
    <LinearGradient colors={[...gradient]} style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="chevron-down" size={26} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>7-Day Forecast</Text>
            <Text style={styles.headerSub}>{cityName}</Text>
          </View>
          {/* Current temp badge */}
          {current && (
            <View style={styles.tempBadge}>
              <WeatherIcon iconCode={current.weather[0].icon} size={22} animated={false} />
              <Text style={styles.tempBadgeText}>{Math.round(current.main.temp)}°</Text>
            </View>
          )}
        </View>

        {/* Hint */}
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.hintText}>Tap a day to see more details</Text>
        </View>

        {/* Day cards */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {daily.slice(0, 7).map((item, i) => (
            <DayCard key={item.dt} item={item} index={i} />
          ))}

          {/* Summary strip */}
          {daily.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(daily.length * 65 + 100).duration(400)}
              style={styles.summary}
            >
              <Text style={styles.summaryLabel}>Temperature range this week</Text>
              <Text style={styles.summaryRange}>
                {Math.min(...daily.slice(0,7).map(d => d.tempMin))}°
                {'  —  '}
                {Math.max(...daily.slice(0,7).map(d => d.tempMax))}°
              </Text>
            </Animated.View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: COLORS.background },

  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.sm, gap: SPACING.sm },
  closeBtn:       { padding: 6, marginRight: 4 },
  headerTitle:    { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 10 },
  headerSub:      { color: COLORS.textMuted, fontSize: 13, marginTop: 1 },
  tempBadge:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.round, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.glassBorder },
  tempBadgeText:  { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },

  hint:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  hintText:       { color: COLORS.textMuted, fontSize: 12 },

  list:           { paddingHorizontal: SPACING.lg, gap: SPACING.sm },

  card:           { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.glassBorder, overflow: 'hidden' },
  cardRow:        { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  dayLabel:       { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600', width: 82 },
  cardMiddle:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardDesc:       { color: COLORS.textSecondary, fontSize: 13, flex: 1 },
  cardRight:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  highTemp:       { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  lowTemp:        { color: COLORS.textMuted, fontSize: 15, fontWeight: '500', minWidth: 32, textAlign: 'center' },

  detailRow:      { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md },
  detailCell:     { alignItems: 'center', gap: 4 },
  detailValue:    { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  detailLabel:    { color: COLORS.textMuted, fontSize: 11 },

  summary:        { marginTop: SPACING.md, backgroundColor: 'rgba(77,159,255,0.08)', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(77,159,255,0.2)', alignItems: 'center' },
  summaryLabel:   { color: COLORS.textMuted, fontSize: 12, marginBottom: 4 },
  summaryRange:   { color: COLORS.accentLight, fontSize: 22, fontWeight: '300', letterSpacing: 1 },
});