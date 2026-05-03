const { getDb } = require('../models/db');

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function scorePHQ9(answers) {
  const score = answers.reduce((s, a) => s + a, 0);
  if (score <= 4) return { score, severity: 'น้อยมาก', interpretation: 'ผลการประเมินอยู่ในระดับปกติ ดูแลสุขภาพจิตต่อไป' };
  if (score <= 9) return { score, severity: 'น้อย', interpretation: 'แนะนำให้ติดตามอาการและดูแลตนเอง' };
  if (score <= 14) return { score, severity: 'ปานกลาง', interpretation: 'แนะนำให้ปรึกษาผู้เชี่ยวชาญด้านสุขภาพจิต' };
  if (score <= 19) return { score, severity: 'ค่อนข้างรุนแรง', interpretation: 'ควรพบนักจิตวิทยาหรือจิตแพทย์โดยเร็ว' };
  return { score, severity: 'รุนแรง', interpretation: 'ควรพบจิตแพทย์ทันที' };
}

function scoreGAD7(answers) {
  const score = answers.reduce((s, a) => s + a, 0);
  if (score <= 4) return { score, severity: 'น้อยมาก', interpretation: 'ระดับความวิตกกังวลอยู่ในเกณฑ์ปกติ' };
  if (score <= 9) return { score, severity: 'น้อย', interpretation: 'มีความวิตกกังวลเล็กน้อย แนะนำเทคนิคผ่อนคลาย' };
  if (score <= 14) return { score, severity: 'ปานกลาง', interpretation: 'ควรปรึกษาผู้เชี่ยวชาญด้านสุขภาพจิต' };
  return { score, severity: 'รุนแรง', interpretation: 'ควรพบจิตแพทย์เพื่อการรักษา' };
}

function scoreSWLS(answers) {
  const score = answers.reduce((s, a) => s + (a + 1), 0);
  if (score <= 9) return { score, severity: 'ต่ำมาก', interpretation: 'ไม่พึงพอใจในชีวิตอย่างมาก ควรขอความช่วยเหลือ' };
  if (score <= 14) return { score, severity: 'ต่ำ', interpretation: 'ไม่พึงพอใจในชีวิต แนะนำให้ปรึกษาผู้เชี่ยวชาญ' };
  if (score <= 19) return { score, severity: 'ปานกลาง-ต่ำ', interpretation: 'ค่อนข้างไม่พึงพอใจในชีวิต' };
  if (score <= 24) return { score, severity: 'ปานกลาง', interpretation: 'พึงพอใจในชีวิตในระดับปานกลาง' };
  if (score <= 29) return { score, severity: 'สูง', interpretation: 'พึงพอใจในชีวิตในระดับสูง' };
  return { score, severity: 'สูงมาก', interpretation: 'พึงพอใจในชีวิตอย่างมาก ยอดเยี่ยม!' };
}

exports.getResults = (req, res) => {
  const db = getDb();
  const results = db.prepare(
    'SELECT * FROM assessment_results WHERE user_id = ? ORDER BY taken_at DESC'
  ).all(req.user.id);
  return res.json({
    results: results.map((r) => ({
      id: r.id, type: r.type, score: r.score,
      severity: r.severity, interpretation: r.interpretation,
      takenAt: r.taken_at,
    })),
  });
};

exports.submit = (req, res) => {
  const { type, answers } = req.body;
  if (!type || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบ' });
  }
  if (!['PHQ9', 'GAD7', 'SWLS'].includes(type)) {
    return res.status(400).json({ message: 'ประเภทแบบประเมินไม่ถูกต้อง' });
  }

  let scored;
  if (type === 'PHQ9') scored = scorePHQ9(answers);
  else if (type === 'GAD7') scored = scoreGAD7(answers);
  else scored = scoreSWLS(answers);

  const db = getDb();
  const id = genId();
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO assessment_results (id, user_id, type, answers, score, severity, interpretation, taken_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.user.id, type, JSON.stringify(answers), scored.score, scored.severity, scored.interpretation, now);

  return res.status(201).json({
    result: { id, type, ...scored, takenAt: now },
  });
};
