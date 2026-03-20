import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

export default function LibraryScreen() {
  const { theme, isDark } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const loginId = await AsyncStorage.getItem('parent_login_id');
        if (!loginId) { setLoading(false); return; }

        const response = await fetch(`http://10.32.136.136:8000/api/parent-dashboard/${loginId}`);
        const json = await response.json();
        setData(json.library || []);
      } catch (err) {
        console.log('Library fetch error:', err);
      }
      setLoading(false);
    };
    fetchLibrary();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Library & Issued Books</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : data.length > 0 ? (
          data.map((item, index) => (
            <View key={index} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.headerRow}>
                <View style={[styles.subBadge, { backgroundColor: isDark ? '#47556940' : '#E2E8F0' }]}>
                  <Text style={[styles.subText, { color: theme.textSecondary }]}>{item.book_id}</Text>
                </View>
                <View style={[styles.statusBadge, { 
                  backgroundColor: item.status === 'Returned' ? '#10B98120' : item.status === 'Overdue' ? '#F43F5E20' : '#0EA5E920' 
                }]}>
                  <Text style={[styles.statusText, { 
                    color: item.status === 'Returned' ? '#10B981' : item.status === 'Overdue' ? '#F43F5E' : '#0EA5E9' 
                  }]}>
                    {item.status || 'Issued'}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.bookTitle, { color: theme.text }]}>{item.book_title}</Text>
              
              <View style={styles.authorRow}>
                <Ionicons name="person-outline" size={12} color={theme.textSecondary} />
                <Text style={[styles.authorText, { color: theme.textSecondary }]}>Author: {item.author || 'N/A'}</Text>
              </View>

              <View style={[styles.footerRow, { borderTopColor: theme.border }]}>
                <View style={styles.dateInfo}>
                  <Ionicons name="log-out-outline" size={14} color={theme.textSecondary} />
                  <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Issued: </Text>
                  <Text style={[styles.dateValue, { color: theme.text }]}>{item.issue_date || 'N/A'}</Text>
                </View>
                <View style={styles.dateInfo}>
                  <Ionicons name="time-outline" size={14} color={item.status === 'Overdue' ? '#F43F5E' : theme.textSecondary} />
                  <Text style={[styles.dateLabel, { color: item.status === 'Overdue' ? '#F43F5E' : theme.textSecondary }]}>Due: </Text>
                  <Text style={[styles.dateValue, { color: item.status === 'Overdue' ? '#F43F5E' : theme.text }]}>{item.due_date || 'N/A'}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
             <Ionicons name="library-outline" size={60} color={theme.border} />
             <Text style={[styles.emptyTxt, { color: theme.textSecondary }]}>No active library issuances.</Text>
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
  subBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  subText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  bookTitle: { fontSize: 16, fontWeight: '800', lineHeight: 22, marginTop: 5 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  authorText: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, paddingTop: 12 },
  dateInfo: { flexDirection: 'row', alignItems: 'center' },
  dateLabel: { fontSize: 10, fontWeight: '600', marginLeft: 4 },
  dateValue: { fontSize: 11, fontWeight: '800' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyTxt: { fontSize: 14, fontWeight: '600', marginTop: 15 }
});
