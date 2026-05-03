import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Shadows } from '../../constants/Colors';
import Card from '../../components/Card';
import { MOOD_LABELS } from '../../constants/Assessments';
import { format } from 'date-fns';

const MOCK_LATEST_RESULTS = [
  { type: 'PHQ-9', score: 8, maxScore: 27, severity: 'น้อย', color: Colors.mild, date: new Date().toISOString() },
  { type: 'GAD-7', score: 6, maxScore: 21, severity: 'น้อย', color: Colors.mild, date: new Date().toISOString() },
];

const MOOD_COLORS: Record<number, string> = {
  1: '#E53935', 2: '#FF7043', 3: '#FFA726', 4: '#AED581', 5: '#66BB6A',
};

export default function ClientHome() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [moodRecorded, setMoodRecorded] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const recordMood = (mood: number) => {
    setTodayMood(mood);
    setMoodRecorded(true);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'อรุณสวัสดิ์';
    if (h < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.secondary]} />}
    >
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.userName}>{user?.fullName}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || '😊'}</Text>
        </View>
      </View>

      {/* Counselor Info */}
      <Card style={styles.counselorCard}>
        <View style={styles.counselorRow}>
          <View style={styles.counselorAvatar}>
            <Ionicons name="medical" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.counselorLabel}>นักจิตวิทยาของคุณ</Text>
            <Text style={styles.counselorName}>ดร. สุภาพร มั่นคง</Text>
          </View>
          <TouchableOpacity style={styles.chatQuickBtn} onPress={() => router.push('/(client)/chat')}>
            <Ionicons name="chatbubble" size={18} color={Colors.primary} />
            <Text style={styles.chatQuickText}>แชท</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Mood Check-in */}
      <Card style={styles.moodCard} variant="elevated">
        <Text style={styles.moodTitle}>
          {moodRecorded ? '✅ บันทึกอารมณ์แล้ว' : 'วันนี้คุณรู้สึกอย่างไร?'}
        </Text>
        {moodRecorded && todayMood ? (
          <View style={styles.moodResult}>
            <Text style={styles.moodResultEmoji}>{MOOD_LABELS[todayMood].split(' ')[1]}</Text>
            <Text style={[styles.moodResultText, { color: MOOD_COLORS[todayMood] }]}>
              {MOOD_LABELS[todayMood].split(' ')[0]}
            </Text>
            <TouchableOpacity onPress={() => setMoodRecorded(false)}>
              <Text style={styles.changeText}>เปลี่ยน</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.moodOptions}>
            {[1, 2, 3, 4, 5].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.moodBtn, todayMood === m && { borderColor: MOOD_COLORS[m], borderWidth: 3 }]}
                onPress={() => recordMood(m)}
              >
                <Text style={styles.moodEmoji}>{MOOD_LABELS[m].split(' ')[1]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      {/* Assessment Results */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ผลการประเมินล่าสุด</Text>
        <TouchableOpacity onPress={() => router.push('/(client)/assessments')}>
          <Text style={styles.viewAll}>ดูทั้งหมด</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.assessmentRow}>
        {MOCK_LATEST_RESULTS.map((r) => (
          <Card key={r.type} style={styles.assessmentMini}>
            <Text style={styles.assessmentType}>{r.type}</Text>
            <Text style={[styles.assessmentScore, { color: r.color }]}>{r.score}/{r.maxScore}</Text>
            <View style={[styles.severityBar]}>
              <View style={[styles.severityFill, { width: `${(r.score / r.maxScore) * 100}%`, backgroundColor: r.color }]} />
            </View>
            <Text style={[styles.assessmentSeverity, { color: r.color }]}>{r.severity}</Text>
          </Card>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>เมนูหลัก</Text>
      <View style={styles.quickGrid}>
        {[
          { icon: 'clipboard', label: 'ทำแบบประเมิน', color: Colors.secondary, route: '/(client)/assessments' },
          { icon: 'chatbubbles', label: 'แชทกับนักจิตวิทยา', color: Colors.primary, route: '/(client)/chat' },
          { icon: 'trending-up', label: 'ดูความคืบหน้า', color: Colors.accent, route: '/(client)/progress' },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.quickItem} onPress={() => router.push(item.route as any)}>
            <View style={[styles.quickIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={28} color={item.color} />
            </View>
            <Text style={styles.quickLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tips */}
      <Card style={styles.tipCard} variant="flat">
        <View style={styles.tipRow}>
          <Text style={styles.tipEmoji}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>เคล็ดลับสุขภาพจิต</Text>
            <Text style={styles.tipText}>การออกกำลังกาย 30 นาทีต่อวัน ช่วยลดความวิตกกังวลและเพิ่มความสุขได้อย่างมีนัยสำคัญ</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  greetingSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 2 },
  avatarCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.white, fontSize: 22, fontWeight: '700' },
  counselorCard: { marginHorizontal: 20, marginBottom: 16 },
  counselorRow: { flexDirection: 'row', alignItems: 'center' },
  counselorAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  counselorLabel: { fontSize: 11, color: Colors.textSecondary },
  counselorName: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 1 },
  chatQuickBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  chatQuickText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  moodCard: { marginHorizontal: 20, marginBottom: 20 },
  moodTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 14, textAlign: 'center' },
  moodOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  moodEmoji: { fontSize: 24 },
  moodResult: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  moodResultEmoji: { fontSize: 32 },
  moodResultText: { fontSize: 18, fontWeight: '700' },
  changeText: { fontSize: 13, color: Colors.textSecondary, textDecorationLine: 'underline' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, paddingHorizontal: 20, marginBottom: 12 },
  viewAll: { fontSize: 13, color: Colors.secondary, fontWeight: '600' },
  assessmentRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  assessmentMini: { flex: 1 },
  assessmentType: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  assessmentScore: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  severityBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, marginBottom: 6, overflow: 'hidden' },
  severityFill: { height: '100%', borderRadius: 2 },
  assessmentSeverity: { fontSize: 12, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  quickItem: { flex: 1, alignItems: 'center', gap: 8 },
  quickIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: 11, color: Colors.text, fontWeight: '600', textAlign: 'center' },
  tipCard: { marginHorizontal: 20 },
  tipRow: { flexDirection: 'row', gap: 12 },
  tipEmoji: { fontSize: 24 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  tipText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
