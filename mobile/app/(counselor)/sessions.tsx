import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
  TextInput, Alert, FlatList, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/Colors';
import { COUNSELING_TECHNIQUES } from '../../constants/Assessments';
import { format } from 'date-fns';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Header from '../../components/Header';
import type { CounselingSession } from '../../types';

const MOCK_SESSIONS: CounselingSession[] = [
  {
    id: '1', counselorId: 'c1', clientId: 'u1', clientName: 'สมชาย ใจดี',
    date: new Date().toISOString(), duration: 50,
    presentingProblem: 'ความเครียดจากการทำงาน รู้สึกล้า ไม่อยากไปทำงาน',
    techniques: ['การฟังอย่างตั้งใจ', 'CBT'],
    notes: 'ผู้รับบริการมีความเครียดสะสมจากงาน ได้ฝึกเทคนิค CBT เพื่อปรับความคิดอัตโนมัติ',
    followUpPlan: 'ฝึก thought record ทุกวัน นัดพบสัปดาห์หน้า',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: '2', counselorId: 'c1', clientId: 'u2', clientName: 'นิดา แสงทอง',
    date: new Date(Date.now() - 86400000).toISOString(), duration: 60,
    presentingProblem: 'ความสัมพันธ์ในครอบครัว ความขัดแย้งกับพ่อแม่',
    techniques: ['การสะท้อน', 'การยืนยันความรู้สึก', 'การปรับมุมมอง'],
    notes: 'สะท้อนความรู้สึกและช่วยให้เห็นมุมมองของครอบครัว',
    followUpPlan: 'ลองคุยกับพ่อแม่ด้วยเทคนิค I-message',
    createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3', counselorId: 'c1', clientId: 'u3', clientName: 'ปรีชา มณีรัตน์',
    date: new Date(Date.now() - 172800000).toISOString(), duration: 45,
    presentingProblem: 'ความวิตกกังวลและนอนไม่หลับ',
    techniques: ['Mindfulness', 'CBT'],
    notes: 'สอนการหายใจแบบ 4-7-8 และ body scan ก่อนนอน',
    followUpPlan: 'ฝึก Mindfulness 10 นาทีก่อนนอน บันทึก sleep diary',
    createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const EMPTY_SESSION = {
  clientName: '', date: new Date().toISOString().split('T')[0], duration: '',
  presentingProblem: '', techniques: [] as string[], notes: '', followUpPlan: '',
};

export default function SessionsScreen() {
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_SESSION });
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = sessions.filter(
    (s) => s.clientName.includes(search) || s.presentingProblem.includes(search)
  );

  const openNew = () => {
    setForm({ ...EMPTY_SESSION });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (session: CounselingSession) => {
    setForm({
      clientName: session.clientName,
      date: session.date.split('T')[0],
      duration: String(session.duration),
      presentingProblem: session.presentingProblem,
      techniques: [...session.techniques],
      notes: session.notes,
      followUpPlan: session.followUpPlan,
    });
    setEditingId(session.id);
    setShowModal(true);
  };

  const saveSession = () => {
    if (!form.clientName.trim() || !form.presentingProblem.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'ชื่อผู้รับบริการและปัญหาจำเป็นต้องกรอก');
      return;
    }
    if (editingId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, ...form, duration: Number(form.duration) || 60, updatedAt: new Date().toISOString() }
            : s
        )
      );
    } else {
      const newSession: CounselingSession = {
        id: Date.now().toString(),
        counselorId: 'c1', clientId: '',
        ...form,
        duration: Number(form.duration) || 60,
        date: new Date(form.date).toISOString(),
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      setSessions((prev) => [newSession, ...prev]);
    }
    setShowModal(false);
  };

  const deleteSession = (id: string) => {
    Alert.alert('ยืนยันการลบ', 'คุณต้องการลบบันทึกนี้?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => setSessions((p) => p.filter((s) => s.id !== id)) },
    ]);
  };

  const toggleTechnique = (t: string) => {
    setForm((f) => ({
      ...f,
      techniques: f.techniques.includes(t) ? f.techniques.filter((x) => x !== t) : [...f.techniques, t],
    }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="บันทึก CO"
        subtitle="บันทึกการให้คำปรึกษา"
        rightAction={{ icon: 'add-circle-outline', onPress: openNew }}
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาชื่อหรือปัญหา..."
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); }} colors={[Colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>ยังไม่มีบันทึก</Text>
            <Text style={styles.emptySubtext}>แตะปุ่ม + เพื่อสร้างบันทึกใหม่</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            <View style={styles.sessionRow}>
              <View style={styles.sessionAvatar}>
                <Text style={styles.sessionAvatarText}>{item.clientName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.sessionClientName}>{item.clientName}</Text>
                <Text style={styles.sessionMeta}>
                  {format(new Date(item.date), 'dd/MM/yyyy')} · {item.duration} นาที
                </Text>
              </View>
              <View style={styles.sessionActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                  <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteSession(item.id)} style={styles.iconBtn}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.problemText} numberOfLines={2}>{item.presentingProblem}</Text>
            <View style={styles.techRow}>
              {item.techniques.map((t) => (
                <View key={t} style={styles.techChip}>
                  <Text style={styles.techChipText}>{t}</Text>
                </View>
              ))}
            </View>
            {item.followUpPlan ? (
              <View style={styles.followUp}>
                <Ionicons name="arrow-forward-circle" size={14} color={Colors.secondary} />
                <Text style={styles.followUpText} numberOfLines={1}>{item.followUpPlan}</Text>
              </View>
            ) : null}
          </Card>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'แก้ไขบันทึก' : 'บันทึกใหม่'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close-circle" size={28} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <FormField label="ชื่อผู้รับบริการ *" value={form.clientName} onChangeText={(v) => setForm((f) => ({ ...f, clientName: v }))} placeholder="ชื่อ-นามสกุล" />
              <FormField label="วันที่" value={form.date} onChangeText={(v) => setForm((f) => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" />
              <FormField label="ระยะเวลา (นาที)" value={form.duration} onChangeText={(v) => setForm((f) => ({ ...f, duration: v }))} placeholder="60" keyboardType="numeric" />
              <FormField label="ปัญหาที่นำมาปรึกษา *" value={form.presentingProblem} onChangeText={(v) => setForm((f) => ({ ...f, presentingProblem: v }))} placeholder="อธิบายปัญหา..." multiline />

              <Text style={styles.fieldLabel}>เทคนิคที่ใช้</Text>
              <View style={styles.techniquesGrid}>
                {COUNSELING_TECHNIQUES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.techOption, form.techniques.includes(t) && styles.techOptionActive]}
                    onPress={() => toggleTechnique(t)}
                  >
                    <Text style={[styles.techOptionText, form.techniques.includes(t) && styles.techOptionTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FormField label="บันทึกเพิ่มเติม" value={form.notes} onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))} placeholder="สังเกตการณ์ สิ่งที่เกิดขึ้นในเซสชัน..." multiline />
              <FormField label="แผนติดตาม" value={form.followUpPlan} onChangeText={(v) => setForm((f) => ({ ...f, followUpPlan: v }))} placeholder="งานบ้าน การนัดหมายครั้งถัดไป..." multiline />

              <Button title="บันทึก" onPress={saveSession} fullWidth size="large" style={{ marginTop: 16 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FormField({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', margin: 16,
    backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 10, fontSize: 14, color: Colors.text },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: Colors.text },
  emptySubtext: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sessionAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  sessionAvatarText: { fontSize: 17, fontWeight: '700', color: Colors.primary },
  sessionClientName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  sessionMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  sessionActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
  problemText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8, lineHeight: 18 },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  techChip: { backgroundColor: Colors.primary + '18', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  techChipText: { fontSize: 11, color: Colors.primaryDark, fontWeight: '600' },
  followUp: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  followUpText: { fontSize: 12, color: Colors.secondary, flex: 1 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 19, fontWeight: '700', color: Colors.text },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  fieldInput: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, padding: 10, fontSize: 14, color: Colors.text, backgroundColor: Colors.background },
  fieldInputMulti: { height: 80, textAlignVertical: 'top' },
  techniquesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  techOption: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  techOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  techOptionText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  techOptionTextActive: { color: Colors.primaryDark },
});
