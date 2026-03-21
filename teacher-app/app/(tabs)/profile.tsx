import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, User, Shield, Info, Smartphone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    (async () => {
      const storedData = await AsyncStorage.getItem('userData');
      const storedRole = await AsyncStorage.getItem('userRole');
      if (!storedData || !storedRole) {
        return router.replace('/login');
      }
      setUserData(JSON.parse(storedData));
      setRole(storedRole);
    })();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
          await AsyncStorage.multiRemove(['userData', 'userRole', 'userToken']);
          router.replace('/login');
      }}
    ]);
  };

  if (!userData) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={['#6366f1', '#4338ca']} style={styles.header}>
        <View style={styles.profileIcon}>
           <User size={40} color="#fff" />
        </View>
        <Text style={styles.userName}>{userData.name || userData.class_name || 'Teacher Access'}</Text>
        <Text style={styles.userRole}>{role === 'class' ? 'CLASS-WISE MONITORING' : userData.designation || 'STAFF'}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textDim }]}>ACCOUNT SETTINGS</Text>
          <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]}>
            <View style={[styles.itemIcon, { backgroundColor: theme.accent + '15' }]}>
               <Shield size={20} color={theme.accent} />
            </View>
            <View style={styles.itemText}>
               <Text style={[styles.itemLabel, { color: theme.text }]}>Security & Privacy</Text>
               <Text style={[styles.itemSubLabel, { color: theme.textDim }]}>Manage access and authentication</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={toggleTheme}>
            <View style={[styles.itemIcon, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
               <Smartphone size={20} color={isDark ? '#fff' : '#000'} />
            </View>
            <View style={styles.itemText}>
               <Text style={[styles.itemLabel, { color: theme.text }]}>{isDark ? 'Dark Mode Active' : 'Light Mode Active'}</Text>
               <Text style={[styles.itemSubLabel, { color: theme.textDim }]}>Tap to switch interface</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textDim }]}>SUPPORT</Text>
          <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]}>
            <View style={[styles.itemIcon, { backgroundColor: '#10B98115' }]}>
               <Info size={20} color="#10B981" />
            </View>
            <View style={styles.itemText}>
               <Text style={[styles.itemLabel, { color: theme.text }]}>Software Information</Text>
               <Text style={[styles.itemSubLabel, { color: theme.textDim }]}>Version 1.0.0 Stable</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color="#F43F5E" />
          <Text style={styles.logoutText}>SECURE SIGN OUT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 40, paddingTop: 60, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  profileIcon: { width: 80, height: 80, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  userName: { fontSize: 20, fontWeight: '900', color: '#fff', textTransform: 'uppercase' },
  userRole: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginTop: 4 },
  
  content: { padding: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 16 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  itemIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemText: { flex: 1 },
  itemLabel: { fontSize: 14, fontWeight: '800' },
  itemSubLabel: { fontSize: 11, fontWeight: '600', marginTop: 2, opacity: 0.8 },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, backgroundColor: '#F43F5E10', borderRadius: 20, gap: 12, marginTop: 10 },
  logoutText: { color: '#F43F5E', fontSize: 12, fontWeight: '900', letterSpacing: 1 }
});
