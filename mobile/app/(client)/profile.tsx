import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import Header from '../../components/Header';
import Card from '../../components/Card';

const MENU_ITEMS = [
  { icon: 'person-outline', label: 'ข้อมูลส่วนตัว', desc: 'แก้ไขชื่อและอีเมล' },
  { icon: 'lock-closed-outline', label: 'เปลี่ยนรหัสผ่าน', desc: 'อัพเดทรหัสผ่าน' },
  { icon: 'shield-checkmark-outline', label: 'ความเป็นส่วนตัว', desc: 'จัดการข้อมูลส่วนตัว' },
  { icon: 'notifications-outline', label: 'การแจ้งเตือน', desc: 'ตั้งค่าการแจ้งเตือน' },
  { icon: 'help-circle-outline', label: 'ช่วยเหลือ', desc: 'คำถามที่พบบ่อย' },
  { icon: 'chatbox-ellipses-outline', label: 'ติดต่อเรา', desc: 'ส่งข้อความถึงทีม' },
];

export default function ClientProfile() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบ?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ออกจากระบบ', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="โปรไฟล์" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || '?'}</Text>
          </View>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="heart" size={13} color={Colors.secondary} />
            <Text style={styles.roleText}>ผู้รับบริการ</Text>
          </View>
        </View>

        {/* My Counselor */}
        <Card style={styles.counselorCard}>
          <Text style={styles.counselorLabel}>นักจิตวิทยาของคุณ</Text>
          <View style={styles.counselorRow}>
            <View style={styles.counselorAvatar}>
              <Ionicons name="medical" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.counselorName}>ดร. สุภาพร มั่นคง</Text>
              <Text style={styles.counselorSpec}>จิตวิทยาคลินิก · 5 ปีประสบการณ์</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'เซสชัน', value: '5', icon: 'calendar-outline' },
            { label: 'ประเมิน', value: '8 ครั้ง', icon: 'clipboard-outline' },
            { label: 'สัปดาห์', value: '3', icon: 'time-outline' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Ionicons name={s.icon as any} size={20} color={Colors.secondary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <Card style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity key={i} style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}>
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon as any} size={20} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileSection: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 },
  avatarLarge: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: '700', color: Colors.white },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.text },
  userEmail: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: Colors.secondaryLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  roleText: { fontSize: 13, color: Colors.secondary, fontWeight: '600' },
  counselorCard: { marginHorizontal: 20, marginBottom: 16 },
  counselorLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 10 },
  counselorRow: { flexDirection: 'row', alignItems: 'center' },
  counselorAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  counselorName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  counselorSpec: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: Colors.surface, borderRadius: 16, padding: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  menuCard: { marginHorizontal: 20, padding: 0, overflow: 'hidden', marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.secondaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  menuDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.error + '12', borderWidth: 1, borderColor: Colors.error + '30' },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.error },
});
