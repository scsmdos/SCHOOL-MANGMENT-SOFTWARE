import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Platform, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { CONFIG } from '../constants/Config';

const logoImg = require('../assets/logo.jpeg');

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const [loginId, setLoginId] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleLogin = async () => {
    if (!loginId || !pin) {
      Alert.alert('Error', 'Please enter both User ID and PIN.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/parent-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          login_id: loginId,
          pin: pin
        })
      });
      const data = await response.json();
      
      if (response.ok && data.parent) {
        await AsyncStorage.setItem('parent_login_id', loginId);
        await AsyncStorage.setItem('parent_data', JSON.stringify(data.parent));
        if (data.access_token) {
          await AsyncStorage.setItem('parent_auth_token', data.access_token);
        }
        await AsyncStorage.setItem('parent_students', JSON.stringify(data.students || []));
        
        // Auto-select first student as default
        if (data.students && data.students.length > 0) {
          await AsyncStorage.setItem('selected_student_id', data.students[0].id.toString());
        }

        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
       console.log('Login API Error:', error);
       Alert.alert(
         'Connectivity Error',
         'Could not connect to the school server. Please ensure the backend is running and your IP address (10.32.136.136) is correct.'
       );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient 
        colors={isDark ? ['#0A0F24', '#161D30'] : ['#F8FAFC', '#E2E8F0']} 
        style={styles.background}
      >
        
        <View style={styles.logoContainer}>
          <View style={[styles.logoMask, { backgroundColor: '#FFF', borderColor: theme.accent }]}>
            <Image source={logoImg} style={styles.logoImage} />
          </View>
          <Text style={[styles.schoolTitle, { color: theme.text }]}>LITTLE SEEDS SCHOOL</Text>
          <Text style={[styles.subtitle, { color: theme.accent }]}>Parent Portal Login</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.inputHolder, { backgroundColor: isDark ? '#0A0F24' : '#FFF', borderColor: theme.border }]}>
             <Ionicons name="call-outline" size={20} color={theme.accent} style={styles.inputIcon} />
             <TextInput 
               style={[styles.input, { color: theme.text }]} 
               placeholder="Registered Mobile Number" 
               placeholderTextColor={theme.textSecondary}
               keyboardType="phone-pad"
               value={loginId}
               onChangeText={setLoginId}
             />
          </View>

          <View style={[styles.inputHolder, { marginTop: 20, backgroundColor: isDark ? '#0A0F24' : '#FFF', borderColor: theme.border }]}>
             <Ionicons name="lock-closed-outline" size={20} color={theme.accent} style={styles.inputIcon} />
             <TextInput 
               style={[styles.input, { color: theme.text }]} 
               placeholder="4-Digit PIN" 
               placeholderTextColor={theme.textSecondary}
               secureTextEntry={!showPin}
               keyboardType="number-pad"
               maxLength={4}
               value={pin}
               onChangeText={setPin}
             />
             <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPin(!showPin)}>
               <Ionicons name={showPin ? "eye-outline" : "eye-off-outline"} size={20} color={theme.textSecondary} />
             </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
            <LinearGradient colors={['#4F46E5', '#CD48B9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.loginGradient}>
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.loginText}>SECURE LOGIN</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </View>
        
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>© 2026 Little Seeds School</Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoMask: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  schoolTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 5,
    letterSpacing: 0.5,
  },
  formContainer: {
    padding: 25,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputHolder: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 10,
  },
  loginBtn: {
    marginTop: 35,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
  },
  loginGradient: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12,
    fontWeight: '600',
  }
});
