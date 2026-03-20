import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Dimensions, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const CustomCalendar = ({ visible, onClose, onSelect, currentVal }: any) => {
   const { theme, isDark } = useTheme();
   const [currDate, setCurrDate] = useState(new Date());
   const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
   const startDay = new Date(currDate.getFullYear(), currDate.getMonth(), 1).getDay();

   const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

   const changeMonth = (dir: number) => {
      const newD = new Date(currDate.getFullYear(), currDate.getMonth() + dir, 1);
      setCurrDate(newD);
   };

   const dayList = Array.from({ length: daysInMonth(currDate.getMonth(), currDate.getFullYear()) }, (_, i) => i + 1);
   const blanks = Array.from({ length: startDay }, (_, i) => i);

   const handleSelect = (day: number) => {
      const d = new Date(currDate.getFullYear(), currDate.getMonth(), day);
      const iso = d.toISOString().split('T')[0];
      onSelect(iso);
      onClose();
   };

   return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
         <View style={calStyles.overlay}>
            <View style={[calStyles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <View style={calStyles.header}>
                  <TouchableOpacity onPress={() => changeMonth(-1)}><Ionicons name="chevron-back" size={20} color={theme.text} /></TouchableOpacity>
                  <Text style={[calStyles.monthTitle, { color: theme.text }]}>{months[currDate.getMonth()]} {currDate.getFullYear()}</Text>
                  <TouchableOpacity onPress={() => changeMonth(1)}><Ionicons name="chevron-forward" size={20} color={theme.text} /></TouchableOpacity>
               </View>
               <View style={calStyles.weekDays}>
                  {['S','M','T','W','T','F','S'].map((d, i) => <Text key={i} style={[calStyles.weekText, { color: theme.textSecondary }]}>{d}</Text>)}
               </View>
               <FlatList 
                  data={[...blanks, ...dayList]}
                  numColumns={7}
                  keyExtractor={(_, i) => i.toString()}
                  renderItem={({ item, index }) => {
                     if (index < blanks.length) return <View style={calStyles.dayBox} />;
                     const isSel = currentVal === new Date(currDate.getFullYear(), currDate.getMonth(), item).toISOString().split('T')[0];
                     return (
                        <TouchableOpacity 
                           onPress={() => handleSelect(item)} 
                           style={[calStyles.dayBox, isSel && calStyles.daySel]}
                        >
                           <Text style={[calStyles.dayText, { color: isSel ? '#FFF' : theme.text }, isSel && calStyles.dayTextSel]}>{item}</Text>
                        </TouchableOpacity>
                     );
                  }}
               />
               <TouchableOpacity style={[calStyles.closeBtn, { borderTopColor: theme.border }]} onPress={onClose}><Text style={calStyles.closeTxt}>CANCEL</Text></TouchableOpacity>
            </View>
         </View>
      </Modal>
   );
};

export default function LeavesScreen() {
  const { theme, isDark } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showingForm, setShowingForm] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);

  const BASE_URL = 'http://10.32.136.136:8000/api';

  const fetchData = async () => {
    setFetching(true);
    try {
      const loginId = await AsyncStorage.getItem('parent_login_id');
      if (!loginId) return;
      const resProfile = await fetch(`${BASE_URL}/parent-dashboard/${loginId}`);
      const dataProfile = await resProfile.json();
      
      const prof = dataProfile.parent?.student_profile || dataProfile.student_profile || null;
      setProfile(prof);

      if (prof) {
         const sid = prof.admission_no || prof.id;
         const resHistory = await fetch(`${BASE_URL}/student-leaves?student_id=${sid}`);
         const dataHist = await resHistory.json();
         setHistory(dataHist.data || dataHist || []);
      }
    } catch (err) { console.log(err); } 
    finally { setFetching(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason) { Alert.alert("Required", "Please fill all fields."); return; }
    setLoading(true);
    try {
      const payload = {
         student_id: profile?.admission_no || 'N/A', 
         student_name: profile?.name || 'Unknown',
         class_name: profile?.class || 'Unknown', 
         section: profile?.section || 'A',
         start_date: startDate, 
         end_date: endDate,
         reason: reason, 
         status: 'Pending', 
         applied_by: 'Parent'
      };
      const response = await fetch(`${BASE_URL}/student-leaves`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (response.ok) { 
        Alert.alert("Success", "Leave request submitted successfully!"); 
        setShowingForm(false);
        setStartDate(''); setEndDate(''); setReason('');
        fetchData(); 
      }
      else { Alert.alert("Error", "Failed to submit request."); }
    } catch (err) { Alert.alert("Error", "Something went wrong."); }
    finally { setLoading(false); }
  };

  const renderHistoryItem = ({ item }: { item: any }) => {
     let bCol = isDark ? 'rgba(100, 116, 139, 0.2)' : '#F1F5F9'; 
     let tCol = isDark ? '#94A3B8' : '#64748B';
     if (item.status === 'Approved') { bCol = 'rgba(16, 185, 129, 0.25)'; tCol = '#10B981'; }
     else if (item.status === 'Rejected') { bCol = 'rgba(244, 63, 94, 0.25)'; tCol = '#FF4D4D'; }
     else if (item.status === 'Pending') { bCol = 'rgba(251, 191, 36, 0.25)'; tCol = '#FBBF24'; }

     return (
        <View style={[hStyles.item, { backgroundColor: theme.card, borderColor: theme.border }]}>
           <View style={hStyles.row}>
              <Text style={[hStyles.dateTitle, { color: theme.text }]}>{item.start_date} – {item.end_date}</Text>
              <View style={[hStyles.badge, { backgroundColor: bCol }]}>
                 <Text style={[hStyles.badgeTxt, { color: tCol }]}>{item.status?.toUpperCase()}</Text>
              </View>
           </View>
           <Text style={[hStyles.reason, { color: theme.textSecondary }]} numberOfLines={2}>{item.reason}</Text>
           <Text style={[hStyles.appliedAt, { color: theme.textSecondary }]}>Applied: {new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
     );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.appHeader, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <TouchableOpacity onPress={() => showingForm ? setShowingForm(false) : router.back()} style={styles.backBtn}>
           <Ionicons name={showingForm ? "close" : "arrow-back"} size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.appTitle, { color: theme.text }]}>{showingForm ? "Apply New Leave" : "My Leave History"}</Text>
      </View>
      
      {!showingForm ? (
         <View style={{ flex: 1 }}>
            {fetching ? (
               <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={theme.accent} size="large" /></View>
            ) : history.length === 0 ? (
               <View style={hStyles.empty}>
                  <Ionicons name="document-text-outline" size={60} color={theme.border} />
                  <Text style={[hStyles.emptyTxt, { color: theme.textSecondary }]}>No leave applications found.</Text>
               </View>
            ) : (
               <FlatList 
                  data={history}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
               />
            )}
            
            <TouchableOpacity style={hStyles.fab} onPress={() => setShowingForm(true)}>
               <Ionicons name="add" size={32} color="#FFF" />
            </TouchableOpacity>
         </View>
      ) : (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
         {!fetching && profile && (
           <LinearGradient colors={['#10B981', '#059669']} style={styles.profileSnippet}>
              <View style={styles.profileIconBox}><Ionicons name="person" size={20} color="#10B981" /></View>
              <View>
                 <Text style={styles.profileName}>{profile.name}</Text>
                 <Text style={styles.profileMeta}>Class {profile.class} — Sec {profile.section || 'A'}</Text>
                 <Text style={styles.profileMeta}>ID: {profile.admission_no}</Text>
              </View>
           </LinearGradient>
         )}

         <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.inputGroup}>
               <Text style={styles.label}>LEAVE START DATE</Text>
               <TouchableOpacity style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]} onPress={() => setShowStartCal(true)}>
                  <Ionicons name="calendar-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <Text style={[styles.input, { textAlignVertical: 'center', lineHeight: 50, color: startDate ? theme.text : theme.textSecondary }]}>
                    {startDate || "Choose Start Date"}
                  </Text>
               </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
               <Text style={styles.label}>LEAVE END DATE</Text>
               <TouchableOpacity style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]} onPress={() => setShowEndCal(true)}>
                  <Ionicons name="calendar-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <Text style={[styles.input, { textAlignVertical: 'center', lineHeight: 50, color: endDate ? theme.text : theme.textSecondary }]}>
                    {endDate || "Choose End Date"}
                  </Text>
               </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
               <Text style={styles.label}>REASON FOR LEAVE</Text>
               <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border, alignItems: 'flex-start', paddingTop: 12 }]}>
                  <Ionicons name="document-text-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top', color: theme.text }]} placeholder="Mention the reason..." placeholderTextColor={theme.textSecondary} multiline value={reason} onChangeText={setReason} />
               </View>
            </View>

            <TouchableOpacity style={[styles.submitBtn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : (
                <View style={styles.btnContent}>
                   <Text style={styles.btnTxt}>SEND APPLICATION</Text>
                   <Ionicons name="send" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                </View>
              )}
            </TouchableOpacity>
         </View>

         <View style={[styles.tipBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#CBD5E1' }]}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={[styles.tipText, { color: theme.textSecondary }]}>Applications are reviewed by the class teacher. Status will be updated soon.</Text>
         </View>
      </ScrollView>
      )}

      <CustomCalendar visible={showStartCal} onClose={() => setShowStartCal(false)} onSelect={setStartDate} currentVal={startDate} />
      <CustomCalendar visible={showEndCal} onClose={() => setShowEndCal(false)} onSelect={setEndDate} currentVal={endDate} />
    </SafeAreaView>
  );
}

