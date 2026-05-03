import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { format, subDays } from 'date-fns';

const { width } = Dimensions.get('window');

const MOOD_COLORS: Record<number, string> = {
  1: '#E53935', 2: '#FF7043', 3: '#FFA726', 4: '#AED581', 5: '#66BB6A',
};
const MOOD_EMOJI: Record<number, string> = {
  1: '😢', 2: '😞', 3: '😐', 4: '🙂', 5: '😊',
};

// Generate 14 days of mock mood data
const MOOD_DATA = Array.from({ length: 14 }, (_, i) => ({
  date: subDays(new Date(), 13 - i).toISOString(),
  mood: [3, 3, 4, 2, 3, 4, 4, 5, 4, 3, 4, 5, 4, 4][i],
}));

const ASSESSMENT_TREND = {
  PHQ9: [
    { date: subDays(new Date(), 28).toISOString(), score: 16 },
    { date: subDays(new Date(), 21).toISOString(), score: 14 },
    { date: subDays(new Date(), 14).toISOString(), score: 12 },
    { date: subDays(new Date(), 7).toISOString(), score: 10 },
    { date: new Date().toISOString(), score: 8 },
  ],
  GAD7: [
    { date: subDays(new Date(), 28).toISOString(), score: 13 },
    { date: subDays(new Date(), 21).toISOString(), score: 11 },
    { date: subDays(new Date(), 14).toISOString(), score: 10 },
    { date: subDays(new Date(), 7).toISOString(), score: 8 },
    { date: new Date().toISOString(), score: 6 },
  ],
};

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'mood' | 'assessment'>('mood');

  const avgMood = (MOOD_DATA.reduce((s, d) => s + d.mood, 0) / MOOD_DATA.length).toFixed(1);
  const latestMood = MOOD_DATA[MOOD_DATA.length - 1].mood;

  const MoodBarChart = () => {
    const barWidth = (width - 72) / MOOD_DATA.length - 4;
    return (
      <View style={styles.chartContainer}>
        <View style={styles.yAxis}>
          {[5, 4, 3, 2, 1].map((n) => (
            <Text key={n} style={styles.yLabel}>{MOOD_EMOJI[n]}</Text>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.barsContainer}>
            <View style={styles.gridLines}>
              {[1, 2, 3, 4, 5].map((n) => (
                <View key={n} style={styles.gridLine} />
              ))}
            </View>
            <View style={styles.bars}>
              {MOOD_DATA.map((d, i) => {
                const heightPct = (d.mood / 5) * 100;
                return (
                  <View key={i} style={styles.barWrapper}>
                    <View style={[styles.bar, { height: `${heightPct}%` as any, backgroundColor: MOOD_COLORS[d.mood], width: Math.max(barWidth, 20) }]} />
                    <Text style={styles.barLabel}>{format(new Date(d.date), 'dd')}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const TrendChart = ({ data, color, maxScore }: { data: { date: string; score: number }[]; color: string; maxScore: number }) => {
    const chartWidth = (width - 80) * 0.9;
    const chartHeight = 100;
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * chartWidth,
      y: chartHeight - (d.score / maxScore) * chartHeight,
      score: d.score,
    }));

    return (
      <View style={styles.trendContainer}>
        <View style={{ height: chartHeight + 20, width: chartWidth }}>
          {/* Simple dot+line chart using Views */}
          {points.map((p, i) => (
            <View key={i}>
              {i > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    left: points[i - 1].x,
                    top: points[i - 1].y + 10,
                    width: Math.sqrt(Math.pow(p.x - points[i - 1].x, 2) + Math.pow(p.y - points[i - 1].y, 2)),
                    height: 2,
                    backgroundColor: color + '60',
                    transform: [{ rotate: `${Math.atan2(p.y - points[i - 1].y, p.x - points[i - 1].x) * (180 / Math.PI)}deg` }],
                    transformOrigin: '0 50%',
                  }}
                />
              )}
              <View
                style={{
                  position: 'absolute',
                  left: p.x - 6,
                  top: p.y + 4,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: color,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: Colors.white, fontSize: 8, fontWeight: '800' }}>{p.score}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.trendLabels}>
          {data.map((d, i) => (
            <Text key={i} style={styles.trendLabel}>{format(new Date(d.date), 'dd/M')}</Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="ความคืบหน้า" subtitle="ติดตามสุขภาพจิต" />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'mood' && styles.tabActive]} onPress={() => setActiveTab('mood')}>
          <Text style={[styles.tabText, activeTab === 'mood' && styles.tabTextActive]}>อารมณ์</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'assessment' && styles.tabActive]} onPress={() => setActiveTab('assessment')}>
          <Text style={[styles.tabText, activeTab === 'assessment' && styles.tabTextActive]}>แบบประเมิน</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
        {activeTab === 'mood' ? (
          <>
            {/* Mood Summary */}
            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryEmoji}>{MOOD_EMOJI[Math.round(Number(avgMood))]}</Text>
                <Text style={styles.summaryValue}>{avgMood}</Text>
                <Text style={styles.summaryLabel}>เฉลี่ย 14 วัน</Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryEmoji}>{MOOD_EMOJI[latestMood]}</Text>
                <Text style={[styles.summaryValue, { color: MOOD_COLORS[latestMood] }]}>{latestMood}/5</Text>
                <Text style={styles.summaryLabel}>ล่าสุด</Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryEmoji}>📈</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>+0.5</Text>
                <Text style={styles.summaryLabel}>แนวโน้ม</Text>
              </Card>
            </View>

            {/* Mood Chart */}
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>อารมณ์ 14 วันที่ผ่านมา</Text>
              <MoodBarChart />
            </Card>

            {/* Mood Log */}
            <Text style={styles.sectionTitle}>บันทึกรายวัน</Text>
            {[...MOOD_DATA].reverse().slice(0, 7).map((d, i) => (
              <View key={i} style={styles.moodLogItem}>
                <View style={[styles.moodLogDot, { backgroundColor: MOOD_COLORS[d.mood] }]} />
                <Text style={styles.moodLogDate}>{format(new Date(d.date), 'dd MMM')}</Text>
                <Text style={styles.moodLogEmoji}>{MOOD_EMOJI[d.mood]}</Text>
                <View style={styles.moodLogBarBg}>
                  <View style={[styles.moodLogBarFill, { width: `${(d.mood / 5) * 100}%`, backgroundColor: MOOD_COLORS[d.mood] }]} />
                </View>
                <Text style={[styles.moodLogValue, { color: MOOD_COLORS[d.mood] }]}>{d.mood}/5</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            {/* PHQ-9 Trend */}
            <Card style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendTitle}>PHQ-9 ภาวะซึมเศร้า</Text>
                <Badge label="ดีขึ้น ↓8" color={Colors.success} size="small" />
              </View>
              <View style={styles.trendScores}>
                <View>
                  <Text style={styles.trendScoreLabel}>เริ่มต้น</Text>
                  <Text style={[styles.trendScoreValue, { color: Colors.moderatelySevere }]}>16</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={Colors.textSecondary} />
                <View>
                  <Text style={styles.trendScoreLabel}>ล่าสุด</Text>
                  <Text style={[styles.trendScoreValue, { color: Colors.mild }]}>8</Text>
                </View>
              </View>
              <TrendChart data={ASSESSMENT_TREND.PHQ9} color={Colors.secondary} maxScore={27} />
            </Card>

            {/* GAD-7 Trend */}
            <Card style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendTitle}>GAD-7 ความวิตกกังวล</Text>
                <Badge label="ดีขึ้น ↓7" color={Colors.success} size="small" />
              </View>
              <View style={styles.trendScores}>
                <View>
                  <Text style={styles.trendScoreLabel}>เริ่มต้น</Text>
                  <Text style={[styles.trendScoreValue, { color: Colors.moderatelySevere }]}>13</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={Colors.textSecondary} />
                <View>
                  <Text style={styles.trendScoreLabel}>ล่าสุด</Text>
                  <Text style={[styles.trendScoreValue, { color: Colors.mild }]}>6</Text>
                </View>
              </View>
              <TrendChart data={ASSESSMENT_TREND.GAD7} color={Colors.accent} maxScore={21} />
            </Card>

            {/* Progress Summary */}
            <Card style={styles.progressSummary} variant="flat">
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <Text style={styles.progressSummaryText}>
                คุณมีความคืบหน้าที่ดีมาก! คะแนนรวมดีขึ้น 30% จากการเริ่มต้นใช้บริการ
              </Text>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginTop: 12, marginBottom: 4, backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: Colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.text },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, alignItems: 'center', padding: 12 },
  summaryEmoji: { fontSize: 24, marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: '800', color: Colors.text },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  chartCard: { marginBottom: 20 },
  chartTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  chartContainer: { flexDirection: 'row', height: 120 },
  yAxis: { width: 24, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, marginRight: 4 },
  yLabel: { fontSize: 10 },
  barsContainer: { flex: 1, position: 'relative' },
  gridLines: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 20, justifyContent: 'space-between' },
  gridLine: { height: 1, backgroundColor: Colors.border },
  bars: { position: 'absolute', bottom: 20, left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  barWrapper: { alignItems: 'center', flex: 1 },
  bar: { borderRadius: 4, minWidth: 18 },
  barLabel: { fontSize: 9, color: Colors.textLight, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  moodLogItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  moodLogDot: { width: 8, height: 8, borderRadius: 4 },
  moodLogDate: { fontSize: 12, color: Colors.textSecondary, width: 46 },
  moodLogEmoji: { fontSize: 16, width: 20 },
  moodLogBarBg: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  moodLogBarFill: { height: '100%', borderRadius: 4 },
  moodLogValue: { fontSize: 12, fontWeight: '700', width: 28, textAlign: 'right' },
  trendCard: { marginBottom: 16 },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  trendTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  trendScores: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  trendScoreLabel: { fontSize: 11, color: Colors.textSecondary },
  trendScoreValue: { fontSize: 22, fontWeight: '800' },
  trendContainer: { height: 130 },
  trendLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  trendLabel: { fontSize: 10, color: Colors.textSecondary },
  progressSummary: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  progressSummaryText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
