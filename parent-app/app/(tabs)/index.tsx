import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, SafeAreaView, ActivityIndicator, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IDCardModal from '../../components/IDCardModal';
import { CONFIG } from '../../constants/Config';
import { Audio } from 'expo-av';
import { useTheme } from '../../context/ThemeContext';
const logoImg = require('../../assets/logo.png');

const MENU_ITEMS = [
  { id: 10, title: 'Notices', icon: 'notifications-outline', color: '#F59E0B', bgColor: '#FFF4E6', route: '/communication', params: { initialTab: 'NOTICE' } },
  { id: 11, title: 'Messages', icon: 'chatbubbles-outline', color: '#8B5CF6', bgColor: '#F2EBFF', route: '/communication', params: { initialTab: 'MESSAGE' } },
  { id: 2, title: 'Homework', icon: 'book-outline', color: '#3B82F6', bgColor: '#E6EFFF', route: '/homework' },
  { id: 1, title: 'Timetable', icon: 'time-outline', color: '#10B981', bgColor: '#E0F8ED', route: '/timetable' },
  { id: 3, title: 'Fees', icon: 'wallet-outline', color: '#F59E0B', bgColor: '#FFF4E6', route: '/fees' },
  { id: 4, title: 'Exams', icon: 'document-text-outline', color: '#EF4444', bgColor: '#FFE6E6', route: '/exams' },
  { id: 6, title: 'Results', icon: 'ribbon-outline', color: '#D946EF', bgColor: '#FCE9FA', route: '/results' },
  { id: 5, title: 'Live Bus', icon: 'bus-outline', color: '#8B5CF6', bgColor: '#F2EBFF', badge: 'LIVE', route: '/track' },
  { id: 12, title: 'Calendar', icon: 'calendar-outline', color: '#3B82F6', bgColor: '#E6EFFF', route: '/calendar' },
  { id: 7, title: 'Leaves', icon: 'calendar-clear-outline', color: '#10B981', bgColor: '#E0F8ED', route: '/leaves' },
  { id: 9, title: 'Library', icon: 'library-outline', color: '#0EA5E9', bgColor: '#E0F2FE', route: '/library' },
  { id: 8, title: 'Support', icon: 'help-circle-outline', color: '#6B7280', bgColor: '#F3F4F6', route: '/support' },
];

