import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { CONFIG } from '../../constants/Config';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AttendanceCalendarScreen() {
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [allRecords, setAllRecords] = useState<any[]>([]);

  // Month filter state
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-based
  const [selectedYear]  = useState(today.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Derived from filter
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [stats, setStats]   = useState({ present: 0, absent: 0, late: 0, total: 0 });
  const [currentMonth, setCurrentMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
  );

  // --- Fetch all attendance records for this student ---
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const loginId   = await AsyncStorage.getItem('parent_login_id');
      const token     = await AsyncStorage.getItem('parent_auth_token');
      const studentId = await AsyncStorage.getItem('selected_student_id');

      if (!loginId) { setLoading(false); return; }

      // Try getting student id from dashboard if not cached
      let sid = studentId;
      if (!sid) {
        const dash = await fetch(`${CONFIG.BASE_URL}/parent-dashboard/${loginId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const dashData = await dash.json();
        sid = dashData?.parent?.student_profile?.id?.toString() || null;
      }

      if (!sid) { setLoading(false); return; }

      const res  = await fetch(`${CONFIG.BASE_URL}/student-attendance?student_id=${sid}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      const records = data?.data ?? data ?? [];
      setAllRecords(records);
    } catch (err) {
      console.log('Attendance fetch error:', err);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
       fetchAttendance();
    }, [fetchAttendance])
  );

  // --- Re-process whenever records or selected month change ---
  useEffect(() => {
    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    const prefix   = `${selectedYear}-${monthStr}`;

    const filtered = allRecords.filter(r => (r.attendance_date || r.date || '').startsWith(prefix));

    const markers: Record<string, any> = {};
    let p = 0, a = 0, l = 0;

    filtered.forEach((item: any) => {
      const dateKey = item.attendance_date || item.date;
      const status  = (item.status || '').toLowerCase();
      let color = '#94A3B8'; // default grey
      if (status === 'present') { color = '#10B981'; p++; }
      else if (status === 'absent') { color = '#F43F5E'; a++; }
      else if (status === 'half-day' || status === 'halfday' || status === 'h') { color = '#F59E0B'; l++; }

      markers[dateKey] = {
        marked: true,
        customStyles: {
          container: { backgroundColor: color, borderRadius: 8, elevation: 2 },
          text: { color: '#FFF', fontWeight: '900' }
        }
      };
    });

    setMarkedDates(markers);
    setStats({ present: p, absent: a, late: l, total: filtered.length });
    setCurrentMonth(`${selectedYear}-${monthStr}-01`);
  }, [allRecords, selectedMonth, selectedYear]);

  const percentage = stats.total > 0
    ? Math.round((stats.present / stats.total) * 100)
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>RECORD TRACKING</Text>
          <Text style={[styles.title,     { color: theme.text }]}>Student Attendance</Text>
        </View>
        <TouchableOpacity style={[styles.refreshIcon, { backgroundColor: theme.card }]} onPress={fetchAttendance}>
          <Ionicons name="refresh" size={18} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Month Selector Row */}
            <View style={styles.monthRow}>
              <TouchableOpacity
                style={[styles.monthBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => setShowMonthPicker(true)}
              >
                <Ionicons name="calendar-outline" size={16} color={theme.accent} />
                <Text style={[styles.monthBtnTxt, { color: theme.text }]}>
                  {MONTHS[selectedMonth]} {selectedYear}
                </Text>
                <Ionicons name="chevron-down" size={14} color={theme.textSecondary} />
              </TouchableOpacity>
              <View style={[styles.pctBadge, { backgroundColor: percentage >= 75 ? '#10B981' : '#F43F5E' }]}>
                <Text style={styles.pctTxt}>{percentage}%</Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <StatBox value={stats.present} label="PRESENT" accent="#10B981" theme={theme} />
              <StatBox value={stats.absent}  label="ABSENT"  accent="#F43F5E" theme={theme} />
              <StatBox value={stats.late}    label="HALFDAY" accent="#F59E0B" theme={theme} />
            </View>

            {/* Calendar */}
            <View style={[styles.calendarCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Calendar
                key={currentMonth}
                current={currentMonth}
                markingType="custom"
                markedDates={markedDates}
                hideArrows={true}
                disableMonthChange={true}
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: theme.textSecondary,
                  todayTextColor: theme.accent,
                  dayTextColor: theme.text,
                  textDisabledColor: isDark ? '#334155' : '#CBD5E1',
                  monthTextColor: theme.text,
                  textDayFontWeight: '700',
                  textMonthFontWeight: '900',
                  textDayHeaderFontWeight: '700',
                  textDayFontSize: 13,
                  textMonthFontSize: 16,
                }}
              />
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              {[['#10B981', 'Present'], ['#F43F5E', 'Absent'], ['#F59E0B', 'Half-day']].map(([c, l]) => (
                <View key={l} style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: c }]} />
                  <Text style={[styles.legendTxt, { color: theme.textSecondary }]}>{l}</Text>
                </View>
              ))}
            </View>

            {/* Recent list */}
            {stats.total === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="calendar-outline" size={48} color={theme.border} />
                <Text style={[styles.emptyTxt, { color: theme.textSecondary }]}>
                  No records for {MONTHS[selectedMonth]}
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>All Records – {MONTHS[selectedMonth]}</Text>
                {allRecords
                  .filter(r => (r.attendance_date || r.date || '').startsWith(
                    `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`
                  ))
                  .sort((a, b) => (b.attendance_date || b.date || '').localeCompare(a.attendance_date || a.date || ''))
                  .map((h, i) => {
                    const status  = (h.status || '').toLowerCase();
                    const color   = status === 'present' ? '#10B981' : (status === 'half-day' || status === 'halfday' || status === 'h') ? '#F59E0B' : '#F43F5E';
                    const dateStr = h.attendance_date || h.date;
                    return (
                      <View key={i} style={[styles.logItem, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
                        <View style={[styles.statusLine, { backgroundColor: color }]} />
                        <View style={styles.logMeta}>
                          <Text style={[styles.logDate, { color: theme.text }]}>
                            {new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                          </Text>
                        </View>
                        <View style={[styles.logBadge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
                          <Text style={[styles.logStatus, { color }]}>{status.toUpperCase()}</Text>
                        </View>
                      </View>
                    );
                  })}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal visible={showMonthPicker} transparent animationType="slide" onRequestClose={() => setShowMonthPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={[styles.pickerSheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.pickerTitle, { color: theme.text }]}>Select Month</Text>
            <FlatList
              data={MONTHS}
              keyExtractor={(_, i) => String(i)}
              numColumns={3}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    { borderColor: selectedMonth === index ? theme.accent : theme.border },
                    selectedMonth === index && { backgroundColor: theme.accent + '15' }
                  ]}
                  onPress={() => { setSelectedMonth(index); setShowMonthPicker(false); }}
                >
                  <Text style={[
                    styles.pickerItemTxt,
                    { color: selectedMonth === index ? theme.accent : theme.text }
                  ]}>{item.slice(0, 3).toUpperCase()}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ gap: 10 }}
              columnWrapperStyle={{ gap: 10 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const StatBox = ({ value, label, accent, theme }: any) => (
  <View style={[styles.statBox, { backgroundColor: theme.card, borderBottomColor: accent }]}>
    <Text style={[styles.statVal, { color: theme.text }]}>{value}</Text>
    <Text style={[styles.statLab, { color: theme.textSecondary }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20, paddingTop: 55, paddingBottom: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerSub: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 0.3, marginTop: 2 },
  refreshIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  content: { padding: 20, paddingBottom: 120 },

  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  monthBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
  },
  monthBtnTxt: { fontSize: 14, fontWeight: '800' },
  pctBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  pctTxt: { color: '#FFF', fontSize: 13, fontWeight: '900' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, padding: 14, borderRadius: 16, borderBottomWidth: 3, elevation: 1, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  statLab: { fontSize: 8, fontWeight: '900', marginTop: 3, letterSpacing: 0.5, textAlign: 'center' },

  calendarCard: { borderRadius: 20, padding: 8, borderWidth: 1, marginBottom: 18, overflow: 'hidden' },

  legend: { flexDirection: 'row', gap: 18, justifyContent: 'center', marginBottom: 28 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  sectionTitle: { fontSize: 15, fontWeight: '900', marginBottom: 12 },
  logItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 14, marginBottom: 8,
    borderBottomWidth: 0,
  },
  statusLine: { width: 4, height: 28, borderRadius: 2, marginRight: 14 },
  logMeta: { flex: 1 },
  logDate: { fontSize: 13, fontWeight: '800' },
  logBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  logStatus: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  empty: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyTxt: { fontSize: 14, fontWeight: '700', marginTop: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, borderWidth: 1,
  },
  pickerTitle: { fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  pickerItem: {
    flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  pickerItemTxt: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
});
