import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const scale = Math.min(width * 0.85 / 330, 1.2); 

interface IDCardProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const IDCardModal: React.FC<IDCardProps> = ({ isOpen, onClose, data }) => {
  const { theme, isDark } = useTheme();
  if (!isOpen || !data) return null;

  const studentPhoto = data.parent?.student_photo;
  const profile = data.parent?.student_profile || {};
  const contactNo = data.parent?.student_login_id || '8102522355';

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.7)' }]}>
        
        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={onClose} style={[styles.controlBtn, { backgroundColor: '#f43f5e', shadowColor: '#f43f5e' }]}>
             <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={[styles.outerFrame, { backgroundColor: isDark ? '#2a2c38' : '#cbd5e1' }]}>
          
          <View style={styles.idCard}>
             
             {/* Header Section */}
             <View style={styles.headerArea}>
                
                {/* Logo */}
                <View style={styles.logoWrapper}>
                   <View style={styles.logoInner}>
                     <Image source={require('../assets/logo.jpeg')} style={styles.logoImg} />
                   </View>
                </View>
                
                <View style={styles.dividerLine} />

                <Text style={styles.schoolTitle}>(AN ENGLISH MEDIUM SCHOOL)</Text>
                <Text style={styles.affiliation}>Affiliated to State Board Of Govt.</Text>

                {/* Exact Dynamic Tapering Wave Design - Thick center, thin edges */}
                <View style={[styles.waveContainer, { zIndex: 10 }]}>
                  <Svg viewBox="0 0 1000 140" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: 75 * scale }}>
                     <Path d="M0,20 Q500,110 1000,40 L1000,140 L0,140 Z" fill="#ffffff" />
                     <Path d="M0,30 Q500,145 1000,50 L1000,140 L0,140 Z" fill="#eab308" />
                     <Path d="M0,40 Q500,180 1000,60 L1000,140 L0,140 Z" fill="#236b2b" />
                     <Path d="M0,50 Q500,215 1000,70 L1000,140 L0,140 Z" fill="#ffffff" />
                  </Svg>
                </View>
             </View>

             {/* Profile Photo - Precise White Outer, Yellow Inner Border */}
             <View style={styles.photoContainer}>
                <View style={styles.photoOuterFrame}>
                   <View style={styles.photoInnerFrame}>
                     {studentPhoto ? (
                        <Image source={{ uri: studentPhoto }} style={styles.studentImg} />
                     ) : (
                        <Ionicons name="person" size={50} color="#cbd5e1" />
                     )}
                   </View>
                </View>
             </View>

             {/* Body Content */}
             <View style={styles.bodyContent}>
                <Text style={styles.studentNameText} numberOfLines={1}>{profile.name || 'STUDENT NAME'}</Text>
                <Text style={styles.sessionText}>SESSION: 2026 / 2027</Text>

                {/* Data Grid precisely aligned */}
                <View style={styles.infoGrid}>
                   <DetailRow label="STUDENT ID" value={profile.admission_no || '-'} />
                   <DetailRow label="FATHER NAME" value={profile.father_name || '-'} />
                   <DetailRow label="CLASS/ SEC" value={`${profile.class || '-'} ${profile.section ? '- ' + profile.section : ''}`} />
                   <DetailRow label="BLOOD GROUP" value={profile.blood_group || 'A+'} />
                   <DetailRow label="D.O.B" value={profile.dob || profile.date_of_birth || '-'} />
                   <DetailRow label="PHONE" value={contactNo} />
                </View>
             </View>

             {/* Footer */}
             <View style={styles.footerArea}>
                <Text style={[styles.footerAddress, { textAlign: 'center' }]}>NEAR PVS BANKA,{'\n'}BANKA - BIHAR 813102</Text>
                <Text style={styles.footerContact}>CONTACT NO. {contactNo}</Text>
             </View>

          </View>

        </View>

      </View>
    </Modal>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <View style={styles.labelCol}>
      <Text style={styles.detailLabel}>{label} :</Text>
    </View>
    <View style={styles.valCol}>
      <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsRow: {
    position: 'absolute',
    top: height * 0.08,
    right: 25,
    zIndex: 200,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    elevation: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  outerFrame: {
    backgroundColor: '#2a2c38',
    padding: 10 * scale,
    borderRadius: 24 * scale,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  idCard: {
    width: 330 * scale,
    height: 550 * scale,
    backgroundColor: '#FFF',
    borderRadius: 16 * scale,
    overflow: 'hidden',
  },
  headerArea: {
    height: 210 * scale,
    backgroundColor: '#236b2b',
    alignItems: 'center',
    paddingTop: 25 * scale,
    position: 'relative',
  },
  logoWrapper: {
    width: 68 * scale,
    height: 68 * scale,
    borderRadius: 34 * scale,
    backgroundColor: '#FFF',
    padding: 2 * scale,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#eab308',
  },
  logoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 34 * scale,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },
  dividerLine: {
    width: 160 * scale,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginVertical: 10 * scale,
    zIndex: 20,
  },
  schoolTitle: {
    color: '#FFF',
    fontSize: 10.5 * scale,
    fontWeight: '900',
    letterSpacing: 2 * scale,
    textAlign: 'center',
    zIndex: 20,
  },
  affiliation: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 7.5 * scale,
    fontWeight: '800',
    letterSpacing: 1 * scale,
    textAlign: 'center',
    marginTop: 4 * scale,
    zIndex: 20,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80 * scale,
    overflow: 'hidden',
    zIndex: 10,
  },
  photoContainer: {
    position: 'absolute',
    top: 148 * scale,
    left: '50%',
    transform: [{ translateX: -55 * scale }],
    zIndex: 30,
  },
  photoOuterFrame: {
    width: 110 * scale,
    height: 110 * scale,
    borderRadius: 55 * scale,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  photoInnerFrame: {
    width: 100 * scale,
    height: 100 * scale,
    borderRadius: 50 * scale,
    borderWidth: 3 * scale,
    borderColor: '#eab308',
    backgroundColor: '#FFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentImg: {
    width: '100%',
    height: '100%',
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 62 * scale,
    paddingHorizontal: 25 * scale,
    backgroundColor: '#FFF',
  },
  studentNameText: {
    color: '#1a5d1a',
    fontSize: 22 * scale,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  sessionText: {
    color: '#334155',
    fontSize: 10 * scale,
    fontWeight: '900',
    letterSpacing: 1.5 * scale,
    marginTop: 2 * scale,
    marginBottom: 20 * scale,
  },
  infoGrid: {
    width: '90%',
    alignSelf: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8 * scale,
  },
  labelCol: {
    width: '45%',
    alignItems: 'flex-end',
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 10 * scale,
    fontWeight: '900',
    letterSpacing: 0.5 * scale,
  },
  valCol: {
    width: '55%',
    paddingLeft: 8 * scale,
  },
  detailValue: {
    color: '#1e293b',
    fontSize: 10 * scale,
    fontWeight: '900',
  },
  footerArea: {
    height: 65 * scale,
    backgroundColor: '#236b2b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerAddress: {
    color: '#FFF',
    fontSize: 10 * scale,
    fontWeight: '900',
    letterSpacing: 0.5 * scale,
    marginBottom: 4 * scale,
  },
  footerContact: {
    color: '#eab308',
    fontSize: 10 * scale,
    fontWeight: '900',
    letterSpacing: 1.5 * scale,
  }
});

export default IDCardModal;
