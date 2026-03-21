import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { CONFIG } from '../../constants/Config';

const POLL_INTERVAL = 30000;

export default function ExamsScreen() {
  const { theme, isDark } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Ongoing' | 'Completed'>('All');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loginIdRef = useRef<string | null>(null);

  const fetchExams = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      if (!loginIdRef.current) {
        loginIdRef.current = await AsyncStorage.getItem('parent_login_id');
      }
      if (!loginIdRef.current) { setLoading(false); return; }

      const token = await AsyncStorage.getItem('parent_auth_token');
      const response = await fetch(`${CONFIG.BASE_URL}/parent-dashboard/${loginIdRef.current}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache' 
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      setData(json.exams || []);
    } catch (err) {
      console.log('Exams fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExams(true);
    pollingRef.current = setInterval(() => fetchExams(false), POLL_INTERVAL);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchExams]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExams(false);
  };

  const normalizeStatus = (s: string) => (s || 'Upcoming').toLowerCase();

  const filtered = filter === 'All' ? data : data.filter(e => {
    const st = normalizeStatus(e.status);
    if (filter === 'Completed') return st === 'completed';
    if (filter === 'Ongoing')   return st === 'ongoing';
    return st !== 'completed' && st !== 'ongoing';
  });

  const getStatusColor = (status: string) => {
    const s = normalizeStatus(status);
    if (s === 'completed') return { bg: '#10B98115', text: '#10B981', icon: 'checkmark-circle' as const };
    if (s === 'ongoing')   return { bg: '#F59E0B15', text: '#F59E0B', icon: 'time'           as const };
    return                        { bg: '#3B82F615', text: '#3B82F6', icon: 'calendar'        as const };
  };

  const ExamCard = ({ exam }: { exam: any }) => {
    const sc = getStatusColor(exam.status || 'Upcoming');
    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)' }]}>
            <Ionicons name="document-text" size={22} color="#EF4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.examName, { color: theme.text }]} numberOfLines={2}>{exam.exam_name || exam.name}</Text>
            {exam.term ? <Text style={[styles.termTag, { color: theme.textSecondary }]}>{exam.term}</Text> : null}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Ionicons name={sc.icon} size={11} color={sc.text} />
            <Text style={[styles.statusTxt, { color: sc.text }]}>{exam.status || 'Upcoming'}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.detailsGrid}>
          <DetailItem icon="book-outline" label="Subject" value={exam.subject || 'All Subjects'} theme={theme} isDark={isDark} />
          <DetailItem icon="calendar-outline" label="Date" value={exam.start_date || '--'} theme={theme} isDark={isDark} />
          <DetailItem icon="time-outline" label="Duration" value={exam.duration ? `${exam.duration} min` : 'N/A'} theme={theme} isDark={isDark} />
          <DetailItem icon="trophy-outline" label="Total Marks" value={exam.total_marks || 'N/A'} theme={theme} isDark={isDark} />
          <DetailItem icon="clipboard-outline" label="Exam Type" value={exam.type || 'Written'} theme={theme} isDark={isDark} />
          {exam.end_date && exam.end_date !== '--' && exam.end_date !== exam.start_date ? (
            <DetailItem icon="calendar" label="End Date" value={exam.end_date} theme={theme} isDark={isDark} />
          ) : null}
        </View>
      </View>
    );
  };

  const DetailItem = ({ icon, label, value, theme, isDark }: any) => (
    <View style={[styles.detailItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: theme.border }]}>
      <Ionicons name={icon} size={14} color={theme.textSecondary} />
      <View style={styles.detailText}>
        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>Exam Schedule</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{data.length} exam{data.length !== 1 ? 's' : ''} found</Text>
        </View>
      </View>

      <View style={[styles.filterRow, { backgroundColor: theme.header, borderColor: theme.border }]}>
        {(['All', 'Upcoming', 'Ongoing', 'Completed'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, { borderColor: theme.border }, filter === f && { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTxt, { color: theme.textSecondary }, filter === f && { color: '#FFF' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EF4444"
            colors={['#EF4444']}
          />
        }
      >
        {loading ? (
          <ActivityIndicator color="#EF4444" size="large" style={{ marginTop: 60 }} />
        ) : filtered.length > 0 ? (
          filtered.map((exam, index) => <ExamCard key={index} exam={exam} />)
        ) : (
          <View style={styles.empty}>
             <Ionicons name="calendar-outline" size={60} color={theme.border} />
             <Text style={[styles.emptyTxt, { color: theme.textSecondary }]}>No {filter !== 'All' ? filter.toLowerCase() : ''} exams found.</Text>
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
  subtitle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterTxt: { fontSize: 12, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 16, marginBottom: 16, borderWidth: 1, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  examName: { fontSize: 15, fontWeight: '800', flex: 1 },
  termTag: { fontSize: 11, fontWeight: '600', marginTop: 3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 4 },
  statusTxt: { fontSize: 10, fontWeight: '800' },
  divider: { height: 1, marginHorizontal: 16 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 14, gap: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', width: '46%', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  detailText: { flex: 1 },
  detailLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  detailValue: { fontSize: 12, fontWeight: '800', marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyTxt: { fontSize: 14, fontWeight: '600', marginTop: 15 },
});
