import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  FadeInRight, FadeInDown,
} from 'react-native-reanimated';
import { router } from 'expo-router';

import { useWeatherContext } from '@/src/context/WeatherContext';
import WeatherIcon           from '@/src/components/WeatherIcon';
import ErrorView             from '@/src/components/ErrorView';
import { geocodeCity }       from '@/src/services/weatherApi';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import type { GeoResult } from '@/src/types/weather';

const POPULAR = ['London', 'New York', 'Tokyo', 'Paris', 'Dubai', 'Sydney', 'Lagos', 'Cairo'];

// ── Autocomplete result row ───────────────────────────────────────────────────
function CityResult({
  item, index, onPress,
}: { item: GeoResult; index: number; onPress: () => void }) {
  return (
    <Animated.View entering={FadeInRight.delay(index * 55).duration(280)}>
      <TouchableOpacity style={styles.resultRow} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.resultIcon}>
          <Ionicons name="location" size={17} color={COLORS.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.resultCity}>{item.name}</Text>
          <Text style={styles.resultSub}>
            {[item.state, item.country].filter(Boolean).join(', ')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={15} color={COLORS.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SearchScreen() {
  const { fetchByCity, loading, current, cityName } = useWeatherContext();

  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState<GeoResult[]>([]);
  const [searching,   setSearching]   = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Input border animation
  const borderAnim = useSharedValue(0);
  const inputStyle = useAnimatedStyle(() => ({
    borderColor: borderAnim.value === 1
      ? COLORS.accent
      : 'rgba(255,255,255,0.12)',
  }));

  // Debounced geocode as user types
  const handleChange = useCallback((text: string) => {
    setQuery(text);
    setSearchError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim() || text.length < 2) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const geo = await geocodeCity(text);
        setResults(geo);
        if (geo.length === 0) setSearchError(`No cities found for "${text}"`);
      } catch {
        setSearchError('Search failed. Check your connection.');
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const selectCity = useCallback(async (name: string) => {
    Keyboard.dismiss();
    setQuery(name);
    setResults([]);
    await fetchByCity(name);
    router.navigate('/');
  }, [fetchByCity]);

  const clearInput = () => { setQuery(''); setResults([]); setSearchError(null); };

  return (
    <LinearGradient colors={['#1A2E50', '#0B1426']} style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>

        {/* ── Title ──────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <Text style={styles.subtitle}>Find weather for any city</Text>
        </Animated.View>

        {/* ── Search input ────────────────────────────────────────────────── */}
        <Animated.View style={[styles.inputWrap, inputStyle]}>
          <Ionicons name="search" size={17} color={COLORS.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="Search for a city..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={handleChange}
            onFocus={() => { borderAnim.value = withSpring(1); }}
            onBlur={() => { borderAnim.value = withSpring(0); }}
            returnKeyType="search"
            onSubmitEditing={() => query.trim() && selectCity(query.trim())}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {searching && <ActivityIndicator size="small" color={COLORS.accent} />}
          {!searching && query.length > 0 && (
            <TouchableOpacity onPress={clearInput}>
              <Ionicons name="close-circle" size={17} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* ── Inline error ────────────────────────────────────────────────── */}
        {searchError && (
          <View style={styles.inlineError}>
            <Ionicons name="alert-circle-outline" size={13} color={COLORS.danger} />
            <Text style={styles.inlineErrorText}>{searchError}</Text>
          </View>
        )}

        {/* ── Autocomplete dropdown ────────────────────────────────────────── */}
        {results.length > 0 && (
          <View style={styles.dropdown}>
            {results.map((item, i) => (
              <CityResult
                key={`${item.lat}-${item.lon}`}
                item={item}
                index={i}
                onPress={() => selectCity(item.name)}
              />
            ))}
          </View>
        )}

        {/* ── Popular cities (shown when input is empty) ──────────────────── */}
        {!query && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Popular Cities</Text>
            <View style={styles.chips}>
              {POPULAR.map((city, i) => (
                <Animated.View key={city} entering={FadeInRight.delay(i * 45).duration(280)}>
                  <TouchableOpacity
                    style={styles.chip}
                    onPress={() => selectCity(city)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="location-outline" size={13} color={COLORS.accent} />
                    <Text style={styles.chipText}>{city}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {/* ── Current city card (shown when idle) ─────────────────────────── */}
        {current && !query && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Current Weather</Text>
            <TouchableOpacity
              style={styles.currentCard}
              onPress={() => router.navigate('/')}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.currentCity}>{cityName}</Text>
                <Text style={styles.currentCond}>
                  {current.weather[0].description.replace(/\b\w/g, c => c.toUpperCase())}
                </Text>
              </View>
              <WeatherIcon iconCode={current.weather[0].icon} size={42} animated />
              <Text style={styles.currentTemp}>{Math.round(current.main.temp)}°</Text>
            </TouchableOpacity>
          </View>
        )}

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: '#0B1426' },
  header:          { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.lg },
  title:           { color: COLORS.textPrimary, fontSize: 30, fontWeight: '700' },
  subtitle:        { color: COLORS.textMuted, fontSize: 14, marginTop: 3 },

  inputWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: SPACING.lg, borderRadius: RADIUS.round, paddingHorizontal: SPACING.md, paddingVertical: 13, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)', marginBottom: SPACING.sm },
  input:           { flex: 1, color: COLORS.textPrimary, fontSize: 15, padding: 0 },

  inlineError:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  inlineErrorText: { color: COLORS.danger, fontSize: 12 },

  dropdown:        { marginHorizontal: SPACING.lg, backgroundColor: '#1A2E50', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.glassBorder, overflow: 'hidden', marginBottom: SPACING.sm },
  resultRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  resultIcon:      { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(77,159,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  resultCity:      { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  resultSub:       { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },

  section:         { marginTop: SPACING.lg, paddingHorizontal: SPACING.lg },
  sectionLabel:    { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.md },

  chips:           { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip:            { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: RADIUS.round, paddingHorizontal: SPACING.md, paddingVertical: 9, borderWidth: 1, borderColor: COLORS.glassBorder },
  chipText:        { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },

  currentCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(77,159,255,0.1)', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(77,159,255,0.25)', gap: SPACING.sm },
  currentCity:     { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  currentCond:     { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  currentTemp:     { color: COLORS.accentLight, fontSize: 30, fontWeight: '200' },
}); 