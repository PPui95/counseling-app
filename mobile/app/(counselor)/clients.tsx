import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/Colors';
import { format } from 'date-fns';
import Card from '../../components/Card';
import Header from '../../components/Header';
import Badge from '../../components/Badge';

const MOCK_CLIENTS = [
  {
    id: 'u1', fullName: 'สมชาย ใจดี', email: 'somchai@example.com',
    totalSessions: 5, lastSessionDate: new Date().toISOString(),
    assignedCounselorId: 'c1', createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    latestPHQ9: { score: 8, severity: 'น้อย' },
    latestGAD7: { score: 6, severity: 'น้อย' },
    recentSessions: [
      { date: new Date().toISOString(), problem: 'ความเครียดงาน', techniques: ['CBT', 'Mindfulness'] },
      { date: new Date(Date.now() - 7 * 86400000).toISOString(), problem: 'นอนไม่หลับ', techniques: ['Mindfulness'] },
    ],
  },
  {
    id: 'u2', fullName: 'นิดา แสงทอง', email: 'nida@example.com',
    totalSessions: 3, lastSessionDate: new Date(Date.now() - 86400000).toISOString(),
    assignedCounselorId: 'c1', createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    latestPHQ9: { score: 12, severity: 'ปานกลาง' },
    latestGAD7: { score: 10, severity: 'ปานกลาง' },
    recentSessions: [
      { date: new Date(Date.now() - 86400000).toISOString(), problem: 'ความสัมพันธ์ครอบครัว', techniques: ['การสะท้อน'] },
    ],
  },
  {
    id: 'u3', fullName: 'ปรีชา มณีรัตน์', email: 'preecha@example.com',
    totalSessions: 7, lastSessionDate: new Date(Date.now() - 172800000).toISOString(),
    assignedCounselorId: 'c1', createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    latestPHQ9: { score: 4, severity: 'น้อยมาก' },
    latestGAD7: { score: 3, severity: 'น้อยมาก' },
    recentSessions: [
      { date: new Date(Date.now() - 172800000).toISOString(), problem: 'วิตกกังวล', techniques: ['Mindfulness', 'CBT'] },
    ],
  },
  {
    id: 'u4', fullName: 'วิมล รัตนสิงห์', email: 'wimon@example.com',
    totalSessions: 2, lastSessionDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    assignedCounselorId: 'c1', createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    latestPHQ9: { score: 15, severity: 'ค่อนข้างรุนแรง' },
    latestGAD7: { score: 12, severity: 'ปานกลาง' },
    recentSessions: [],
  },
];

const severityColor = (s: string) => {
  if (s === 'น้อยมาก') return Colors.minimal;
  if (s === 'น้อย') return Colors.mild;
  if (s === 'ปานกลาง') return Colors.moderate;
  if (s === 'ค่อนข้างรุนแรง') return Colors.moderatelySevere;
  return Colors.severe;
};

