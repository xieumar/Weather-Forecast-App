import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, withDelay, Easing,
} from 'react-native-reanimated';
import { getWeatherIcon } from '../utils/weatherUtils';

interface Props { iconCode: string; size?: number; animated?: boolean }

function SunnyIcon({ size, color }: { size: number; color: string }) {
  const rotate = useSharedValue(0);
  const scale  = useSharedValue(1);
  useEffect(() => {
    rotate.value = withRepeat(withTiming(360, { duration: 8000, easing: Easing.linear }), -1);
    scale.value  = withRepeat(withSequence(withTiming(1.08, { duration: 2000 }), withTiming(1, { duration: 2000 })), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }, { scale: scale.value }] }));
  return <Animated.View style={style}><Ionicons name="sunny" size={size} color={color} /></Animated.View>;
}

function RainyIcon({ size, color }: { size: number; color: string }) {
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withRepeat(withSequence(withTiming(-4, { duration: 600 }), withTiming(0, { duration: 600 })), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  return <Animated.View style={style}><Ionicons name="rainy" size={size} color={color} /></Animated.View>;
}

function CloudyIcon({ size, color }: { size: number; color: string }) {
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withRepeat(withSequence(withTiming(5, { duration: 1800 }), withTiming(-5, { duration: 1800 })), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return <Animated.View style={style}><Ionicons name="cloudy" size={size} color={color} /></Animated.View>;
}

function ThunderIcon({ size, color }: { size: number; color: string }) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(withSequence(
      withDelay(2000, withTiming(0.3, { duration: 80 })),
      withTiming(1, { duration: 80 }),
      withDelay(150, withTiming(0.3, { duration: 80 })),
      withTiming(1, { duration: 80 }),
    ), -1);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={style}><Ionicons name="thunderstorm" size={size} color={color} /></Animated.View>;
}

function SnowIcon({ size, color }: { size: number; color: string }) {
  const rotate = useSharedValue(0);
  useEffect(() => {
    rotate.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }));
  return <Animated.View style={style}><Ionicons name="snow" size={size} color={color} /></Animated.View>;
}

export default function WeatherIcon({ iconCode, size = 64, animated = true }: Props) {
  const { name, color } = getWeatherIcon(iconCode);

  if (!animated) return <Ionicons name={name as any} size={size} color={color} />;
  if (name === 'sunny' || name === 'partly-sunny') return <SunnyIcon  size={size} color={color} />;
  if (name === 'rainy')                            return <RainyIcon  size={size} color={color} />;
  if (name === 'cloudy' || name === 'cloud')       return <CloudyIcon size={size} color={color} />;
  if (name === 'thunderstorm')                     return <ThunderIcon size={size} color={color} />;
  if (name === 'snow')                             return <SnowIcon   size={size} color={color} />;
  return <Ionicons name={name as any} size={size} color={color} />;
}