const hStyles = StyleSheet.create({
   item: { padding: 18, borderRadius: 18, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#10B981', borderWidth: 1 },
   row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
   dateTitle: { fontSize: 14, fontWeight: '900' },
   badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
   badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
   reason: { fontSize: 12, lineHeight: 18, marginBottom: 10 },
   appliedAt: { fontSize: 10, fontWeight: '700' },
   fab: { position: 'absolute', bottom: 100, right: 25, width: 62, height: 62, borderRadius: 31, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 12 },
   empty: { flex: 1, alignItems: 'center', justifyContent: 'center', opacity: 0.5 },
   emptyTxt: { fontSize: 14, fontWeight: '700', marginTop: 15 }
});

const calStyles = StyleSheet.create({
   overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
   card: { width: width * 0.9, borderRadius: 24, padding: 20, borderWidth: 1 },
   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
   monthTitle: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
   weekDays: { flexDirection: 'row', marginBottom: 10 },
   weekText: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '900' },
   dayBox: { flex: 1, height: 45, justifyContent: 'center', alignItems: 'center', margin: 2, borderRadius: 10 },
   daySel: { backgroundColor: '#10B981' },
   dayText: { fontSize: 14, fontWeight: '700' },
   dayTextSel: { fontWeight: '900' },
   closeBtn: { marginTop: 20, padding: 15, alignItems: 'center', borderTopWidth: 1 },
   closeTxt: { color: '#F43F5E', fontSize: 12, fontWeight: '900', letterSpacing: 2 }
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  appHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 55, 
    borderBottomWidth: 1, 
  },
  backBtn: { marginRight: 15 },
  appTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  content: { padding: 20, paddingBottom: 60 },
  
  profileSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    elevation: 8,
  },
  profileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  profileName: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  profileMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', marginTop: 2 },

  formCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
  },
  inputGroup: { marginBottom: 20 },
  label: { 
    color: '#64748B', 
    fontSize: 10, 
    fontWeight: '800', 
    letterSpacing: 1.5, 
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50, fontSize: 15, fontWeight: '600' },
  
  submitBtn: { 
    backgroundColor: '#10B981', 
    height: 56,
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btnTxt: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },

  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    borderWidth: 1,
  },
  tipText: { flex: 1, marginLeft: 12, fontSize: 11, lineHeight: 16, fontWeight: '600' }
});
