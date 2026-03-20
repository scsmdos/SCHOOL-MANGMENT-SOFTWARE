import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const MENU_ITEMS = [
  { id: 1, title: 'Timetable', icon: 'calendar-outline', color: '#10B981', bgColor: '#E0F8ED' },
  { id: 2, title: 'Homework', icon: 'book-outline', color: '#3B82F6', bgColor: '#E6EFFF' },
  { id: 3, title: 'Fees Paid', icon: 'wallet-outline', color: '#F59E0B', bgColor: '#FFF4E6' },
  { id: 4, title: 'Exams', icon: 'document-text-outline', color: '#EF4444', bgColor: '#FFE6E6' },
  { id: 5, title: 'Live Bus', icon: 'bus-outline', color: '#8B5CF6', bgColor: '#F2EBFF', badge: 'LIVE' },
  { id: 6, title: 'Results', icon: 'ribbon-outline', color: '#D946EF', bgColor: '#FCE9FA' },
  { id: 7, title: 'Leaves', icon: 'calendar-clear-outline', color: '#10B981', bgColor: '#E0F8ED' },
  { id: 8, title: 'Support', icon: 'help-circle-outline', color: '#6B7280', bgColor: '#F3F4F6' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        
        {/* Top Header Section */}
        <LinearGradient
          colors={['#4F46E5', '#CD48B9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.statusText}>09:58 PM • LIVE ACCESS</Text>
              <Text style={styles.welcomeText}>WELCOME BACK</Text>
              <Text style={styles.studentName}>Aarav Sharma</Text>
              
              <View style={styles.classBatch}>
                <Text style={styles.classBatchText}>Class 10 - A • STU-26-0045</Text>
              </View>
            </View>

            <View style={styles.profileContainer}>
              <View style={styles.profilePic}>
                <Ionicons name="person-outline" size={30} color="#FFF" />
              </View>
              <View style={styles.onlineDot} />
            </View>
          </View>

          {/* Inner Card on Header */}
          <View style={styles.headerCard}>
            <View style={styles.headerCardInner}>
              <View style={styles.statsContainer}>
                <View>
                  <Text style={styles.statsLabel}>ATTENDANCE</Text>
                  <Text style={styles.statsValue}>92%</Text>
                </View>
                <View style={styles.divider} />
                <View>
                  <Text style={styles.statsLabel}>NEXT CLASS</Text>
                  <Text style={styles.statsValueNext}>Physics Lab</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.idCardButton}>
                <Text style={styles.idCardText}>ID CARD</Text>
                <Feather name="external-link" size={14} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Dashboard Grid Menu */}
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                {item.badge && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Updates Section */}
        <View style={styles.updatesSection}>
          <View style={styles.updatesHeader}>
            <Text style={styles.sectionTitle}>RECENT UPDATES</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          {/* Update Card 1 */}
          <View style={styles.updateCard}>
            <View style={[styles.updateIconContainer, { backgroundColor: 'rgba(79, 70, 229, 0.15)' }]}>
              <Ionicons name="bus" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.updateContent}>
              <View style={styles.updateContentHeader}>
                <Text style={styles.updateTitle}>School Bus Arriving</Text>
                <Text style={styles.updateTime}>10m ago</Text>
              </View>
              <Text style={styles.updateDesc}>Route RT-02 is approaching your stop.</Text>
            </View>
          </View>
          
          {/* Update Card 2 (Placeholder) */}
          <View style={[styles.updateCard, { marginTop: 15 }]}>
            <View style={[styles.updateIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="chatbubbles" size={20} color="#10B981" />
            </View>
            <View style={styles.updateContent}>
              <View style={styles.updateContentHeader}>
                <Text style={styles.updateTitle}>New Message from Teacher</Text>
                <Text style={styles.updateTime}>2h ago</Text>
              </View>
              <Text style={styles.updateDesc}>Please check the new physics homework.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F24', // Dark theme background matching screenshot
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingBottom: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  statusText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 5,
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
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  headerCard: {
    marginHorizontal: 25,
    marginTop: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  headerCardInner: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statsValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  statsValueNext: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 15,
  },
  idCardButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  idCardText: {
    color: '#4F46E5',
    fontWeight: '900',
    fontSize: 12,
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
});