export default function HomeScreen() {
  const { isDark, theme, toggleTheme } = useTheme();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isIDCardVisible, setIsIDCardVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotifId, setLastNotifId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false);

  const BASE_URL = CONFIG.BASE_URL;

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const playNotificationSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' } // Short alert sound
      );
      await sound.playAsync();
    } catch (e) { console.log('Sound error:', e); }
  };

  const checkNotifications = async () => {
    try {
      const loginId = await AsyncStorage.getItem('parent_login_id');
      const token = await AsyncStorage.getItem('parent_auth_token');
      if (!loginId || !token) return;

      const response = await fetch(`${BASE_URL}/parent-notifications/${loginId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 401) {
         // Security: Token invalidated (e.g. PIN changed)
         await AsyncStorage.clear();
         router.replace('/login');
         return;
      }

      const data = await response.json();
      
      // Filter for truly "new" ones (created after last session view)
      const lastViewed = await AsyncStorage.getItem('last_notif_viewed_at') || '0';
      const unread = data.filter((n: any) => !n.is_read || new Date(n.created_at).getTime() > parseInt(lastViewed));
      setUnreadCount(unread.length);

      if (unread.length > 0) {
        const newestId = unread[0].id;
        if (lastNotifId !== null && newestId > lastNotifId) {
           playNotificationSound();
        }
        setLastNotifId(newestId);
      }
    } catch (e) { console.log('Notif check error:', e); }
  };

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [lastNotifId]);

  useEffect(() => {
    const fetchDashboard = async (studentId?: string) => {
      try {
        const loginId = await AsyncStorage.getItem('parent_login_id');
        const token = await AsyncStorage.getItem('parent_auth_token');
        const targetId = studentId || await AsyncStorage.getItem('selected_student_id');
        
        if (!loginId || !token) {
          router.replace('/login');
          return;
        }

        const url = `${BASE_URL}/parent-dashboard/${loginId}${targetId ? `?student_id=${targetId}` : ''}`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.status === 401) {
           await AsyncStorage.clear();
           router.replace('/login');
           return;
        }

        const data = await response.json();
        if(!data.error) {
           setDashboardData(data);
           
           // Load student list
           const storedStudents = await AsyncStorage.getItem('parent_students');
           if (storedStudents) setStudents(JSON.parse(storedStudents));
           if (targetId) setSelectedStudentId(targetId);
        }
      } catch (error) {
        console.log("Backend fetch error:", error);
      }
    };
    fetchDashboard();
  }, []);

  const switchStudent = async (student: any) => {
    try {
      console.log('Switching to student:', student.id);
      setIsSwitcherVisible(false);
      setDashboardData(null); // Force loading state
      
      const sid = student.id.toString();
      await AsyncStorage.setItem('selected_student_id', sid);
      setSelectedStudentId(sid);
      
      const loginId = await AsyncStorage.getItem('parent_login_id');
      const token = await AsyncStorage.getItem('parent_auth_token');
      
      const response = await fetch(`${BASE_URL}/parent-dashboard/${loginId}?student_id=${sid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 401) {
         await AsyncStorage.clear();
         router.replace('/login');
         return;
      }

      const data = await response.json();
      if(!data.error) {
        setDashboardData(data);
        console.log('Switch complete. Student Name is now:', data.parent?.student_profile?.name);
      } else {
        Alert.alert('Error', 'Could not load student data.');
      }
    } catch (e) {
      console.error('Error switching student:', e);
      Alert.alert('Error', 'Switching failed. Please check your connection.');
    }
  };

  const studentName = dashboardData?.parent?.student_profile?.name || 'Loading...';

  // Modal UI for Switcher at the bottom
  const renderSwitcherModal = () => (
    <Modal
      visible={isSwitcherVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsSwitcherVisible(false)}
    >
      <TouchableOpacity 
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
        activeOpacity={1}
        onPress={() => setIsSwitcherVisible(false)}
      >
        <View style={{ backgroundColor: theme.card, width: '100%', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '900', marginBottom: 20, textAlign: 'center' }}>
            Select Student
          </Text>
          {students.map((student) => (
            <TouchableOpacity
              key={student.id}
              onPress={() => switchStudent(student)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
                backgroundColor: selectedStudentId === student.id.toString() ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                borderWidth: 1.5,
                borderColor: selectedStudentId === student.id.toString() ? '#6366f1' : theme.border
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>{student.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800' }}>{student.name}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>Class {student.class} {student.section}</Text>
              </View>
              {selectedStudentId === student.id.toString() && (
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}>
                   <Feather name="chevron-down" size={14} color="#FFF" style={{ transform: [{ rotate: '-90deg' }] }} />
                </View>
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            onPress={() => setIsSwitcherVisible(false)}
            style={{ marginTop: 8, padding: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 14 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
  const attValue = dashboardData?.attendance?.percentage;
  const attendance = (attValue !== undefined && attValue !== null) ? attValue : '...';
  const className = dashboardData?.parent?.student_profile?.class || '-';
  const section = dashboardData?.parent?.student_profile?.section || '-';
  const rollNo = dashboardData?.parent?.student_profile?.roll_no || '-';
  const admissionNo = dashboardData?.parent?.student_profile?.admission_no || '-';
  const studentPhoto = dashboardData?.parent?.student_photo;
  
  const rollText = (rollNo && rollNo !== 'N/A' && rollNo !== '-') ? ` • Roll ${rollNo}` : '';
  const getNextClass = () => {
    if (!dashboardData?.timetable || dashboardData.timetable.length === 0) return 'No Classes';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const currentDay = days[now.getDay()];
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const parseTime = (timeStr: string) => {
      if (!timeStr) return 0;
      const parts = timeStr.split(' ');
      if (parts.length < 2) return 0;
      const [time, modifier] = parts;
      let [hours, minutes] = time.split(':').map(Number);
      if (hours === 12) hours = modifier === 'PM' ? 12 : 0;
      else if (modifier === 'PM') hours += 12;
      return hours * 60 + minutes;
    };

    const todaysClasses = dashboardData.timetable.filter((t: any) => t.day === currentDay);
    const upcomingToday = todaysClasses.filter((t: any) => parseTime(t.start_time) > currentMins);
    
    if (upcomingToday.length > 0) {
       return upcomingToday.sort((a: any, b: any) => parseTime(a.start_time) - parseTime(b.start_time))[0].subject || 'Unknown';
    }

    for (let i = 1; i <= 7; i++) {
       const nextDayIndex = (now.getDay() + i) % 7;
       const nextDayClasses = dashboardData.timetable.filter((t: any) => t.day === days[nextDayIndex]);
       if (nextDayClasses.length > 0) {
          return nextDayClasses.sort((a: any, b: any) => parseTime(a.start_time) - parseTime(b.start_time))[0].subject || 'Unknown';
       }
    }
    return 'No Upcoming Classes';
  };
  const nextClassTitle = getNextClass();

  const recentNotices = dashboardData?.notices?.slice(0, 2) || [];
  const parentEvents = dashboardData?.parent_events || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Sticky Top Header */}
      <LinearGradient
        colors={isDark ? ['#4F46E5', '#CD48B9'] : ['#6366F1', '#818CF8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.stickyBranding}
      >
        <View style={styles.brandingContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={styles.logoMask}>
              <Image source={logoImg} style={styles.logoImage} />
            </View>
            <View style={styles.brandingTextContainer}>
              <Text style={styles.schoolName}>LITTLE SEEDS SCHOOL</Text>
              <Text style={styles.statusText}>{currentTime || '00:00 AM'} • {isDark ? 'DARK MODE' : 'LIGHT MODE'}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={toggleTheme}
            style={[styles.bellButton, { marginRight: 10 }]}
          >
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={async () => {
               await AsyncStorage.setItem('last_notif_viewed_at', Date.now().toString());
               const loginId = await AsyncStorage.getItem('parent_login_id');
               const token = await AsyncStorage.getItem('parent_auth_token');
               // Optionally call mark-as-read on server
               fetch(`${BASE_URL}/parent-notifications/read-all/${loginId}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
               setUnreadCount(0);
               router.push('/communication');
            }}
            style={styles.bellButton}
          >
            <Ionicons name="notifications-outline" size={24} color="#FFF" />
            {unreadCount > 0 && (
              <View style={styles.unreadBadgeMini}>
                <Text style={styles.unreadBadgeTextMini}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Content Header Section */}
        <LinearGradient
          colors={isDark ? ['#4F46E5', '#CD48B9'] : ['#6366F1', '#818CF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >

          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>WELCOME BACK</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.studentName}>{studentName}</Text>
                {students.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => setIsSwitcherVisible(true)}
                    style={{ backgroundColor: 'rgba(255,255,255,0.25)', padding: 4, borderRadius: 8, marginLeft: 2 }}
                  >
                    <Ionicons name="swap-horizontal" size={20} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.classBatch}>
                <Text style={styles.classBatchText}>Class {className} - {section}{rollText} • {admissionNo}</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setIsIDCardVisible(true)}
              style={styles.profileContainer}
            >
              <View style={[styles.profilePic, studentPhoto && { backgroundColor: 'transparent', padding: 0 }]}>
                {studentPhoto ? (
                   <Image source={{ uri: studentPhoto }} style={{ width: '100%', height: '100%', borderRadius: 30, borderWidth: 1, borderColor: '#FFF' }} />
                ) : (
                   <Ionicons name="person-outline" size={30} color="#FFF" />
                )}
              </View>
              <View style={styles.onlineDot} />
            </TouchableOpacity>
          </View>

          {/* Inner Card on Header */}
          <View style={styles.headerCard}>
            <View style={styles.headerCardInner}>
              <View style={styles.statsContainer}>
                
                <View style={styles.statBox}>
                  <Text style={styles.statsLabel}>ATTENDANCE</Text>
                  <Text style={styles.statsValue}>{attendance}%</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.statBoxMiddle}>
                  <Text style={styles.statsLabel}>NEXT CLASS</Text>
                  <Text style={styles.statsValueNext} numberOfLines={1}>{nextClassTitle}</Text>
                </View>
                
                <View style={[styles.divider, { marginRight: 15 }]} />
                
                <View style={styles.statBox}>
                  <TouchableOpacity style={styles.idCardButton} onPress={() => setIsIDCardVisible(true)}>
                    <Text style={styles.idCardText}>ID CARD</Text>
                    <Feather name="external-link" size={12} color="#4F46E5" />
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Dashboard Grid Menu */}
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item: any) => (
            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => router.push({ pathname: item.route as any, params: item.params })}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? item.bgColor : '#FFFFFF', elevation: isDark ? 0 : 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 }]}>
                {item.badge && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={[styles.menuTitle, { color: theme.text }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>


        {/* Recent Updates Section */}
        <View style={styles.updatesSection}>
          <View style={styles.updatesHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>RECENT UPDATES</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/communication', params: { initialTab: 'NOTICE' } })}>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          {recentNotices.length > 0 ? (
            recentNotices.map((notice: any, index: number) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.updateCard, { marginTop: index > 0 ? 15 : 0, backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push({ pathname: '/communication', params: { initialTab: 'NOTICE' } })}
              >
                <View style={[styles.updateIconContainer, { backgroundColor: index % 2 === 0 ? 'rgba(139, 92, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name={index % 2 === 0 ? "notifications" : "document-text"} size={20} color={index % 2 === 0 ? "#8B5CF6" : "#10B981"} />
                </View>
                <View style={styles.updateContent}>
                  <View style={styles.updateContentHeader}>
                    <Text style={[styles.updateTitle, { color: theme.text }]} numberOfLines={1}>{notice.title}</Text>
                    <Text style={styles.updateTime}>{notice.time_ago}</Text>
                  </View>
                  <Text style={[styles.updateDesc, { color: theme.textSecondary }]} numberOfLines={2}>{notice.description || notice.content || "School has published a new notice. Tap to read details."}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.updateCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <View style={[styles.updateIconContainer, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                  <Ionicons name="notifications-off" size={20} color="#64748B" />
               </View>
               <View style={styles.updateContent}>
                  <Text style={[styles.updateTitle, { color: theme.text }]}>No Recent Updates</Text>
                  <Text style={[styles.updateDesc, { color: theme.textSecondary }]}>Everything is catch up! No new notifications found.</Text>
               </View>
            </View>
          )}
        </View>
      </ScrollView>

      <IDCardModal 
        isOpen={isIDCardVisible}
        onClose={() => setIsIDCardVisible(false)}
        data={dashboardData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F24',
  },
  stickyBranding: {
    paddingTop: Platform.OS === 'android' ? 50 : 40,
    paddingBottom: 15,
  },
  headerGradient: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingBottom: 25,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  unreadBadgeMini: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  unreadBadgeTextMini: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  logoMask: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  logoImage: {
    width: 25,
    height: 25,
  },
  brandingTextContainer: {
    marginLeft: 10,
  },
  schoolName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 5,
  },
  statusText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  studentName: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  classBatch: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  classBatchText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  profileContainer: {
    position: 'relative',
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#4F46E5' },
  unreadBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF', paddingHorizontal: 4, zIndex: 10 },
  unreadBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  headerCard: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerCardInner: {
    padding: 18,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBoxMiddle: {
    flex: 1.3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'center',
  },
  statsValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  statsValueNext: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  idCardButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  idCardText: {
    color: '#4F46E5',
    fontWeight: '900',
    fontSize: 11,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    paddingTop: 30,
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 25,
  },
  iconContainer: {
    width: 65,
    height: 65,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  menuTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  updatesSection: {
    paddingHorizontal: 25,
    marginTop: 10,
  },
  updatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  viewAllText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  updateCard: {
    flexDirection: 'row',
    backgroundColor: '#161D30',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A344A',
  },
  updateIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  updateContent: {
    flex: 1,
  },
  updateContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  updateTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  updateTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '600',
  },
  updateDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  liveBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  liveBadgeText: {
    color: '#6366f1',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
