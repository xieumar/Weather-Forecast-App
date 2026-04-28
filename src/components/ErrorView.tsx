import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import type { AppError } from '../types/weather';

const ERROR_ICONS: Record<string, string> = {
  network: 'wifi-outline', timeout: 'time-outline', not_found: 'search-outline',
  rate_limit: 'hourglass-outline', invalid_key: 'key-outline',
  location: 'location-outline', server: 'server-outline', unknown: 'alert-circle-outline',
};

interface Props {
  error:     AppError | null;
  onRetry?:  () => void;
  compact?:  boolean;
}

export default function ErrorView({ error, onRetry, compact = false }: Props) {
  const scale = useSharedValue(1);

  const handleRetry = () => {
    scale.value = withSequence(withSpring(0.92), withSpring(1));
    onRetry?.();
  };

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const iconName = ERROR_ICONS[error?.type ?? 'unknown'] ?? 'alert-circle-outline';

  if (compact) {
    return (
      <View style={styles.compact}>
        <Ionicons name="warning-outline" size={14} color={COLORS.warning} />
        <Text style={styles.compactText}>{error?.message}</Text>
        {onRetry && <TouchableOpacity onPress={handleRetry}><Text style={styles.retrySmall}>Retry</Text></TouchableOpacity>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={iconName as any} size={52} color={COLORS.textMuted} />
      </View>
      <Text style={styles.title}>{error?.type === 'network' ? 'No Connection' : 'Something went wrong'}</Text>
      <Text style={styles.message}>{error?.message}</Text>
      {onRetry && (
        <Animated.View style={btnStyle}>
          <TouchableOpacity style={styles.btn} onPress={handleRetry}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  iconWrap:    { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  title:       { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: SPACING.sm },
  message:     { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xl },
  btn:         { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accent, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.round },
  btnText:     { color: '#fff', fontSize: 15, fontWeight: '600' },
  compact:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,213,102,0.12)', borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  compactText: { color: COLORS.warning, fontSize: 12, flex: 1 },
  retrySmall:  { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
});