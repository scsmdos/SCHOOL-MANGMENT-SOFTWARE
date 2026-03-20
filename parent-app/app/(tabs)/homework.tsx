import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

export default function HomeworkScreen() {
  const { theme, isDark } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHW = async () => {
      try {
        const loginId = await AsyncStorage.getItem('parent_login_id');
        if (!loginId) { setLoading(false); return; }

        const response = await fetch(`http://10.32.136.136:8000/api/parent-dashboard/${loginId}`);
        const json = await response.json();
        setData(json.homework || []);
      } catch (err) {
        console.log('Homework fetch error:', err);
      }
      setLoading(false);
    };
    fetchHW();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Homework & Assignments</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : data.length > 0 ? (
          data.map((item, index) => (
            <View key={index} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.headerRow}>
                <View style={[styles.subBadge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}>
                  <Text style={styles.subText}>{item.subject}</Text>
                </View>
                <Text style={styles.dueDate}>Due: {item.due_date}</Text>
              </View>
              <Text style={[styles.desc, { color: theme.text }]}>{item.task}</Text>

              <View style={styles.assignedRow}>
                <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} />
                <Text style={[styles.assignedText, { color: theme.textSecondary }]}>Assigned: {item.assigned_date || 'N/A'}</Text>
              </View>
              
              <View style={[styles.footerRow, { borderTopColor: theme.border }]}>
                <View style={styles.teacherInfo}>
                  <Ionicons name="person-circle-outline" size={14} color={theme.textSecondary} />
                  <Text style={[styles.teacherName, { color: theme.textSecondary }]}>By: {item.teacher || 'N/A'}</Text>
                </View>
                <View style={styles.statusRow}>
                  <Ionicons name={item.status === 'Completed' || item.status === 'Submitted' ? 'checkmark-circle' : (item.status === 'Overdue' ? 'alert-circle' : 'time')} size={14} color={item.status === 'Completed' || item.status === 'Submitted' ? '#10B981' : (item.status === 'Overdue' ? '#EF4444' : '#F59E0B')} />
                  <Text style={[styles.statusText, { color: item.status === 'Completed' || item.status === 'Submitted' ? '#10B981' : (item.status === 'Overdue' ? '#EF4444' : '#F59E0B') }]}>
                    {item.status || 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
             <Ionicons name="document-text-outline" size={60} color={theme.textSecondary} />
             <Text style={[styles.emptyTxt, { color: theme.textSecondary }]}>Hooray! No homework pending.</Text>
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
  title: { fontSize: 20, fontWeight: '800' },
  content: { padding: 20 },
  card: { padding: 18, borderRadius: 16, marginBottom: 15, borderWidth: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  subBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  subText: { color: '#3B82F6', fontSize: 12, fontWeight: '800' },
  dueDate: { color: '#EF4444', fontSize: 11, fontWeight: '700' },
  desc: { fontSize: 14, fontWeight: '600', lineHeight: 22, marginTop: 5 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 11, fontWeight: '800', marginLeft: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, paddingTop: 12 },
  teacherInfo: { flexDirection: 'row', alignItems: 'center' },
  teacherName: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  assignedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  assignedText: { fontSize: 10, fontWeight: '600', marginLeft: 4, letterSpacing: 0.3 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyTxt: { fontSize: 14, fontWeight: '600', marginTop: 15 }
});
