import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { CONFIG } from '../../constants/Config';

export default function TimetableScreen() {
  const { theme, isDark } = useTheme();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const loginId = await AsyncStorage.getItem('parent_login_id');
        const token = await AsyncStorage.getItem('parent_auth_token');
        const sid = await AsyncStorage.getItem('selected_student_id');
        
        if (!loginId) { setLoading(false); return; }

        const url = `${CONFIG.BASE_URL}/parent-dashboard/${loginId}${sid ? `?student_id=${sid}` : ''}`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const json = await response.json();
        setSchedule(json.timetable || []);
      } catch (err) {
        console.log('Timetable fetch error:', err);
      }
      setLoading(false);
    };
    fetchTimetable();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Timetable</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : schedule.length > 0 ? (
          schedule.map((item, index) => (
            <View key={index} style={styles.card}>
               <View style={[styles.timeLine, { borderColor: theme.border }]}>
                  <View style={styles.dot} />
                  <Text style={[styles.timeText, { color: isDark ? '#8B5CF6' : '#6366F1' }]}>{item.start_time} - {item.end_time}</Text>
               </View>
               <View style={[styles.cardInner, { backgroundColor: theme.card, borderColor: theme.border }]}>
                 <View style={styles.cardHeader}>
                   <Text style={[styles.subject, { color: theme.text }]}>{item.subjectName}</Text>
                   <View style={styles.dayBadge}>
                     <Text style={styles.dayText}>{item.day?.substring(0, 3).toUpperCase()}</Text>
                   </View>
                 </View>
                 <Text style={[styles.teacher, { color: theme.textSecondary }]}>Teacher: {item.teacherName}</Text>
                 <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                   <Text style={[styles.period, { color: isDark ? '#A78BFA' : '#4F46E5' }]}>Period: {item.period}</Text>
                   <Text style={styles.room}>Room: {item.roomNo || 'N/A'}</Text>
                 </View>
               </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear-outline" size={60} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No Timetable Found for Today.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 55, borderBottomWidth: 1 },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  content: { padding: 20 },
  card: { flexDirection: 'row', marginBottom: 20 },
  timeLine: { width: 80, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 5, paddingRight: 10, borderRightWidth: 1 },
  timeText: { fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981', position: 'absolute', right: -6.5, top: 15 },
  cardInner: { flex: 1, padding: 15, borderRadius: 16, marginLeft: 20, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  subject: { fontSize: 16, fontWeight: '800' },
  dayBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  dayText: { color: '#10B981', fontSize: 9, fontWeight: '900' },
  teacher: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, paddingTop: 8 },
  period: { fontSize: 11, fontWeight: '800' },
  room: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 14, fontWeight: '600', marginTop: 15 }
});
