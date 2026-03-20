import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function CommunicationScreen() {
  const { theme, isDark } = useTheme();
  const { initialTab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'NOTICE' | 'MESSAGE'>((initialTab as any) || 'NOTICE');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab as any);
  }, [initialTab]);

  const BASE_URL = 'http://10.32.136.136:8000/api';

  const fetchNotifications = useCallback(async () => {
    try {
      const loginId = await AsyncStorage.getItem('parent_login_id');
      if (!loginId) return;

      const response = await fetch(`${BASE_URL}/parent-notifications/${loginId}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const filteredData = notifications.filter(n => n.type === activeTab);

  const renderDetailModal = () => (
    selectedItem && (
      <View style={styles.modalOverlay}>
         <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
               <View style={[styles.iconBox, { backgroundColor: selectedItem.type === 'NOTICE' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(139, 92, 246, 0.1)' }]}>
                  <Ionicons 
                    name={selectedItem.type === 'NOTICE' ? 'megaphone' : 'mail'} 
                    size={24} 
                    color={selectedItem.type === 'NOTICE' ? '#F59E0B' : '#8B5CF6'} 
                  />
               </View>
               <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedItem(null)}>
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
               </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
               <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedItem.title}</Text>
               <Text style={[styles.modalDate, { color: theme.textSecondary }]}>{new Date(selectedItem.created_at).toLocaleString()}</Text>
               <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />
               <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>{selectedItem.message}</Text>
            </ScrollView>

            <TouchableOpacity style={[styles.modalOkBtn, { backgroundColor: theme.accent }]} onPress={() => setSelectedItem(null)}>
               <Text style={styles.modalOkBtnText}>GOT IT</Text>
            </TouchableOpacity>
         </View>
      </View>
    )
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {renderDetailModal()}
      
      <LinearGradient 
        colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#6366f1', '#4f46e5']} 
        style={styles.header}
      >
         <View style={styles.headerContent}>
            <View>
               <Text style={[styles.title, { color: '#FFF' }]}>COMMHUB</Text>
               <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : 'rgba(255,255,255,0.7)' }]}>OFFICIAL MESSAGES & NOTICES</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
               <Ionicons name="refresh" size={20} color="#FFF" />
            </TouchableOpacity>
         </View>

         <View style={[styles.tabContainer, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <TouchableOpacity 
              onPress={() => setActiveTab('NOTICE')}
              style={[styles.tab, activeTab === 'NOTICE' && { backgroundColor: theme.accent }]}
            >
              <Text style={[styles.tabText, activeTab === 'NOTICE' ? { color: '#FFF' } : { color: '#94A3B8' }]}>NOTICE BOARD</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('MESSAGE')}
              style={[styles.tab, activeTab === 'MESSAGE' && { backgroundColor: theme.accent }]}
            >
              <Text style={[styles.tabText, activeTab === 'MESSAGE' ? { color: '#FFF' } : { color: '#94A3B8' }]}>DIRECT MESSAGES</Text>
            </TouchableOpacity>
         </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      >
        {loading ? (
           <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 50 }} />
        ) : filteredData.length === 0 ? (
           <View style={styles.emptyContainer}>
              <Ionicons name={activeTab === 'NOTICE' ? 'notifications-off' : 'chatbubble-ellipses-outline'} size={60} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No {activeTab.toLowerCase()}s found</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>Official updates will appear here</Text>
           </View>
        ) : (
           filteredData.map((item) => (
              <TouchableOpacity key={item.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setSelectedItem(item)}>
                 <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: activeTab === 'NOTICE' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(139, 92, 246, 0.1)' }]}>
                       <Ionicons 
                         name={activeTab === 'NOTICE' ? 'megaphone' : 'mail'} 
                         size={20} 
                         color={activeTab === 'NOTICE' ? '#F59E0B' : '#8B5CF6'} 
                       />
                    </View>
                    <View style={styles.cardTitleBox}>
                       <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                       <Text style={[styles.cardDate, { color: theme.textSecondary }]}>{new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    {!item.is_read && <View style={styles.unreadDot} />}
                 </View>
                 <Text style={[styles.cardMessage, { color: theme.textSecondary }]} numberOfLines={2}>{item.message}</Text>
              </TouchableOpacity>
           ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  subtitle: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  refreshBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  tabContainer: { flexDirection: 'row', borderRadius: 15, padding: 5 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 10, fontWeight: '900' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  card: { borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitleBox: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 15, fontWeight: '900', textTransform: 'uppercase' },
  cardDate: { fontSize: 10, fontWeight: '700', marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  cardMessage: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { fontSize: 18, fontWeight: '900', marginTop: 20 },
  emptySub: { fontSize: 12, fontWeight: '600', marginTop: 5 },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    padding: 5,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  modalDate: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 15,
  },
  modalDivider: {
    height: 1,
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  modalOkBtn: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalOkBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
