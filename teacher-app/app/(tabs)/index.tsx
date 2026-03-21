import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, FlatList, 
  Image, ActivityIndicator, Alert, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Users, CheckCircle2 } from 'lucide-react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { CONFIG } from '../../constants/Config';

const API_URL = CONFIG.API_URL;

export default function AttendanceScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const storedRole = await AsyncStorage.getItem('userRole');
        const storedData = await AsyncStorage.getItem('userData');
        
        if (!storedRole || storedRole !== 'class' || !storedData) {
          return router.replace('/login');
        }

        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        fetchStudents(parsedData.class_name);
      } catch (err) {
        console.error('Auth check error:', err);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchStudents = async (className: string) => {
    try {
      const res = await axios.get(`${API_URL}/class-students/${className}`);
      setStudents(res.data);
      const initial: Record<number, string> = {};
      res.data.forEach((s: any) => initial[s.id] = 'Present');
      setAttendance(initial);
    } catch (err) { console.error(err); }
  };

  const handleToggleAttendance = (id: number, status: string) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const submitStudentAttendance = async () => {
    Alert.alert('Confirm Submission', `Submit attendance for ${students.length} students?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit Now', onPress: async () => {
          setLoading(true);
          try {
            const records = students.map(s => ({
              student_id: s.id,
              student_name: s.student_name,
              class_name: s.admitted_into_class || userData.class_name,
              section: s.section || 'A',
              status: attendance[s.id] || 'Present',
              attendance_date: new Date().toISOString().split('T')[0]
            }));
            await axios.post(`${API_URL}/student-attendance/bulk`, { records });
            Alert.alert('Success', 'Attendance for ' + userData.class_name + ' has been saved.');
          } catch (err) { 
            console.error(err);
            Alert.alert('Sync failed', 'Check your connection and try again.'); 
          }
          finally { setLoading(false); }
      }}
    ]);
  };

  if (loading && !students.length) return <View style={[styles.center, { backgroundColor: theme.bg }]}><ActivityIndicator size="large" color={theme.accent} /></View>;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.welcome, { color: theme.textDim }]}>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • CLASS GATE</Text>
          <Text style={[styles.userName, { color: theme.text }]}>{userData?.class_name?.toUpperCase()}</Text>
        </View>
        <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.headerIcon}>
           <Users size={20} color="#fff" />
        </LinearGradient>
      </View>

      <FlatList
        data={students}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.studentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.studentInfo}>
                <Image 
                source={item.student_photo ? { uri: item.student_photo } : { uri: 'https://ui-avatars.com/api/?name=' + (item.student_name || 'S') }} 
                style={[styles.avatar, { borderRadius: 22 }]} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.studentName, { color: theme.text }]} numberOfLines={1}>{item.student_name}</Text>
                  <Text style={[styles.admNo, { color: theme.textDim }]}>ROLL: {item.roll_no || 'N/A'} • ADM: {item.admission_no || item.id || 'N/A'}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity 
                   onPress={() => handleToggleAttendance(item.id, 'Present')}
                   style={[styles.actionBtn, attendance[item.id] === 'Present' && { backgroundColor: '#10B981' }]}
                >
                  <Text style={[styles.actionText, attendance[item.id] === 'Present' && { color: '#fff' }]}>P</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   onPress={() => handleToggleAttendance(item.id, 'Absent')}
                   style={[styles.actionBtn, attendance[item.id] === 'Absent' && { backgroundColor: '#F43F5E' }]}
                >
                  <Text style={[styles.actionText, attendance[item.id] === 'Absent' && { color: '#fff' }]}>A</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   onPress={() => handleToggleAttendance(item.id, 'Half-day')}
                   style={[styles.actionBtn, attendance[item.id] === 'Half-day' && { backgroundColor: '#F59E0B' }]}
                >
                  <Text style={[styles.actionText, attendance[item.id] === 'Half-day' && { color: '#fff' }]}>H</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity onPress={submitStudentAttendance} style={styles.submitBtn}>
        <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.btnGradient}>
            <CheckCircle2 size={18} color="#fff" />
            <Text style={styles.submitText}>SAVE CLASS ATTENDANCE</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 24, paddingTop: 60, borderBottomWidth: 1
  },
  welcome: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  userName: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase', marginTop: 2 },
  headerIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  
  list: { padding: 24, paddingBottom: 100 },
  studentCard: { 
    flexDirection: 'row', alignItems: 'center', 
    padding: 12, borderRadius: 20, marginBottom: 12, 
    borderWidth: 1, justifyContent: 'space-between'
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 12, marginRight: 12 },
  studentName: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  admNo: { fontSize: 9, fontWeight: '700', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E2E8F033', justifyContent: 'center', alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '900', color: '#64748B' },
  
  submitBtn: { position: 'absolute', bottom: 30, left: 24, right: 24, height: 60, borderRadius: 20, overflow: 'hidden', elevation: 10 },
  btnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  submitText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 }
});
