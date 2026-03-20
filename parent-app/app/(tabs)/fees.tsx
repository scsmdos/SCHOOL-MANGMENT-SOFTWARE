import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

const LOGO = require('../../assets/logo.png');

export default function FeesScreen() {
  const { theme, isDark } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const loginId = await AsyncStorage.getItem('parent_login_id');
        if (!loginId) { setLoading(false); return; }

        const response = await fetch(`http://10.32.136.136:8000/api/parent-dashboard/${loginId}`);
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.log('Fees fetch error:', err);
      }
      setLoading(false);
    };
    fetchFees();
  }, []);

  const feesData = data?.fees || { invoices: [] };
  const studentProfile = data?.parent?.student_profile || {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Fee Management</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : (
          <>
            <View style={[styles.overview, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <View style={styles.overviewBox}>
                  <Text style={styles.overviewLabel}>Total Due</Text>
                  <Text style={styles.overviewValDue}>₹{feesData?.total_due || '0'}</Text>
               </View>
               <View style={[styles.divider, { backgroundColor: theme.border }]} />
               <View style={styles.overviewBox}>
                  <Text style={styles.overviewLabel}>Last Paid</Text>
                  <Text style={styles.overviewValPaid}>₹{feesData?.last_paid_amount || '0'}</Text>
               </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Invoices</Text>
            {feesData?.invoices?.length > 0 ? (
              feesData.invoices.map((inv: any, index: number) => {
                const isPaid = inv.status === 'Paid' || inv.status === 'Completed' || inv.status === 'PAID';
                return (
                  <View key={index} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.cardLeft}>
                       <Text style={[styles.invTerm, { color: theme.text }]}>{inv.term}</Text>
                       <Text style={[styles.invDate, { color: theme.textSecondary }]}>{inv.date}</Text>
                    </View>
                    <View style={styles.cardRight}>
                       <Text style={[styles.invAmt, { color: theme.text }]}>₹{inv.amount}</Text>
                       <View style={[styles.statusBadge, { backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                         <Text style={[styles.statusTxt, { color: isPaid ? '#10B981' : '#EF4444' }]}>{inv.status}</Text>
                       </View>
                    </View>
                    <TouchableOpacity style={[styles.printBtn, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]} onPress={() => setSelectedInvoice(inv)}>
                      <Ionicons name="receipt-outline" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View style={styles.empty}>
                 <Text style={[styles.emptyTxt, { color: theme.textSecondary }]}>No Fee records found.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Invoice Modal for Parents */}
      {selectedInvoice && (
        <View style={styles.modalOverlay}>
           <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
             <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>

               {/* School Header */}
               <View style={[styles.invoiceHeader, { borderBottomColor: isDark ? '#334155' : '#1E3A8A' }]}>
                 <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
                 <Text style={[styles.schoolName, { color: isDark ? '#F1F5F9' : '#1E3A8A' }]}>LITTLE SEEDS SCHOOL</Text>
                 <Text style={[styles.affiliatedText, { color: theme.textSecondary }]}>AFFILIATED TO CBSE, NEW DELHI</Text>
               </View>

               {/* FEE RECEIPT Badge */}
               <View style={styles.badgeWrap}>
                 <Text style={[styles.badge, { backgroundColor: isDark ? '#0F172A' : '#EEF2FF', borderColor: isDark ? '#334155' : '#C7D2FE', color: isDark ? '#F1F5F9' : '#3730A3' }]}>FEE RECEIPT</Text>
               </View>

               {/* Meta Info */}
               <View style={styles.invoiceMeta}>
                 <View>
                   <Text style={styles.metaLabel}>Receipt No</Text>
                   <Text style={[styles.metaValue, { color: theme.text }]}>{selectedInvoice.id}</Text>
                   <Text style={[styles.metaLabel, { marginTop: 6 }]}>Date</Text>
                   <Text style={[styles.metaValue, { color: theme.text }]}>{selectedInvoice.date}</Text>
                 </View>
                 <View style={{ alignItems: 'flex-end' }}>
                   <Text style={styles.metaLabel}>Academic Year</Text>
                   <Text style={[styles.metaValue, { color: theme.text }]}>2025-26</Text>
                   <Text style={[styles.metaLabel, { marginTop: 6 }]}>Payment Mode</Text>
                   <Text style={[styles.metaValue, { color: theme.text }]}>{selectedInvoice.method || 'CASH'}</Text>
                 </View>
               </View>

               {/* Student Details - 2 columns */}
               <View style={[styles.studentDetailsBox, { borderColor: theme.border }]}>
                 <Text style={styles.sectionMiniTitle}>STUDENT DETAILS</Text>
                 <View style={styles.studentCols}>
                   <View style={styles.studentColLeft}>
                     <Text style={styles.dtLabel}>Student Name:</Text>
                     <Text style={[styles.dtValue, { color: theme.text }]}>{studentProfile.name || 'N/A'}</Text>
                     <Text style={[styles.dtLabel, { marginTop: 6 }]}>Class & Sec:</Text>
                     <Text style={[styles.dtValue, { color: theme.text }]}>{studentProfile.class || 'N/A'}</Text>
                   </View>
                   <View style={[styles.studentColDivider, { backgroundColor: theme.border }]} />
                   <View style={styles.studentColRight}>
                     <Text style={styles.dtLabel}>Father's Name:</Text>
                     <Text style={[styles.dtValue, { color: theme.text }]}>{studentProfile.father_name || 'N/A'}</Text>
                     <Text style={[styles.dtLabel, { marginTop: 6 }]}>Roll No:</Text>
                     <Text style={[styles.dtValue, { color: theme.text }]}>{studentProfile.roll_no || 'N/A'}</Text>
                   </View>
                 </View>
               </View>

               {/* Particulars Table */}
               <View style={[styles.particularsTable, { borderColor: theme.border }]}>
                  <View style={[styles.partHeader, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderBottomColor: theme.border, borderTopColor: theme.border }]}>
                     <Text style={[styles.partLabel, { flex: 1 }]}>PARTICULARS</Text>
                     <Text style={[styles.partLabel, { width: 90, textAlign: 'right' }]}>AMOUNT (INR)</Text>
                  </View>
                  <View style={[styles.partRow, { borderBottomColor: theme.border }]}>
                     <Text style={[styles.partVal, { flex: 1, color: theme.text }]}>{selectedInvoice.term}</Text>
                     <Text style={[styles.partVal, { width: 90, textAlign: 'right', color: theme.text }]}>₹{selectedInvoice.amount}</Text>
                  </View>
                  <View style={[styles.partFooter, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4', borderTopColor: theme.border }]}>
                     <Text style={[styles.partTotalLabel, { color: isDark ? '#10B981' : '#475569' }]}>TOTAL AMOUNT PAID</Text>
                     <Text style={[styles.partTotalVal, { color: isDark ? '#34D399' : '#166534' }]}>₹{selectedInvoice.amount}</Text>
                  </View>
               </View>

               {/* Signatures */}
               <View style={styles.signatureRow}>
                  <View style={[styles.signLine, { borderTopColor: theme.textSecondary }]}><Text style={[styles.signText, { color: theme.textSecondary }]}>Cashier / Clerk</Text></View>
                  <View style={[styles.signLine, { borderTopColor: theme.textSecondary }]}><Text style={[styles.signText, { color: theme.textSecondary }]}>Authorized Signatory</Text></View>
               </View>

               {/* Footer */}
               <View style={[styles.footerDash, { borderTopColor: theme.border }]}>
                 <Text style={styles.computerTag}>This is a computer generated receipt and does not require a physical signature.</Text>
               </View>

               <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.accent }]} onPress={() => setSelectedInvoice(null)}>
                 <Text style={styles.closeBtnTxt}>CLOSE RECEIPT</Text>
               </TouchableOpacity>
             </View>
           </ScrollView>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 55, borderBottomWidth: 1 },
  backBtn: { marginRight: 15 },
  title: { fontSize: 20, fontWeight: '800' },
  content: { padding: 20 },
  overview: { flexDirection: 'row', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, alignItems: 'center' },
  overviewBox: { flex: 1, alignItems: 'center' },
  divider: { width: 1, height: 40 },
  overviewLabel: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  overviewValDue: { color: '#EF4444', fontSize: 24, fontWeight: '900', marginTop: 5 },
  overviewValPaid: { color: '#10B981', fontSize: 24, fontWeight: '900', marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15 },
  card: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderRadius: 16, paddingRight: 50, marginBottom: 15, borderWidth: 1, position: 'relative' },
  cardLeft: { flex: 1 },
  invTerm: { fontSize: 15, fontWeight: '800' },
  invDate: { fontSize: 11, fontWeight: '600', marginTop: 5 },
  cardRight: { alignItems: 'flex-end' },
  invAmt: { fontSize: 16, fontWeight: '900' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 5 },
  statusTxt: { fontSize: 10, fontWeight: '800' },
  printBtn: { position: 'absolute', right: 15, top: 25, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyTxt: { fontSize: 14, fontWeight: '600' },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000 },
  modalContent: { borderRadius: 12, padding: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },

  invoiceHeader: { alignItems: 'center', borderBottomWidth: 2, paddingBottom: 12, marginBottom: 12 },
  logoImg: { height: 52, width: 52, marginBottom: 6 },
  schoolName: { fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  affiliatedText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },

  badgeWrap: { alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 14, paddingVertical: 3, borderRadius: 4, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, overflow: 'hidden', borderWidth: 1 },

  invoiceMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metaLabel: { color: '#64748B', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  metaValue: { fontSize: 12, fontWeight: '800', marginTop: 1 },

  studentDetailsBox: { borderWidth: 1, borderRadius: 6, padding: 10, marginBottom: 14 },
  sectionMiniTitle: { color: '#94A3B8', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  studentCols: { flexDirection: 'row' },
  studentColLeft: { flex: 1, paddingRight: 8 },
  studentColDivider: { width: 1, marginHorizontal: 6 },
  studentColRight: { flex: 1, paddingLeft: 8 },
  dtLabel: { color: '#64748B', fontSize: 10, fontWeight: '600' },
  dtValue: { fontSize: 12, fontWeight: '800', marginTop: 1 },

  particularsTable: { borderWidth: 1, marginBottom: 20 },
  partHeader: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderTopWidth: 1 },
  partLabel: { color: '#64748B', fontSize: 10, fontWeight: '800' },
  partRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1 },
  partVal: { fontSize: 12, fontWeight: '700' },
  partFooter: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderTopWidth: 2 },
  partTotalLabel: { fontSize: 11, fontWeight: '800' },
  partTotalVal: { fontSize: 14, fontWeight: '900' },

  signatureRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 12 },
  signLine: { borderTopWidth: 1, paddingTop: 5, width: '40%', alignItems: 'center' },
  signText: { fontSize: 9 },

  footerDash: { borderTopWidth: 1, paddingTop: 8, marginBottom: 16, alignItems: 'center' },
  computerTag: { color: '#94A3B8', fontSize: 9, fontStyle: 'italic', textAlign: 'center' },

  closeBtn: { paddingVertical: 13, borderRadius: 8, alignItems: 'center' },
  closeBtnTxt: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1 }
});
