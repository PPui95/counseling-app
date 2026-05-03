import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Shadows } from '../../constants/Colors';
import Card from '../../components/Card';
import { sessionService, clientService } from '../../services/api';
import { format } from 'date-fns';

const MOCK_STATS = { totalClients: 8, sessionsThisMonth: 14, upcomingFollowUps: 3, avgSessionDuration: 52 };

const RECENT_SESSIONS = [
  { id: '1', clientName: 'สมชาย ใจดี', date: new Date().toISOString(), problem: 'ความเครียดจากการทำงาน', techniques: ['การฟังอย่างตั้งใจ', 'CBT'], duration: 50 },
  { id: '2', clientName: 'นิดา แสงทอง', date: new Date(Date.now() - 86400000).toISOString(), problem: 'ความสัมพันธ์ในครอบครัว', techniques: ['การสะท้อน', 'การยืนยันความรู้สึก'], duration: 60 },
  { id: '3', clientName: 'ปรีชา มณีรัตน์', date: new Date(Date.now() - 172800000).toISOString(), problem: 'ความวิตกกังวลและนอนไม่หลับ', techniques: ['Mindfulness', 'CBT'], duration: 45 },
];

export default function CounselorHome() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'สวัสดีตอนเช้า';
    if (h < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userRole}>นักจิตวิทยา / ผู้ให้คำปรึกษา</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || '👨‍⚕️'}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>สรุปภาพรวม</Text>
      <View style={styles.statsGrid}>
        {[
          { label: 'ผู้รับบริการ', value: MOCK_STATS.totalClients, icon: 'people', color: Colors.primary },
          { label: 'เดือนนี้', value: MOCK_STATS.sessionsThisMonth, icon: 'calendar', color: Colors.secondary },
          { label: 'ติดตาม', value: MOCK_STATS.upcomingFollowUps, icon: 'time', color: Colors.accent },
          { label: 'เฉลี่ย/ครั้ง', value: `${MOCK_STATS.avgSessionDuration}น.`, icon: 'timer', color: Colors.primaryDark },
        ].map((stat, i) => (
          <View key={i} style={[styles.statCard, { borderTopColor: stat.color }]}>
            <Ionicons name={stat.icon as any} size={22} color={stat.color} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>การดำเนินการด่วน</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(counselor)/sessions?new=true')}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.primary + '20' }]}>
            <Ionicons name="add-circle" size={26} color={Colors.primary} />
          </View>
          <Text style={styles.actionText}>บันทึกใหม่</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(counselor)/clients')}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.secondary + '20' }]}>
            <Ionicons name="people" size={26} color={Colors.secondary} />
          </View>
          <Text style={styles.actionText}>ผู้รับบริการ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(counselor)/chat')}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.accent + '20' }]}>
            <Ionicons name="chatbubbles" size={26} color={Colors.accent} />
          </View>
          <Text style={styles.actionText}>แชท</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Sessions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>บันทึกล่าสุด</Text>
        <TouchableOpacity onPress={() => router.push('/(counselor)/sessions')}>
          <Text style={styles.viewAll}>ดูทั้งหมด</Text>
        </TouchableOpacity>
      </View>

      {RECENT_SESSIONS.map((session) => (
        <TouchableOpacity
          key={session.id}
          onPress={() => router.push(`/(counselor)/sessions?id=${session.id}`)}
        >
          <Card style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.clientAvatar}>
                <Text style={styles.clientAvatarText}>{session.clientName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.clientName}>{session.clientName}</Text>
                <Text style={styles.sessionDate}>
                  {format(new Date(session.date), 'dd MMM yyyy')} · {session.duration} นาที
                </Text>
              </View>
            </View>
            <Text style={styles.sessionProblem} numberOfLines={2}>{session.problem}</Text>
            <View style={styles.techniquesRow}>
              {session.techniques.map((t) => (
                <View key={t} style={styles.techniqueChip}>
                  <Text style={styles.techniqueChipText}>{t}</Text>
                </View>
              ))}
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  greetingSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 24,
  },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 2 },
  userRole: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  avatarCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 22, fontWeight: '700' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, paddingHorizontal: 20, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  viewAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, minWidth: '44%', backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, alignItems: 'center', borderTopWidth: 3,
    ...Shadows.small,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 6 },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 24 },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  actionText: { fontSize: 12, color: Colors.text, fontWeight: '600' },
  sessionCard: { marginHorizontal: 20, marginBottom: 12 },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  clientAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  clientAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  clientName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  sessionDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  sessionProblem: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  techniquesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  techniqueChip: { backgroundColor: Colors.primary + '15', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  techniqueChipText: { fontSize: 11, color: Colors.primaryDark, fontWeight: '600' },
});