export default function ClientsScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<(typeof MOCK_CLIENTS)[0] | null>(null);

  const filtered = MOCK_CLIENTS.filter((c) => c.fullName.includes(search) || c.email.includes(search));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="ผู้รับบริการ" subtitle={`${MOCK_CLIENTS.length} คน`} />

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาชื่อหรืออีเมล..."
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedClient(item)}>
            <Card style={styles.clientCard}>
              <View style={styles.clientRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.clientName}>{item.fullName}</Text>
                  <Text style={styles.clientEmail}>{item.email}</Text>
                  <Text style={styles.clientMeta}>
                    {item.totalSessions} ครั้ง · ล่าสุด {format(new Date(item.lastSessionDate!), 'dd/MM/yy')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              </View>
              <View style={styles.assessmentRow}>
                <View style={styles.assessmentBadge}>
                  <Text style={styles.assessmentLabel}>PHQ-9</Text>
                  <Text style={[styles.assessmentValue, { color: severityColor(item.latestPHQ9.severity) }]}>
                    {item.latestPHQ9.score} ({item.latestPHQ9.severity})
                  </Text>
                </View>
                <View style={styles.assessmentDivider} />
                <View style={styles.assessmentBadge}>
                  <Text style={styles.assessmentLabel}>GAD-7</Text>
                  <Text style={[styles.assessmentValue, { color: severityColor(item.latestGAD7.severity) }]}>
                    {item.latestGAD7.score} ({item.latestGAD7.severity})
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Client Detail Modal */}
      <Modal visible={!!selectedClient} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            {selectedClient && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>{selectedClient.fullName.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.modalName}>{selectedClient.fullName}</Text>
                    <Text style={styles.modalEmail}>{selectedClient.email}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedClient(null)}>
                    <Ionicons name="close-circle" size={28} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Stats */}
                  <View style={styles.statsRow}>
                    {[
                      { label: 'จำนวนครั้ง', value: selectedClient.totalSessions },
                      { label: 'วันที่เริ่ม', value: format(new Date(selectedClient.createdAt), 'dd/MM/yy') },
                      { label: 'ครั้งล่าสุด', value: format(new Date(selectedClient.lastSessionDate!), 'dd/MM/yy') },
                    ].map((s, i) => (
                      <View key={i} style={styles.statBox}>
                        <Text style={styles.statBoxValue}>{s.value}</Text>
                        <Text style={styles.statBoxLabel}>{s.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Assessment Results */}
                  <Text style={styles.sectionTitle}>ผลการประเมินล่าสุด</Text>
                  <View style={styles.assessmentGrid}>
                    <View style={[styles.assessmentCard, { borderLeftColor: severityColor(selectedClient.latestPHQ9.severity) }]}>
                      <Text style={styles.assessmentCardTitle}>PHQ-9 ซึมเศร้า</Text>
                      <Text style={[styles.assessmentCardScore, { color: severityColor(selectedClient.latestPHQ9.severity) }]}>
                        {selectedClient.latestPHQ9.score}/27
                      </Text>
                      <Badge label={selectedClient.latestPHQ9.severity} color={severityColor(selectedClient.latestPHQ9.severity)} size="small" />
                    </View>
                    <View style={[styles.assessmentCard, { borderLeftColor: severityColor(selectedClient.latestGAD7.severity) }]}>
                      <Text style={styles.assessmentCardTitle}>GAD-7 วิตกกังวล</Text>
                      <Text style={[styles.assessmentCardScore, { color: severityColor(selectedClient.latestGAD7.severity) }]}>
                        {selectedClient.latestGAD7.score}/21
                      </Text>
                      <Badge label={selectedClient.latestGAD7.severity} color={severityColor(selectedClient.latestGAD7.severity)} size="small" />
                    </View>
                  </View>

                  {/* Recent Sessions */}
                  <Text style={styles.sectionTitle}>ประวัติล่าสุด</Text>
                  {selectedClient.recentSessions.length === 0 ? (
                    <Text style={styles.noData}>ยังไม่มีบันทึก</Text>
                  ) : selectedClient.recentSessions.map((s, i) => (
                    <View key={i} style={styles.historyItem}>
                      <Text style={styles.historyDate}>{format(new Date(s.date), 'dd MMM yyyy')}</Text>
                      <Text style={styles.historyProblem}>{s.problem}</Text>
                      <View style={styles.historyTechs}>
                        {s.techniques.map((t) => (
                          <View key={t} style={styles.techChip}><Text style={styles.techChipText}>{t}</Text></View>
                        ))}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  clientCard: { marginBottom: 12 },
  clientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.secondaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.secondary },
  clientName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  clientEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  clientMeta: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
  assessmentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderRadius: 10, padding: 10 },
  assessmentBadge: { flex: 1, alignItems: 'center' },
  assessmentDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  assessmentLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  assessmentValue: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.secondaryLight, justifyContent: 'center', alignItems: 'center' },
  modalAvatarText: { fontSize: 22, fontWeight: '700', color: Colors.secondary },
  modalName: { fontSize: 18, fontWeight: '700', color: Colors.text },
  modalEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 12, alignItems: 'center' },
  statBoxValue: { fontSize: 16, fontWeight: '800', color: Colors.primaryDark },
  statBoxLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  assessmentGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  assessmentCard: { flex: 1, backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 12, borderLeftWidth: 4 },
  assessmentCardTitle: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  assessmentCardScore: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  noData: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  historyItem: { backgroundColor: Colors.surfaceAlt, borderRadius: 10, padding: 12, marginBottom: 8 },
  historyDate: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  historyProblem: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  historyTechs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  techChip: { backgroundColor: Colors.primary + '18', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  techChipText: { fontSize: 11, color: Colors.primaryDark, fontWeight: '600' },
});
