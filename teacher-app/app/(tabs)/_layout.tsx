import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { theme, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
           backgroundColor: theme.tabBar,
           borderTopColor: theme.border,
           height: 70,
           paddingBottom: 15,
           paddingTop: 10,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: isDark ? '#475569' : '#94A3B8',
        tabBarLabelStyle: {
           fontSize: 10,
           fontWeight: '900',
           letterSpacing: 0.5,
           textTransform: 'uppercase'
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ATTENDANCE',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'calendar' : 'calendar-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'HISTORY',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'time' : 'time-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'ACCOUNT',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'person' : 'person-outline'} color={color} />,
        }}
      />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
