import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, Smartphone, Users, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// --- CONFIG ---
const API_URL = 'https://littleseeds.org.in/backend/public/api/teacher-app';

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [loginId, setLoginId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginId || !pin) return Alert.alert('Error', 'Please enter both ID and PIN');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/class-login`, { login_id: loginId, pin });
      
      const data = response.data;
      if (data.success) {
        // Save auth data
        await AsyncStorage.setItem('userRole', 'class');
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        await AsyncStorage.setItem('userToken', data.token);
        
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', data.error || 'Check your credentials');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={isDark ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#E2E8F0']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          <View style={styles.header}>
            <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.iconContainer}>
              <Smartphone color="#fff" size={32} />
            </LinearGradient>
            <Text style={[styles.title, { color: theme.text, marginTop: 15 }]}>CLASS ATTENDENCE</Text>
            <Text style={[styles.subtitle, { color: theme.textDim }]}>Official Access for Student Records</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textDim }]}>CLASS LOGIN ID</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff', borderColor: theme.border }]}>
                <User size={18} color={theme.textDim} style={styles.inputIcon} />
                <TextInput 
                  placeholder="E.G. CLASS-IX-2026"
                  placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                  style={[styles.input, { color: theme.text }]}
                  value={loginId}
                  onChangeText={setLoginId}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textDim }]}>SECURE ACCESS PIN</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff', borderColor: theme.border }]}>
                <Lock size={18} color={theme.textDim} style={styles.inputIcon} />
                <TextInput 
                  placeholder="••••"
                  placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                  style={[styles.input, { color: theme.text }]}
                  value={pin}
                  onChangeText={setPin}
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginBtn}
            >
              <LinearGradient 
                colors={['#6366f1', '#4f46e5']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }} 
                style={styles.gradient}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                   <>
                    <Text style={styles.loginBtnText}>AUTHENTICATE ACCESS</Text>
                    <ChevronRight size={18} color="#fff" />
                   </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footer, { color: theme.textDim }]}>© 2026 SCHOOL MANAGEMENT SOFTWARE • V1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 15, elevation: 8
  },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  subtitle: { fontSize: 11, fontWeight: '700', textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase', opacity: 0.8 },
  
  toggleWrapper: { 
    flexDirection: 'row', 
    padding: 4, 
    borderRadius: 16, 
    marginBottom: 32
  },
  toggleBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    height: 44, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8
  },
  toggleText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    height: 56, borderWidth: 1, borderRadius: 16,
    paddingHorizontal: 16
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, fontWeight: '700' },
  
  loginBtn: { height: 56, borderRadius: 16, overflow: 'hidden', marginTop: 10 },
  gradient: { 
    flex: 1, flexDirection: 'row', 
    alignItems: 'center', justifyContent: 'center', 
    gap: 12 
  },
  loginBtnText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  footer: { marginTop: 40, textAlign: 'center', fontSize: 9, fontWeight: '900', letterSpacing: 1, opacity: 0.5 }
});
