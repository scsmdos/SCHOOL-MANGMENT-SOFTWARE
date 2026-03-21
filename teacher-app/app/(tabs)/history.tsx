import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, ScrollView, Platform, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar as LucideCalendar, Clock, MapPin, CheckCircle, XCircle, Users, Feather } from 'lucide-react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { CONFIG } from '../../constants/Config';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function HistoryScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date());

  useEffect(() => {
    (async () => {
      try {
        const storedRole = await AsyncStorage.getItem('userRole');
        const storedData = await AsyncStorage.getItem('userData');
        
        if (!storedRole || !storedData) {
          return router.replace('/login');
        }

        setRole(storedRole);
        const data = JSON.parse(storedData);
        if (storedRole === 'teacher') {
          fetchTeacherHistory(data.employee_id);
        } else {
          fetchClassHistory(data.class_name);
        }
      } catch (err) {
        console.error('History auth error:', err);
        router.replace('/login');
      }
    })();
  }, []);

  const fetchTeacherHistory = async (empId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${CONFIG.API_URL}/teacher-attendance/history/${empId}`);
      setHistory(res.data);
    } catch (err) {
      console.error('Teacher history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassHistory = async (className: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${CONFIG.API_URL}/class-attendance/history/${className}`);
      setHistory(res.data);
    } catch (err) {
      console.error('Class history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setFilterDate(selectedDate);
    }
  };

  const filteredHistory = history.filter(h => {
    const itemDate = new Date(h.attendance_date || h.created_at).toLocaleDateString();
    return itemDate === filterDate.toLocaleDateString();
  });

  const dayStats = {
    present: filteredHistory.length > 0 ? (filteredHistory[0].present || (filteredHistory[0].status === 'Present' ? 1 : 0)) : 0,
    absent: filteredHistory.length > 0 ? (filteredHistory[0].absent || (filteredHistory[0].status === 'Absent' ? 1 : 0)) : 0,
    total: filteredHistory.length > 0 ? (filteredHistory[0].total || 1) : 0
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Attendance History</Text>
        <TouchableOpacity 
          style={[styles.filterBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setShowPicker(true)}
        >
          <Text style={[styles.filterText, { color: theme.accent }]}>{filterDate.toLocaleDateString()}</Text>
          <Feather name="calendar" size={16} color={theme.accent} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={filterDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statsHeader}>
            <LucideCalendar size={18} color={theme.accent} />
            <Text style={[styles.statsDate, { color: theme.text }]}>{filterDate.toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>{dayStats.present}</Text>
              <Text style={[styles.statLabel, { color: theme.text, opacity: 0.6 }]}>PRESENT</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{dayStats.absent}</Text>
              <Text style={[styles.statLabel, { color: theme.text, opacity: 0.6 }]}>ABSENT</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent }]}>{dayStats.total}</Text>
              <Text style={[styles.statLabel, { color: theme.text, opacity: 0.6 }]}>TOTAL</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 40 }} />
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((item, index) => (
            <View key={index} style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {role === 'teacher' ? (
                <View style={styles.teacherRow}>
                  <View style={styles.roleInfo}>
                    <Clock size={16} color={theme.accent} />
                    <Text style={[styles.timeText, { color: theme.text }]}>{item.time || 'N/A'}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'Present' ? '#10b981' : '#ef4444' }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.studentInfo}>
                  <View style={styles.studentRow}>
                    <Text style={[styles.studentName, { color: theme.text }]}>Class Records</Text>
                    <Text style={[styles.classLabel, { color: theme.accent }]}>{item.class_name}</Text>
                  </View>
                  <Text style={[styles.subText, { color: theme.text, opacity: 0.6 }]}>Check back individual logs in Admin</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyView}>
            <LucideCalendar size={64} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No records found for this date.</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation Padding */}
      <View style={{ height: 80 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    flex: 1,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statsDate: {
    fontSize: 16,
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  itemCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  teacherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  studentInfo: {},
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '900',
  },
  classLabel: {
    fontSize: 12,
    fontWeight: '900',
  },
  subText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyView: {
    paddingVertical: 100,
    alignItems: 'center',
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: '800',
  }
});
