import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import {
  PHQ9_QUESTIONS, GAD7_QUESTIONS, SWLS_QUESTIONS,
  scorePHQ9, scoreGAD7, scoreSWLS,
} from '../../constants/Assessments';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { format } from 'date-fns';
import type { AssessmentType, AssessmentQuestion } from '../../types';

const ASSESSMENT_LIST = [
  {
    type: 'PHQ9' as AssessmentType,
    title: 'PHQ-9',
    subtitle: 'ประเมินภาวะซึมเศร้า',
    description: 'แบบสอบถาม 9 ข้อ สำหรับคัดกรองภาวะซึมเศร้า',
    emoji: '😔',
    color: Colors.secondary,
    questions: PHQ9_QUESTIONS,
    maxScore: 27,
  },
  {
    type: 'GAD7' as AssessmentType,
    title: 'GAD-7',
    subtitle: 'ประเมินความวิตกกังวล',
    description: 'แบบสอบถาม 7 ข้อ สำหรับคัดกรองความวิตกกังวล',
    emoji: '😰',
    color: Colors.accent,
    questions: GAD7_QUESTIONS,
    maxScore: 21,
  },
  {
    type: 'SWLS' as AssessmentType,
    title: 'SWLS',
    subtitle: 'ความพึงพอใจในชีวิต',
    description: 'แบบวัด 5 ข้อ สำหรับประเมินความพึงพอใจในชีวิต',
    emoji: '🌟',
    color: Colors.primary,
    questions: SWLS_QUESTIONS,
    maxScore: 35,
  },
];

const MOCK_HISTORY = [
  { type: 'PHQ9', score: 8, severity: 'น้อย', color: Colors.mild, date: new Date(Date.now() - 7 * 86400000).toISOString() },
  { type: 'GAD7', score: 6, severity: 'น้อย', color: Colors.mild, date: new Date(Date.now() - 7 * 86400000).toISOString() },
  { type: 'PHQ9', score: 12, severity: 'ปานกลาง', color: Colors.moderate, date: new Date(Date.now() - 14 * 86400000).toISOString() },
  { type: 'SWLS', score: 24, severity: 'ปานกลาง', color: Colors.mild, date: new Date(Date.now() - 14 * 86400000).toISOString() },
];

