import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';

export default function SupportScreen() {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Help & Support</Text>
      </View>
      
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
           <Ionicons name="headset-outline" size={60} color={theme.accent} style={{ marginBottom: 20 }} />
           <Text style={[styles.heading, { color: theme.text }]}>We're here to help!</Text>
           <Text style={[styles.desc, { color: theme.textSecondary }]}>If you have any issues with the app or need school assistance, please reach out to us.</Text>

           <TouchableOpacity style={[styles.contactBtn, { backgroundColor: theme.accent }]} onPress={() => Linking.openURL('tel:+918340798254')}>
              <Ionicons name="call" size={20} color="#FFF" />
              <Text style={styles.contactTxt}>Call School Admin</Text>
           </TouchableOpacity>

           <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#10B981' }]} onPress={() => Linking.openURL('mailto:info@littleseeds.org.in')}>
              <Ionicons name="mail" size={20} color="#FFF" />
              <Text style={styles.contactTxt}>Email Support</Text>
           </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 55, borderBottomWidth: 1 },
  backBtn: { marginRight: 15 },
  title: { fontSize: 20, fontWeight: '800' },
  content: { padding: 20, flex: 1, justifyContent: 'center' },
  card: { padding: 30, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
  heading: { fontSize: 22, fontWeight: '900', marginBottom: 15 },
  desc: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  contactBtn: { flexDirection: 'row', width: '100%', padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  contactTxt: { color: '#FFF', fontSize: 16, fontWeight: '800', marginLeft: 10 }
});
