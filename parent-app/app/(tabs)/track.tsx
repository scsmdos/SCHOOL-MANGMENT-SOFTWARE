import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { CONFIG } from '../../constants/Config';
import { WebView } from 'react-native-webview';

export default function TrackScreen() {
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const webViewRef = useRef<WebView>(null);


  const fetchTracking = useCallback(async (admissionNo: string) => {
    try {
      const token = await AsyncStorage.getItem('parent_auth_token');
      const resp = await fetch(`${CONFIG.BASE_URL}/student-bus-tracking/${admissionNo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await resp.json();
      if (data.success) {
        setTrackingData(data);
        // Inject location update to WebView
        if (data.vehicle?.lat && data.vehicle?.lng) {
            const script = `updateBus(${data.vehicle.lat}, ${data.vehicle.lng})`;
            webViewRef.current?.injectJavaScript(script);
        }
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
    }
  }, []);

  const initData = async () => {
    setLoading(true);
    try {
      const loginId = await AsyncStorage.getItem('parent_login_id');
      const token = await AsyncStorage.getItem('parent_auth_token');
      if (!loginId) {
        Alert.alert('Error', 'Session lost. Please login again.');
        router.replace('/login');
        return;
      }
      
      const sResp = await fetch(`${CONFIG.BASE_URL}/parent-students/${loginId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const sData = await sResp.json();
      
      if (sData && Array.isArray(sData) && sData.length > 0) {
        setStudents(sData);
        setSelectedStudent(sData[0]);
        await fetchTracking(sData[0].admission_number || sData[0].id);
      }
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const interval = setInterval(() => {
      fetchTracking((selectedStudent as any).admission_number || (selectedStudent as any).id);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedStudent, fetchTracking]);

  const td = trackingData;
  const lat = td?.vehicle?.lat || 25.5941; // Fallback to Patna
  const lng = td?.vehicle?.lng || 85.1376;

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; background: #EEE; }
        .bus-icon { font-size: 24px; text-shadow: 2px 0 #FFF, -2px 0 #FFF, 0 2px #FFF, 0 -2px #FFF, 1px 1px #FFF, -1px -1px #FFF, 1px -1px #FFF, -1px 1px #FFF; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        var busMarker = L.marker([${lat}, ${lng}], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: "<div class='bus-icon'>🚌</div>",
            iconSize: [30, 42],
            iconAnchor: [15, 21]
          })
        }).addTo(map);

        function updateBus(nlat, nlng) {
          var newPos = [nlat, nlng];
          busMarker.setLatLng(newPos);
          map.panTo(newPos);
        }
      </script>
    </body>
    </html>
  `;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Syncing with Satellite...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Live Tracking</Text>
      </View>

      <View style={styles.flex1}>
         <WebView 
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.flex1}
         />
         
         {students.length > 1 && (
            <View style={styles.studentFloater}>
               {students.map((s: any) => (
                 <TouchableOpacity 
                   key={s.id} 
                   onPress={() => { setSelectedStudent(s); fetchTracking(s.admission_number || s.id); }}
                   style={[styles.smallTab, selectedStudent?.id === s.id && styles.activeTab]}
                 >
                    <Text style={[styles.smallTabText, selectedStudent?.id === s.id && styles.activeTabText]}>{s.name.split(' ')[0]}</Text>
                 </TouchableOpacity>
               ))}
            </View>
         )}
      </View>

      {td ? (
        <View style={[styles.infoCard, { backgroundColor: theme.header }]}>
          <View style={styles.driverInfo}>
            <View style={styles.avatar}><Ionicons name="person" size={20} color="#FFF" /></View>
            <View>
                <Text style={[styles.driverName, { color: theme.text }]}>{td?.driver?.name || 'Searching Driver...'}</Text>
                <Text style={[styles.busNo, { color: theme.textSecondary }]}>
                  {td?.vehicle?.reg_no || 'Vehicle Pending'}  •  {td?.route?.name || 'Assigning Route'}
                </Text>
            </View>
          </View>

          <View style={[styles.statusRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Ionicons name="time-outline" size={20} color={isDark ? '#8B5CF6' : '#6366F1'} />
                <Text style={[styles.statusValue, { color: theme.text }]}>{td?.eta || '--'}</Text>
                <Text style={styles.statusLabel}>ETA</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statusItem}>
                <Ionicons name="speedometer-outline" size={20} color="#10B981" />
                <Text style={[styles.statusValue, { color: theme.text }]}>{td?.speed || '--'}</Text>
                <Text style={styles.statusLabel}>Speed</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.callBtn, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="call" size={20} color="#FFF" />
            <Text style={styles.callBtnText}>Call Driver {td.driver?.phone}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.infoCard, { backgroundColor: theme.header }]}>
           <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>Wait for GPS signal...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 55, borderBottomWidth: 1, zIndex: 10 },
  backBtn: { marginRight: 15 },
  title: { fontSize: 20, fontWeight: '800' },
  flex1: { flex: 1 },
  studentFloater: { position: 'absolute', top: 20, left: 15, flexDirection: 'row', zIndex: 100 },
  smallTab: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 15, marginRight: 8, borderWidth: 1, borderColor: '#DDD' },
  smallTabText: { fontSize: 11, fontWeight: '800', color: '#64748B' },
  activeTab: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  activeTabText: { color: '#FFF' },
  infoCard: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, position: 'absolute', bottom: 0, width: '100%', elevation: 20, shadowColor: '#000' },
  driverInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  driverName: { fontSize: 16, fontWeight: '800' },
  busNo: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  statusRow: { flexDirection: 'row', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, alignItems: 'center' },
  statusItem: { flex: 1, alignItems: 'center' },
  statusValue: { fontSize: 16, fontWeight: '900', marginTop: 5 },
  statusLabel: { color: '#64748B', fontSize: 11, fontWeight: '700' },
  divider: { width: 1, height: '100%' },
  callBtn: { paddingVertical: 15, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  callBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900', marginLeft: 10 }
});
