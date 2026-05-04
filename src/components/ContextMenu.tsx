import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface ContextMenuProps {
  options: {
    label: string;
    icon: any;
    onPress: () => void;
  }[];
  children: React.ReactNode;
}

export function ContextMenu({ options, children }: ContextMenuProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onContextMenu = useCallback((e: any) => {
    if (Platform.OS !== 'web') return;
    e.preventDefault();
    
    // For React Native Web, e is a synthetic event or native event
    const pageX = e.nativeEvent?.pageX || e.pageX;
    const pageY = e.nativeEvent?.pageY || e.pageY;

    setPos({ x: pageX, y: pageY });
    setVisible(true);
  }, []);

  const close = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (visible) {
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [visible, close]);

  return (
    <View {...({ onContextMenu } as any)} style={{ flex: 1 }}>
      {children}
      
      {visible && (
        <Animated.View 
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
          style={[
            styles.menu, 
            { top: pos.y, left: pos.x }
          ]}
        >
          {options.map((opt, i) => (
            <Pressable
              key={opt.label}
              onPress={() => {
                opt.onPress();
                close();
              }}
              style={({ hovered }: any) => [
                styles.item,
                hovered && styles.itemHover,
                i < options.length - 1 && styles.border
              ]}
            >
              <Ionicons name={opt.icon} size={16} color={COLORS.textSecondary} />
              <Text style={styles.label}>{opt.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    backgroundColor: '#1A2B48',
    borderRadius: 8,
    padding: 4,
    minWidth: 160,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    gap: 10,
  },
  itemHover: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
});
