import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { CONFIG } from '../../constants/Config';

const { width } = Dimensions.get('window');

export default function ResultsScreen() {
  const { theme, isDark } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const loginId = await AsyncStorage.getItem('parent_login_id');
        const token = await AsyncStorage.getItem('parent_auth_token');
        if (!loginId) { setLoading(false); return; }

        const response = await fetch(`${CONFIG.BASE_URL}/parent-dashboard/${loginId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.log('Results fetch error:', err);
      }
      setLoading(false);
    };
    fetchResults();
  }, []);

  const results = data?.results || [];
  const profile = data?.parent?.student_profile || {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={[styles.appHeader, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.appTitle, { color: theme.text }]}>My Results</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: 50 }} />
        ) : results.length > 0 ? (
          results.map((res: any, index: number) => {
             const pctStr = res.percentage ? res.percentage.toString().replace('%', '') : '0';
             let pct = parseFloat(pctStr) || 0;
             if (pct > 100) pct = 100;
             
             const isPass = !['F', 'FAIL', 'E'].includes(res.grade?.toUpperCase());
             const resultStatus = isPass ? 'PASS' : 'FAIL';
             const statusColor = isPass ? '#00D2A6' : '#F43F5E';
             
             return (
              <View key={index} style={[styles.modernCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.topAccent} />

                <View style={styles.cardHeaderArea}>
                   <View style={styles.headerLeft}>
                      <View style={styles.logoWrapper}>
                         <Image source={require('../../assets/logo.png')} style={styles.schoolLogoImg} />
                      </View>
                      <View>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>LITTLE SEEDS SCHOOL</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>An English Medium School</Text>
                      </View>
                   </View>
                   <View style={[styles.examTag, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderColor: theme.border }]}>
                      <Text style={[styles.examTagText, { color: theme.textSecondary }]}>{res.exam_name}</Text>
                   </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.infoRow}>
                   <View style={styles.studentInfo}>
                      <Text style={styles.labelText}>STUDENT</Text>
                      <Text style={[styles.valueTextLg, { color: theme.text }]}>{res.student_name || profile.name || 'Student Name'}</Text>
                      <Text style={[styles.subValueText, { color: theme.textSecondary }]}>{res.class_name || profile.class || '-'}</Text>
                      
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>SUBJECT:</Text>
                        <Text style={[styles.metaValue, { color: theme.text }]}>{res.subject || 'N/A'}</Text>
                      </View>

                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>FATHER:</Text>
                        <Text style={[styles.metaValue, { color: theme.text }]}>{res.father_name || profile.father_name || 'N/A'}</Text>
                      </View>
                   </View>
                   
                   <View style={[styles.gradeBox, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)', borderColor: isDark ? '#3B82F6' : '#2563EB' }]}>
                      <Text style={[styles.gradeValue, { color: isDark ? '#60A5FA' : '#2563EB' }]}>{res.grade || '-'}</Text>
                   </View>
                </View>

                <View style={styles.progressSection}>
                   <View style={styles.progressHeaderRow}>
                      <Text style={styles.labelText}>SCORE</Text>
                      <Text style={[styles.percentageText, { color: '#00D2A6' }]}>{res.percentage}</Text>
                   </View>
                   <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#2A334B' : '#E2E8F0' }]}>
                      <LinearGradient 
                         colors={['#00C6FF', '#00D2A6']} 
                         start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} 
                         style={[styles.progressBarFill, { width: `${pct}%` }]} 
                      />
                   </View>
                </View>

                <View style={styles.statusBoxesRow}>
                   <View style={[styles.statBox, { backgroundColor: isDark ? '#1E273A' : '#F8FAFC', borderColor: theme.border }]}>
                      <Text style={styles.statLabel}>MARKS OBTAINED</Text>
                      <Text style={[styles.statScore, { color: theme.text }]}>{res.marks_obtained || '-'}</Text>
                   </View>
                   <View style={[styles.statBox, { backgroundColor: isDark ? '#1E273A' : '#F8FAFC', borderColor: theme.border }]}>
                      <Text style={styles.statLabel}>TOTAL MARKS</Text>
                      <Text style={[styles.statScore, { color: theme.text }]}>{res.max_marks || '-'}</Text>
                   </View>
                   <View style={[styles.statBox, { backgroundColor: isDark ? '#1E273A' : '#F8FAFC', borderColor: theme.border }]}>
                      <Text style={styles.statLabel}>RESULT</Text>
                      <Text style={[styles.statResult, { color: statusColor }]}>{resultStatus}</Text>
                   </View>
                </View>

                <View style={[styles.identifierBox, { borderColor: theme.border }]}>
                   <Text style={[styles.identifierText, { color: theme.textSecondary }]}>RESULT DATE: {res.result_date || '--'}</Text>
                </View>

              </View>
             );
          })
        ) : (
          <View style={styles.empty}>
             <Ionicons name="analytics-outline" size={80} color={theme.border} />
             <Text style={[styles.emptyTxt, { color: theme.text }]}>No Results Found</Text>
             <Text style={[styles.emptySubTxt, { color: theme.textSecondary }]}>Your futuristic result cards will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 55, borderBottomWidth: 1 },
  backBtn: { marginRight: 15 },
  appTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  content: { padding: 18, paddingBottom: 40 },
  
  modernCard: {
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topAccent: {
    height: 4,
    backgroundColor: '#00D2A6',
    width: '100%',
  },
  cardHeaderArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#eab308', 
  },
  schoolLogoImg: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    width: 65,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  examTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  examTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  labelText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  valueTextLg: {
    fontSize: 20,
    fontWeight: '800',
  },
  subValueText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  gradeBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  gradeValue: {
    fontSize: 26,
    fontWeight: '900',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statusBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  statScore: {
    fontSize: 18,
    fontWeight: '800',
  },
  statResult: {
    fontSize: 16,
    fontWeight: '900',
  },
  identifierBox: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  identifierText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  
  empty: { 
    alignItems: 'center', 
    marginTop: 100,
    padding: 30,
  },
  emptyTxt: { 
    fontSize: 18, 
    fontWeight: '800', 
    marginTop: 15 
  },
  emptySubTxt: {
    fontSize: 13, 
    textAlign: 'center',
    marginTop: 8,
  }
});
