import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
      ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.12)'],
    ),
  }));
  return <Animated.View style={[{ width, height, borderRadius: RADIUS.sm }, anim, style]} />;
}

export default function SkeletonLoader() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Bone width={140} height={26} style={{ marginBottom: 6 }} />
          <Bone width={180} height={16} />
        </View>
        <View style={styles.actions}>
          <Bone width={38} height={38} style={{ borderRadius: 19 }} />
          <Bone width={38} height={38} style={{ borderRadius: 19 }} />
        </View>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Bone width={100} height={100} style={{ borderRadius: 50, marginBottom: SPACING.md }} />
        <Bone width={130} height={88} style={{ marginBottom: SPACING.sm }} />
        <Bone width={150} height={22} style={{ marginBottom: SPACING.md }} />
        <Bone width={180} height={36} style={{ borderRadius: 18 }} />
      </View>

      {/* Quick stats row */}
      <View style={styles.quickRowWrap}>
        <Bone width="100%" height={74} style={{ borderRadius: RADIUS.lg }} />
      </View>

      {/* Hourly */}
      <View style={styles.section}>
        <Bone width={110} height={16} style={{ marginBottom: SPACING.sm, marginLeft: SPACING.lg }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <Bone key={i} width={58} height={110} style={{ borderRadius: RADIUS.md }} />
          ))}
        </ScrollView>
      </View>

      {/* Daily */}
      <View style={styles.sectionWrap}>
        <Bone width={110} height={16} style={{ marginBottom: SPACING.sm }} />
        <View style={styles.dailyCard}>
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <View key={i} style={styles.dailyRow}>
               <Bone width={45} height={16} />
               <View style={styles.dailyMiddle}>
                 <Bone width={26} height={26} style={{ borderRadius: 13 }} />
                 <Bone width={90} height={14} />
               </View>
               <Bone width={60} height={16} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
  actions:      { flexDirection: 'row', gap: SPACING.sm },
  hero:         { alignItems: 'center', paddingTop: SPACING.md, paddingBottom: SPACING.xl },
  quickRowWrap: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  section:      { marginBottom: SPACING.lg },
  sectionWrap:  { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  scroll:       { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  dailyCard:    { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  dailyRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  dailyMiddle:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingHorizontal: 20 },
});