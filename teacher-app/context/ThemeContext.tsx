import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    bg: '#F8FAFC',
    panel: '#FFFFFF',
    text: '#0F172A',
    textDim: '#64748B',
    accent: '#6366F1',
    border: '#E2E8F0',
    tabBar: '#FFFFFF',
    card: '#FFFFFF',
    success: '#10B981',
    error: '#F43F5E',
  },
  dark: {
    bg: '#0F172A',
    panel: '#1E293B',
    text: '#F8FAFC',
    textDim: '#94A3B8',
    accent: '#818CF8',
    border: '#334155',
    tabBar: '#1E293B',
    card: '#1E293B',
    success: '#34D399',
    error: '#FB7185',
  }
};

const ThemeContext = createContext({
  theme: Colors.light,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme: () => setIsDark(!isDark) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
