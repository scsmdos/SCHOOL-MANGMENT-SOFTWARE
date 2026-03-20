import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export default function CalendarScreen() {
  const { theme, isDark } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const BASE_URL = 'http://10.32.136.136:8000/api';

  const fetchEvents = useCallback(async () => {
    try {
      const loginId = await AsyncStorage.getItem('parent_login_id');
      if (!loginId) return;

      const response = await fetch(`${BASE_URL}/parent-dashboard/${loginId}`);
      const data = await response.json();
      setEvents(data.parentEvents || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <LinearGradient 
        colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#6366f1', '#4f46e5']} 
        style={styles.header}
      >
         <View style={styles.headerContent}>
            <View>
               <Text style={[styles.title, { color: '#FFF' }]}>CALENDAR</Text>
               <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : 'rgba(255,255,255,0.7)' }]}>SCHOOL EVENTS & HOLIDAYS</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
               <Ionicons name="refresh" size={20} color="#FFF" />
            </TouchableOpacity>
         </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      >
        {loading ? (
           <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 50 }} />
        ) : events.length === 0 ? (
           <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No events found</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>School events will appear here</Text>
           </View>
        ) : (
           events.map((item, index) => (
              <View key={index} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                 <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(79, 70, 229, 0.1)' }]}>
                       <Ionicons name="calendar" size={20} color={isDark ? '#8B5CF6' : '#4F46E5'} />
                    </View>
                    <View style={styles.cardTitleBox}>
                       <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                       <Text style={[styles.cardDate, { color: theme.textSecondary }]}>{item.date}{item.end_date && item.end_date !== item.date ? ` to ${item.end_date}` : ''}</Text>
                    </View>
                 </View>
                 
                 {item.description ? (
                    <View style={[styles.descBox, { backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.03)' }]}>
                       <Text style={[styles.descText, { color: theme.textSecondary }]}>{item.description}</Text>
                    </View>
                 ) : null}

                 <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                    <Text style={[styles.senderText, { color: theme.textSecondary }]}>TYPE: {item.type || 'EVENT'}</Text>
                 </View>
              </View>
           ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  subtitle: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  refreshBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  card: { borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitleBox: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 15, fontWeight: '900', textTransform: 'uppercase' },
  cardDate: { fontSize: 10, fontWeight: '700', marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1 },
  senderText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  descBox: { marginTop: 15, padding: 12, borderRadius: 10 },
  descText: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { fontSize: 18, fontWeight: '900', marginTop: 20 },
  emptySub: { fontSize: 12, fontWeight: '600', marginTop: 5 },
});
