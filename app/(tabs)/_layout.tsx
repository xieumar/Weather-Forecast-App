import { COLORS } from '@/src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResponsiveSidebar } from '@/src/components/ResponsiveSidebar';

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  return (
    <View style={styles.container}>
      {isDesktop && <ResponsiveSidebar />}
      
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: '#0B1426' },
            tabBarStyle: isDesktop ? { display: 'none' } : {
              backgroundColor: '#0F1D35',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.08)',
              elevation: 0,
              shadowOpacity: 0,
              height: 60 + bottom,
              paddingBottom: bottom,
              paddingTop: 8,
            },
            tabBarActiveTintColor: COLORS.accent,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Search',
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0B1426',
  },
  content: {
    flex: 1,
  },
});