export default function AssessmentsScreen() {
  const insets = useSafeAreaInsets();
  const [taking, setTaking] = useState<(typeof ASSESSMENT_LIST)[0] | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState<any | null>(null);
  const [history, setHistory] = useState(MOCK_HISTORY);

  const startAssessment = (a: (typeof ASSESSMENT_LIST)[0]) => {
    setTaking(a);
    setAnswers(new Array(a.questions.length).fill(-1));
    setCurrentQ(0);
    setResult(null);
  };

  const selectAnswer = (idx: number) => {
    const updated = [...answers];
    updated[currentQ] = idx;
    setAnswers(updated);
  };

  const goNext = () => {
    if (currentQ < taking!.questions.length - 1) setCurrentQ((q) => q + 1);
    else submitAssessment();
  };

  const goPrev = () => setCurrentQ((q) => q - 1);

  const submitAssessment = () => {
    if (!taking) return;
    let res: any;
    if (taking.type === 'PHQ9') res = scorePHQ9(answers);
    else if (taking.type === 'GAD7') res = scoreGAD7(answers);
    else res = scoreSWLS(answers);
    const historyEntry = {
      type: taking.type,
      score: res.score,
      severity: res.severity || res.level,
      color: res.color,
      date: new Date().toISOString(),
    };
    setHistory((h) => [historyEntry, ...h]);
    setResult(res);
  };

  const currentAnswer = taking ? answers[currentQ] : -1;
  const progress = taking ? (currentQ / taking.questions.length) : 0;
  const allAnswered = taking ? answers.every((a) => a >= 0) : false;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="แบบประเมิน" subtitle="ประเมินสุขภาพจิต" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {/* Assessment Cards */}
        <Text style={styles.sectionTitle}>แบบประเมินที่มีให้</Text>
        <View style={styles.assessmentList}>
          {ASSESSMENT_LIST.map((a) => (
            <Card key={a.type} style={styles.assessmentCard}>
              <View style={styles.assessmentCardRow}>
                <View style={[styles.assessmentEmoji, { backgroundColor: a.color + '20' }]}>
                  <Text style={styles.emojiText}>{a.emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.assessmentTitle}>{a.title} – {a.subtitle}</Text>
                  <Text style={styles.assessmentDesc}>{a.description}</Text>
                  <Text style={styles.assessmentMeta}>{a.questions.length} ข้อ · คะแนนเต็ม {a.maxScore}</Text>
                </View>
              </View>
              <Button
                title={`เริ่มทำแบบประเมิน ${a.title}`}
                onPress={() => startAssessment(a)}
                variant="outline"
                fullWidth
                size="small"
                style={{ marginTop: 12 }}
              />
            </Card>
          ))}
        </View>

        {/* History */}
        {history.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>ประวัติการประเมิน</Text>
            {history.map((h, i) => (
              <View key={i} style={styles.historyItem}>
                <View style={[styles.historyDot, { backgroundColor: h.color }]} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.historyType}>{h.type}</Text>
                  <Text style={styles.historyDate}>{format(new Date(h.date), 'dd MMM yyyy')}</Text>
                </View>
                <Text style={[styles.historyScore, { color: h.color }]}>{h.score}</Text>
                <Badge label={h.severity} color={h.color} size="small" style={{ marginLeft: 8 }} />
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Assessment Modal */}
      <Modal visible={!!taking && !result} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            {taking && (
              <>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${((currentQ + 1) / taking.questions.length) * 100}%`, backgroundColor: taking.color }]} />
                  </View>
                  <Text style={styles.progressText}>{currentQ + 1}/{taking.questions.length}</Text>
                </View>

                <Text style={styles.questionTitle}>{taking.title} – {taking.subtitle}</Text>
                <Text style={styles.questionText}>{taking.questions[currentQ].text}</Text>

                <View style={styles.optionsContainer}>
                  {taking.questions[currentQ].options.map((opt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.option, currentAnswer === idx && styles.optionSelected]}
                      onPress={() => selectAnswer(idx)}
                    >
                      <View style={[styles.optionRadio, currentAnswer === idx && { backgroundColor: taking.color, borderColor: taking.color }]}>
                        {currentAnswer === idx && <View style={styles.optionRadioFill} />}
                      </View>
                      <Text style={[styles.optionText, currentAnswer === idx && { color: taking.color, fontWeight: '700' }]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.navButtons}>
                  <Button
                    title="ย้อนกลับ"
                    onPress={goPrev}
                    variant="ghost"
                    disabled={currentQ === 0}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title={currentQ === taking.questions.length - 1 ? 'ส่งคำตอบ' : 'ถัดไป'}
                    onPress={goNext}
                    disabled={currentAnswer === -1}
                    style={{ flex: 2 }}
                  />
                </View>

                <TouchableOpacity onPress={() => setTaking(null)} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>ยกเลิก</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal visible={!!result} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.resultModal, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={styles.resultEmoji}>
              {result?.score <= 4 || result?.score >= 25 ? '🌟' : result?.score <= 9 ? '😊' : result?.score <= 14 ? '😐' : '😟'}
            </Text>
            <Text style={styles.resultTitle}>ผลการประเมิน {taking?.title}</Text>
            <Text style={[styles.resultScore, { color: result?.color || Colors.primary }]}>
              {result?.score} / {taking?.maxScore}
            </Text>
            <View style={[styles.resultSeverityBadge, { backgroundColor: (result?.color || Colors.primary) + '20' }]}>
              <Text style={[styles.resultSeverity, { color: result?.color || Colors.primary }]}>
                {result?.severity || result?.level}
              </Text>
            </View>
            <Text style={styles.resultInterpretation}>
              {result?.recommendation || result?.interpretation}
            </Text>
            <Button
              title="เสร็จสิ้น"
              onPress={() => { setResult(null); setTaking(null); }}
              fullWidth
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  assessmentList: { gap: 12, marginBottom: 20 },
  assessmentCard: {},
  assessmentCardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  assessmentEmoji: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  emojiText: { fontSize: 26 },
  assessmentTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  assessmentDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 3, lineHeight: 16 },
  assessmentMeta: { fontSize: 11, color: Colors.textLight, marginTop: 4 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  historyDot: { width: 10, height: 10, borderRadius: 5 },
  historyType: { fontSize: 14, fontWeight: '700', color: Colors.text },
  historyDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  historyScore: { fontSize: 18, fontWeight: '800' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '92%' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  progressBar: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', width: 36 },
  questionTitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 12 },
  questionText: { fontSize: 17, fontWeight: '700', color: Colors.text, lineHeight: 26, marginBottom: 20 },
  optionsContainer: { gap: 10, marginBottom: 24 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optionRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  optionRadioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.white },
  optionText: { fontSize: 14, color: Colors.text, flex: 1 },
  navButtons: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: Colors.textSecondary, fontSize: 13 },
  // Result
  resultModal: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, alignItems: 'center' },
  resultEmoji: { fontSize: 64, marginBottom: 12 },
  resultTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  resultScore: { fontSize: 52, fontWeight: '800', marginBottom: 10 },
  resultSeverityBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  resultSeverity: { fontSize: 18, fontWeight: '700' },
  resultInterpretation: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
});
