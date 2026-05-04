import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { COLORS } from '../constants/theme';

const NAV_ITEMS = [
  { name: 'Home',   icon: 'home',   route: '/' },
  { name: 'Search', icon: 'search', route: '/search' },
];

export function ResponsiveSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cloud-outline" size={32} color={COLORS.accent} />
        <Text style={styles.title}>Weather</Text>
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.route || (item.route === '/' && pathname === '/index');
          return (
            <Pressable
              key={item.name}
              onPress={() => router.push(item.route as any)}
              style={({ hovered }: any) => [
                styles.navItem,
                isActive && styles.navItemActive,
                hovered && styles.navItemHover,
              ]}
            >
              <Ionicons
                name={isActive ? (item.icon as any) : (`${item.icon}-outline` as any)}
                size={24}
                color={isActive ? COLORS.accent : COLORS.textMuted}
              />
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0 Stage 4</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: '#0F1D35',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingLeft: 8,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  nav: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  navItemHover: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  navItemActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  navText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  navTextActive: {
    color: COLORS.accent,
  },
  footer: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    opacity: 0.5,
  },
});
