import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring, withTiming,
  ZoomIn
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import DailyForecast from '@/src/components/DailyForecast';
import ErrorView from '@/src/components/ErrorView';
import HourlyForecast from '@/src/components/HourlyForecast';
import SkeletonLoader from '@/src/components/SkeletonLoader';
import WeatherIcon from '@/src/components/WeatherIcon';
import WeatherStats from '@/src/components/WeatherStats';
import { COLORS, RADIUS, SPACING } from '@/src/constants/theme';
import { useWeatherContext } from '@/src/context/WeatherContext';
import { useLocation } from '@/src/hooks/useLocation';
import { loadLastCity } from '@/src/services/cacheService';
import {
  fullDate,
  getGradientForCondition,
} from '@/src/utils/weatherUtils';
import { Platform, Pressable } from 'react-native';
import { useKeyboardShortcuts } from '@/src/hooks/useKeyboardShortcuts';
import { ContextMenu } from '@/src/components/ContextMenu';

export default function HomeScreen() {
  useKeyboardShortcuts();
  const {
    current, daily, hourly, loading, error, isOffline,
    fetchByCoords, fetchByCity, cityName, refetch,
  } = useWeatherContext();

  const { coords, permissionStatus, loading: locLoading } = useLocation();

  const [showSplash, setShowSplash] = useState(false);

  // Animations
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const tempScale = useSharedValue(0.6);
  const tempOpacity = useSharedValue(0);
  const pulseFn = useSharedValue(1);

  useEffect(() => {
    if (current) {
      tempScale.value = withSpring(1, { damping: 12, stiffness: 120 });
      tempOpacity.value = withTiming(1, { duration: 600 });
    }
  }, [current]);

  useEffect(() => {
    if (isOffline) {
      pulseFn.value = withSequence(
        withTiming(1.05, { duration: 600 }),
        withTiming(0.95, { duration: 600 }),
        withTiming(1, { duration: 400 }),
      );
    }
  }, [isOffline]);

  // Fetch on location
  useEffect(() => {
    if (coords) {
      fetchByCoords(coords.lat, coords.lon);
    } else if (permissionStatus === 'denied') {
      loadLastCity().then(city => { if (city) fetchByCity(city); });
    }
  }, [coords, permissionStatus]);

  const rotation = useSharedValue(0);

  const onRefreshClick = useCallback(() => {
    setShowSplash(true);
    rotation.value = withTiming(rotation.value + 360, { duration: 700, easing: Easing.out(Easing.cubic) });

    Promise.all([
      refetch(),
      new Promise(resolve => setTimeout(resolve, 800))
    ]).finally(() => {
      setShowSplash(false);
    });
  }, [refetch]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const tempStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tempScale.value }],
    opacity: tempOpacity.value,
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseFn.value }],
  }));
  const refreshStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const gradient = getGradientForCondition(current?.weather[0]?.icon);

  // Loading
  if ((loading || locLoading) && !current) {
    return (
      <LinearGradient colors={[...gradient]} style={styles.screen}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}><SkeletonLoader /></SafeAreaView>
      </LinearGradient>
    );
  }

  // Fatal error
  if (error && !current) {
    return (
      <LinearGradient colors={[...gradient]} style={styles.screen}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <ErrorView
            error={error}
            onRetry={permissionStatus === 'denied'
              ? () => router.push('./search')
              : onRefresh}
          />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <ContextMenu
      options={[
        { label: 'Refresh Weather', icon: 'refresh', onPress: onRefreshClick },
        { label: 'Copy Summary',    icon: 'copy-outline', onPress: () => {
          if (current) {
            const summary = `${current.name}: ${Math.round(current.main.temp)}°, ${current.weather[0].description}`;
            if (Platform.OS === 'web') navigator.clipboard.writeText(summary);
          }
        }},
        { label: 'Search City',     icon: 'search',  onPress: () => router.push('/search') },
      ]}
    >
      <LinearGradient colors={[...gradient]} style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Animated.Text entering={FadeInDown.duration(400)} style={styles.city}>
              {current?.name}{current?.sys?.country ? `, ${current.sys.country}` : ''}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(100).duration(400)} style={styles.date}>
              {current ? fullDate(current.dt) : ''}
            </Animated.Text>
          </View>
          <View style={styles.actions}>
            {isOffline && <Animated.View style={[styles.offlineDot, pulseStyle]} />}
            <TouchableOpacity style={styles.btn} onPress={onRefreshClick}>
              <Animated.View style={refreshStyle}>
                <Ionicons name="refresh" size={22} color={COLORS.textSecondary} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Offline / error banner */}
        {error && current && (
          <View style={styles.banner}>
            <Ionicons name="wifi-outline" size={13} color={COLORS.warning} />
            <Text style={styles.bannerText}>{error.message}</Text>
          </View>
        )}

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={loading && !!current} onRefresh={onRefresh} tintColor={COLORS.accent} />
          }
        >
          {/* Hero */}
          <View style={styles.hero}>
            <Animated.View entering={ZoomIn.delay(200).duration(500)}>
              <WeatherIcon iconCode={current?.weather[0]?.icon ?? '01d'} size={100} animated />
            </Animated.View>

            <Animated.Text style={[styles.temp, tempStyle]}>
              {Math.round(current?.main?.temp ?? 0)}°
            </Animated.Text>

            <Animated.Text entering={FadeInDown.delay(300).duration(400)} style={styles.condition}>
              {current?.weather[0]?.description?.replace(/\b\w/g, c => c.toUpperCase()) ?? ''}
            </Animated.Text>

            {/* High / Low badges */}
            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.badges}>
              <View style={styles.badge}>
                <Ionicons name="chevron-up" size={12} color={COLORS.textMuted} />
                <Text style={styles.badgeLabel}>High</Text>
                <Text style={styles.badgeValue}>{Math.round(current?.main?.temp_max ?? 0)}°</Text>
              </View>
              <View style={styles.sep} />
              <View style={styles.badge}>
                <Ionicons name="chevron-down" size={12} color={COLORS.textMuted} />
                <Text style={styles.badgeLabel}>Low</Text>
                <Text style={styles.badgeValue}>{Math.round(current?.main?.temp_min ?? 0)}°</Text>
              </View>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.quickRow}>
            {[
              { icon: 'water-outline',    label: 'Humidity', val: `${current?.main?.humidity}%` },
              { icon: 'flag-outline',     label: 'Wind',     val: `${Math.round((current?.wind?.speed ?? 0) * 3.6)} km/h` },
              { icon: 'umbrella-outline', label: 'Rain',     val: `${current?.clouds?.all ?? 0}%` },
            ].map(({ icon, label, val }) => (
              <Pressable key={label} style={({ hovered }: any) => [
                styles.quickItem,
                hovered && { transform: [{ scale: 1.05 }], backgroundColor: 'rgba(255,255,255,0.05)' }
              ]}>
                <Ionicons name={icon as any} size={16} color={COLORS.accentLight} />
                <Text style={styles.quickLabel}>{label}</Text>
                <Text style={styles.quickVal}>{val}</Text>
              </Pressable>
            ))}
          </Animated.View>

          {hourly.length > 0 && <HourlyForecast hourly={hourly} />}

          {daily.length > 0 && (
            <DailyForecast daily={daily} scrollY={scrollY} onDayPress={() => router.push('./forecast')} />
          )}

          {current && <WeatherStats current={current} scrollY={scrollY} />}
          <View style={{ height: 20 }} />
        </Animated.ScrollView>

        {showSplash && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(300)}
            style={[StyleSheet.absoluteFill, { zIndex: 100 }]}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(11,20,38,0.92)', justifyContent: 'center', alignItems: 'center' }]}>
              <WeatherIcon iconCode={current?.weather[0]?.icon ?? '02d'} size={100} animated />
              <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: '600', marginTop: SPACING.xl, marginBottom: SPACING.md }}>
                Updating Forecast...
              </Text>
              <ActivityIndicator size="small" color={COLORS.accent} />
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </LinearGradient>
    </ContextMenu>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
  city: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700', letterSpacing: 0.2 },
  date: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  btn: { padding: 8 },
  offlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.warning, marginRight: 4 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,209,102,0.1)', marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,209,102,0.2)' },
  bannerText: { color: COLORS.warning, fontSize: 12, flex: 1 },
  hero: { alignItems: 'center', paddingTop: SPACING.md, paddingBottom: SPACING.xl },
  temp: { color: COLORS.textPrimary, fontSize: 88, fontWeight: '200', letterSpacing: -4, marginTop: SPACING.sm, includeFontPadding: false },
  condition: { color: COLORS.textSecondary, fontSize: 18, fontWeight: '500', marginTop: -SPACING.sm, marginBottom: SPACING.md },
  badges: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: RADIUS.round, paddingHorizontal: SPACING.lg, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.glassBorder },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgeLabel: { color: COLORS.textMuted, fontSize: 13 },
  badgeValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  sep: { width: 1, height: 16, backgroundColor: COLORS.glassBorder, marginHorizontal: SPACING.md },
  quickRow: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: SPACING.lg, marginBottom: SPACING.xl, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.glassBorder, paddingVertical: SPACING.md },
  quickItem: { alignItems: 'center', gap: 4, flex: 1 },
  quickLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500' },
  quickVal: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
});