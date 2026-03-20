import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Colors = {
  dark: {
    background: '#0A0F24',
    card: '#161D30',
    header: '#161D30',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    border: '#2A344A',
    accent: '#8B5CF6',
    tabBar: '#161D30',
    inputBg: 'rgba(255,255,255,0.05)',
  },
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    header: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    accent: '#4F46E5',
    tabBar: '#FFFFFF',
    inputBg: '#F1F5F9',
  }
};

type ThemeContextType = {
  isDark: boolean;
  theme: typeof Colors.dark;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then(val => {
      if (val) setIsDark(val === 'dark');
    });
  }, []);

  const toggleTheme = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    AsyncStorage.setItem('app_theme', newVal ? 'dark' : 'light');
  };

  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
