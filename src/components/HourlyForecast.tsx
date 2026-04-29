import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withSpring
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import WeatherIcon from './WeatherIcon';
import { shortTime, fullDate } from '../utils/weatherUtils';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import type { HourlyForecastItem } from '../types/weather';

function HourItem({ item, index, onPress }: { item: HourlyForecastItem; index: number; onPress: () => void }) {
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
      <TouchableOpacity activeOpacity={0.7} style={styles.touchable} onPress={onPress}>
        <Text style={[styles.time, isNow && styles.timeActive]}>{isNow ? 'Now' : shortTime(item.dt)}</Text>
        <WeatherIcon iconCode={item.icon} size={26} animated={false} />
        {item.pop > 0.1 && <Text style={styles.pop}>{Math.round(item.pop * 100)}%</Text>}
        <Text style={[styles.temp, isNow && styles.tempActive]}>{item.temp}°</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HourlyForecast({ hourly }: { hourly: HourlyForecastItem[] }) {
  const [selectedHour, setSelectedHour] = useState<HourlyForecastItem | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Hourly Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {hourly.map((item, i) => (
          <HourItem 
            key={item.dt} 
            item={item} 
            index={i} 
            onPress={() => setSelectedHour(item)}
          />
        ))}
      </ScrollView>

      <Modal visible={!!selectedHour} transparent animationType="fade" onRequestClose={() => setSelectedHour(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedHour(null)}>
          {selectedHour && (
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTime}>{shortTime(selectedHour.dt)}</Text>
                <Text style={styles.modalDate}>{fullDate(selectedHour.dt)}</Text>
              </View>
              
              <View style={styles.modalHero}>
                <WeatherIcon iconCode={selectedHour.icon} size={70} animated />
                <Text style={styles.modalTemp}>{selectedHour.temp}°</Text>
                <Text style={styles.modalDesc}>{selectedHour.description}</Text>
              </View>

              <View style={styles.modalStats}>
                <View style={styles.statBox}>
                  <Ionicons name="water-outline" size={24} color={COLORS.accent} />
                  <Text style={styles.statVal}>{selectedHour.humidity}%</Text>
                  <Text style={styles.statLabel}>Humidity</Text>
                </View>
                <View style={styles.statBox}>
                  <Ionicons name="flag-outline" size={24} color={COLORS.accent} />
                  <Text style={styles.statVal}>{Math.round(selectedHour.windSpeed * 3.6)} km/h</Text>
                  <Text style={styles.statLabel}>Wind</Text>
                </View>
                <View style={styles.statBox}>
                  <Ionicons name="umbrella-outline" size={24} color={COLORS.accent} />
                  <Text style={styles.statVal}>{Math.round(selectedHour.pop * 100)}%</Text>
                  <Text style={styles.statLabel}>Rain Pop</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedHour(null)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  label:     { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm, paddingHorizontal: SPACING.lg },
  scroll:    { paddingHorizontal: SPACING.lg, paddingVertical: 10, gap: SPACING.sm },
  item:      { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm, width: 58, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  itemActive:{ backgroundColor: 'rgba(77,159,255,0.18)', borderColor: 'rgba(77,159,255,0.4)' },
  touchable: { alignItems: 'center', width: '100%', gap: 5 },
  time:      { color: COLORS.textMuted, fontSize: 11, fontWeight: '500' },
  timeActive:{ color: COLORS.accentLight },
  pop:       { color: COLORS.rainy, fontSize: 10, fontWeight: '500' },
  temp:      { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  tempActive:{ color: COLORS.accentLight },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  modalContent: { width: '100%', backgroundColor: '#0F1D35', borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  modalHeader:  { alignItems: 'center', marginBottom: SPACING.lg },
  modalTime:    { color: COLORS.textPrimary, fontSize: 24, fontWeight: '700' },
  modalDate:    { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  modalHero:    { alignItems: 'center', marginBottom: SPACING.xl },
  modalTemp:    { color: COLORS.textPrimary, fontSize: 48, fontWeight: '600', marginTop: SPACING.sm },
  modalDesc:    { color: COLORS.textSecondary, fontSize: 16, fontWeight: '500', marginTop: 4, textTransform: 'capitalize' },
  modalStats:   { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xl },
  statBox:      { alignItems: 'center', flex: 1 },
  statVal:      { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 8, marginBottom: 2 },
  statLabel:    { color: COLORS.textMuted, fontSize: 11 },
  closeBtn:     { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center' },
  closeBtnText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
});