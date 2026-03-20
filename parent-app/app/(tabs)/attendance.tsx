import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

export default function LearnScreen() {
  const { theme, isDark } = useTheme();
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const loginId = await AsyncStorage.getItem('parent_login_id');
        if (!loginId) { setLoading(false); return; }

        const response = await fetch(`http://10.32.136.136:8000/api/parent-dashboard/${loginId}`);
        const json = await response.json();
        setSyllabus(json.syllabus || []);
      } catch (err) {
        console.log('Syllabus fetch error:', err);
      }
      setLoading(false);
    };
    fetchSyllabus();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Learning & Syllabus</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : syllabus.length > 0 ? (
          syllabus.map((item, index) => (
            <View key={index} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}>
                  <Text style={styles.badgeTxt}>{item.subject}</Text>
                </View>
                <Text style={styles.progressTxt}>{item.progress}%</Text>
              </View>
              <Text style={[styles.chapterTitle, { color: theme.text }]}>{item.chapter}</Text>
              <Text style={[styles.teacherDesc, { color: theme.textSecondary }]}>Teacher: {item.teacher}</Text>
              
              <View style={[styles.progressTrack, { backgroundColor: isDark ? '#2A344A' : '#E2E8F0' }]}>
                 <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
             <Ionicons name="book-outline" size={60} color={theme.textSecondary} />
             <Text style={[styles.emptyTxt, { color: theme.textSecondary }]}>Syllabus data is currently unavailable.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 55, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },
  content: { padding: 20, paddingBottom: 100 },
  card: { padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeTxt: { color: '#3B82F6', fontSize: 12, fontWeight: '800' },
  progressTxt: { color: '#10B981', fontSize: 14, fontWeight: '900' },
  chapterTitle: { fontSize: 18, fontWeight: '800', marginBottom: 5 },
  teacherDesc: { fontSize: 12, fontWeight: '600', marginBottom: 15 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyTxt: { fontSize: 14, fontWeight: '600', marginTop: 15 }
});
