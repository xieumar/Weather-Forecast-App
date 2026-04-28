import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import { useWeatherContext } from '@/src/context/WeatherContext';
import WeatherIcon from '@/src/components/WeatherIcon';
import { dayLabel } from '@/src/utils/weatherUtils';

export default function ForecastScreen() {
  const { daily, cityName } = useWeatherContext();

  return (
    <LinearGradient colors={['#1A3A5C', '#0B1426']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Next 7 Days</Text>
            <Text style={styles.subtitle}>{cityName}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {daily.map((day, index) => (
            <Animated.View
              key={day.dt}
              entering={FadeInDown.delay(index * 100).duration(500)}
              style={styles.card}
            >
              <View style={styles.row}>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayName}>{dayLabel(day.dt)}</Text>
                  <Text style={styles.dayDesc}>{day.description}</Text>
                </View>

                <View style={styles.weatherInfo}>
                  <WeatherIcon iconCode={day.icon} size={40} animated={false} />
                  <View style={styles.temps}>
                    <Text style={styles.high}>{day.tempMax}°</Text>
                    <Text style={styles.low}>{day.tempMin}°</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.details}>
                <View style={styles.detailItem}>
                  <Ionicons name="water-outline" size={14} color={COLORS.accent} />
                  <Text style={styles.detailLabel}>Hum: {day.humidity}%</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="flag-outline" size={14} color={COLORS.accent} />
                  <Text style={styles.detailLabel}>Wind: {day.wind} km/h</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  headerTitle: { flex: 1 },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },
  subtitle: { color: COLORS.textMuted, fontSize: 14 },
  scroll: { padding: SPACING.lg, gap: SPACING.md },
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: { flex: 1 },
  dayName: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600' },
  dayDesc: { color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
  weatherInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  temps: { alignItems: 'flex-end' },
  high: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  low: { color: COLORS.textMuted, fontSize: 14, fontWeight: '500' },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: SPACING.md,
  },
  details: { flexDirection: 'row', gap: SPACING.lg },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailLabel: { color: COLORS.textSecondary, fontSize: 12 },
});
