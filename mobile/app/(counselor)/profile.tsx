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
  { icon: 'notifications-outline', label: 'การแจ้งเตือน', desc: 'ตั้งค่าการแจ้งเตือน' },
  { icon: 'language-outline', label: 'ภาษา', desc: 'ไทย / English' },
  { icon: 'help-circle-outline', label: 'ช่วยเหลือ', desc: 'คำถามที่พบบ่อย' },
  { icon: 'information-circle-outline', label: 'เกี่ยวกับแอป', desc: 'เวอร์ชัน 1.0.0' },
];

export default function CounselorProfile() {
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
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || '?'}</Text>
          </View>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="medical" size={13} color={Colors.primary} />
            <Text style={styles.roleText}>นักจิตวิทยา / ผู้ให้คำปรึกษา</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'ผู้รับบริการ', value: '8 คน', icon: 'people' },
            { label: 'บันทึกทั้งหมด', value: '42 ครั้ง', icon: 'document-text' },
            { label: 'ปีที่ทำงาน', value: '3 ปี', icon: 'star' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Ionicons name={s.icon as any} size={20} color={Colors.primary} />
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
                <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Logout */}
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
  avatarLarge: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: '700', color: Colors.white },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.text },
  userEmail: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: Colors.primaryLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  roleText: { fontSize: 13, color: Colors.primaryDark, fontWeight: '600' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 0 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  menuCard: { marginHorizontal: 20, padding: 0, overflow: 'hidden', marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  menuDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.error + '12', borderWidth: 1, borderColor: Colors.error + '30' },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.error },
});
