import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';

const Tab = createBottomTabNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0A0F24',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0A1224', // Bottom Navigation Dark Background
            borderTopWidth: 1,
            borderTopColor: '#1A233D',
            elevation: 10,
            height: 75,
            paddingBottom: 15,
            paddingTop: 10,
            position: 'absolute',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 0.5,
          },
          tabBarActiveTintColor: '#8B5CF6',
          tabBarInactiveTintColor: '#475569',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'HOME') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'LEARN') iconName = focused ? 'book' : 'book-outline';
            else if (route.name === 'TRACK') iconName = focused ? 'location' : 'location-outline';
            else if (route.name === 'PROFILE') iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="HOME" component={HomeScreen} />
        <Tab.Screen name="LEARN" component={HomeScreen} />
        <Tab.Screen name="TRACK" component={HomeScreen} />
        <Tab.Screen name="PROFILE" component={HomeScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
