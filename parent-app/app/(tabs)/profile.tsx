import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { CONFIG } from '../../constants/Config';

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [parentData, setParentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const loginId = await AsyncStorage.getItem('parent_login_id');
          const studentId = await AsyncStorage.getItem('selected_student_id');
          if (loginId) {
            const token = await AsyncStorage.getItem('parent_auth_token');
            const response = await fetch(`${CONFIG.BASE_URL}/parent-dashboard/${loginId}${studentId ? `?student_id=${studentId}` : ''}`, {
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

            const parsed = await response.json();
            if (!parsed.error && parsed.parent) {
               setParentData(parsed.parent);
               setProfile(parsed.parent.student_profile || null);
            }
          }
        } catch (err) {
          console.log("Profile API Error", err);
        }
        setLoading(false);
      };
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
         await AsyncStorage.removeItem('parent_login_id');
         await AsyncStorage.removeItem('parent_data');
         await AsyncStorage.removeItem('parent_students');
         await AsyncStorage.removeItem('selected_student_id');
        await AsyncStorage.removeItem('parent_auth_token');
         router.replace('/login');
      }}
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Account Profile</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ marginTop: 50 }}><ActivityIndicator color={theme.accent} size="large" /></View>
        ) : parentData ? (
          <>
            <View style={styles.avatarContainer}>
               <View style={[styles.avatarWrapper, !isDark && { shadowColor: '#000', elevation: 5 }]}>
                  {parentData.parent_photo ? (
                    <Image 
                      source={{ uri: parentData.parent_photo }} 
                      style={[styles.avatarImage, { borderColor: theme.accent }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                       <Ionicons name="person" size={50} color={theme.textSecondary} />
                    </View>
                  )}
               </View>
               <Text style={[styles.name, { color: theme.text }]}>{parentData.parent_name || 'Parent'}</Text>
               <View style={styles.badgeRow}>
                  <View style={[styles.relationBadge, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(79, 70, 229, 0.1)' }]}>
                     <Text style={[styles.relationTxt, { color: theme.accent }]}>{parentData.relation?.toUpperCase() || 'GUARDIAN'}</Text>
                  </View>
                  <Text style={styles.loginId}>{parentData.login_id}</Text>
               </View>
            </View>

            <View style={styles.sectionHeader}>
               <Text style={styles.sectionTitle}>STUDENT INFORMATION</Text>
            </View>

            <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                     <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}><Ionicons name="person-outline" size={16} color="#8B5CF6" /></View>
                     <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Linked Student</Text>
                  </View>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{profile?.name || '-'}</Text>
               </View>
               <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
               
               <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                     <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}><Ionicons name="school-outline" size={16} color="#10B981" /></View>
                     <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Class — Sec</Text>
                  </View>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{profile?.class || '-'} — {profile?.section || 'A'}</Text>
               </View>
               <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

               <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                     <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}><Ionicons name="id-card-outline" size={16} color="#3B82F6" /></View>
                     <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Adm No / Roll</Text>
                  </View>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{profile?.admission_no || '-'} / {profile?.roll_no || '-'}</Text>
               </View>
               <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

               <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                     <View style={[styles.infoIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}><Ionicons name="call-outline" size={16} color="#F59E0B" /></View>
                     <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Contact No</Text>
                  </View>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{parentData?.login_id || '-'}</Text>
               </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
               <Ionicons name="log-out" size={20} color="#FFF" />
               <Text style={styles.logoutTxt}>LOGOUT FROM APP</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.empty}>
             <Ionicons name="alert-circle-outline" size={50} color={theme.textSecondary} />
             <Text style={[styles.emptyTxt, { color: theme.textSecondary }]}>Profile data unavailable.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  content: { padding: 20, paddingBottom: 100 },
  avatarContainer: { alignItems: 'center', marginBottom: 40, marginTop: 10 },
  avatarWrapper: { width: 110, height: 110, borderRadius: 55, padding: 4, elevation: 15, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 55, borderWidth: 2 },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 55, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  name: { fontSize: 24, fontWeight: '900', marginTop: 20 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  relationBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 10 },
  relationTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  loginId: { color: '#64748B', fontSize: 13, fontWeight: '700' },
  sectionHeader: { marginBottom: 15, alignItems: 'center' },
  sectionTitle: { color: '#64748B', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, textAlign: 'center' },
  infoCard: { borderRadius: 24, padding: 10, borderWidth: 1, marginTop: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15 },
  infoIconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoLeft: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '800' },
  infoValue: { fontSize: 13, fontWeight: '800' },
  infoDivider: { height: 1 },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#F43F5E', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 40, elevation: 5 },
  logoutTxt: { color: '#FFF', fontSize: 14, fontWeight: '900', marginLeft: 10, letterSpacing: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, opacity: 0.5 },
  emptyTxt: { fontSize: 14, fontWeight: '700', marginTop: 10 }
});
