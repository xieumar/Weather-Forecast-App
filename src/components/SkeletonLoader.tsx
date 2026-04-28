import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, interpolateColor,
} from 'react-native-reanimated';
import { SPACING, RADIUS } from '../constants/theme';

function Bone({ width, height, style }: { width: number | string; height: number; style?: object }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);
  const anim = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value, [0, 1],
      ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.14)'],
    ),
  }));
  return <Animated.View style={[{ width, height, borderRadius: RADIUS.sm }, anim, style]} />;
}

export default function SkeletonLoader() {
  return (
    <View style={styles.container}>
      <Bone width={160} height={24} style={styles.center} />
      <Bone width={100} height={14} style={[styles.center, { marginBottom: 40 }]} />
      <Bone width={120} height={80} style={[styles.center, { borderRadius: 12, marginBottom: 8 }]} />
      <Bone width={140} height={20} style={[styles.center, { marginBottom: 40 }]} />
      <View style={styles.row}>
        {[0,1,2].map(i => (
          <View key={i} style={styles.stat}>
            <Bone width={40} height={14} style={{ marginBottom: 6 }} />
            <Bone width={60} height={20} />
          </View>
        ))}
      </View>
      <View style={[styles.row, { marginTop: SPACING.lg }]}>
        {[0,1,2,3,4].map(i => <Bone key={i} width={50} height={70} style={{ borderRadius: 12 }} />)}
      </View>
      {[0,1,2,3,4].map(i => (
        <View key={i} style={styles.daily}>
          <Bone width={40} height={16} />
          <Bone width={32} height={32} style={{ borderRadius: 16 }} />
          <Bone width={60} height={16} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  center:    { alignSelf: 'center', marginBottom: 6 },
  row:       { flexDirection: 'row', justifyContent: 'space-around', gap: SPACING.sm },
  stat:      { alignItems: 'center', flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.md, padding: SPACING.md },
  daily:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md, paddingHorizontal: SPACING.sm },
});